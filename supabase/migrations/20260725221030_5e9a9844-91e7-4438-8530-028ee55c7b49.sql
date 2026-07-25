
-- 1. Referral RPCs: enforce auth.uid() ownership
CREATE OR REPLACE FUNCTION public.get_referral_stats(p_user_id uuid)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE stats JSON; v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL OR p_user_id <> v_uid THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  SELECT json_build_object(
    'totalReferrals', (SELECT COUNT(*) FROM referrals WHERE referrer_id = v_uid),
    'pendingReferrals', (SELECT COUNT(*) FROM referrals WHERE referrer_id = v_uid AND status = 'pending'),
    'completedReferrals', (SELECT COUNT(*) FROM referrals WHERE referrer_id = v_uid AND status = 'completed'),
    'totalCredits', (SELECT COALESCE(SUM(reward_value), 0) FROM referral_rewards WHERE user_id = v_uid),
    'referralCode', (SELECT code FROM referral_codes WHERE user_id = v_uid)
  ) INTO stats;
  RETURN stats;
END; $$;

CREATE OR REPLACE FUNCTION public.get_or_create_referral_code(p_user_id uuid)
RETURNS text LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE existing_code TEXT; new_code TEXT; v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL OR p_user_id <> v_uid THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  SELECT code INTO existing_code FROM referral_codes WHERE user_id = v_uid;
  IF existing_code IS NOT NULL THEN RETURN existing_code; END IF;
  new_code := generate_referral_code();
  INSERT INTO referral_codes (user_id, code) VALUES (v_uid, new_code);
  RETURN new_code;
END; $$;

CREATE OR REPLACE FUNCTION public.apply_referral_code(p_referred_id uuid, p_code text)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE referrer_user_id UUID; new_referral_id UUID; v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL OR p_referred_id <> v_uid THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  SELECT user_id INTO referrer_user_id FROM referral_codes WHERE code = upper(p_code);
  IF referrer_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Invalid referral code');
  END IF;
  IF referrer_user_id = v_uid THEN
    RETURN json_build_object('success', false, 'error', 'Cannot use your own referral code');
  END IF;
  IF EXISTS(SELECT 1 FROM referrals WHERE referred_id = v_uid) THEN
    RETURN json_build_object('success', false, 'error', 'User already has a referrer');
  END IF;
  INSERT INTO referrals (referrer_id, referred_id, status)
  VALUES (referrer_user_id, v_uid, 'pending')
  RETURNING id INTO new_referral_id;
  RETURN json_build_object('success', true, 'referral_id', new_referral_id);
END; $$;

CREATE OR REPLACE FUNCTION public.complete_referral(p_referred_id uuid)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE ref_record RECORD; v_uid uuid := auth.uid();
BEGIN
  IF v_uid IS NULL OR p_referred_id <> v_uid THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  SELECT * INTO ref_record FROM referrals WHERE referred_id = v_uid AND status = 'pending';
  IF ref_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'No pending referral found');
  END IF;
  UPDATE referrals SET status = 'completed', completed_at = now() WHERE id = ref_record.id;
  INSERT INTO referral_rewards (user_id, referral_id, reward_type, reward_value, description)
  VALUES (ref_record.referrer_id, ref_record.id, 'credit', 1, 'Referral bonus - friend completed first lesson');
  INSERT INTO referral_rewards (user_id, referral_id, reward_type, reward_value, description)
  VALUES (v_uid, ref_record.id, 'credit', 1, 'Welcome bonus - signed up with referral');
  RETURN json_build_object('success', true);
END; $$;

-- 2. Fix search_path on functions missing it
ALTER FUNCTION public.get_quiz_with_questions(uuid, uuid) SET search_path = public;
ALTER FUNCTION public.get_lesson_detail_with_context(uuid, uuid) SET search_path = public;
ALTER FUNCTION public.get_course_detail_with_progress(uuid, uuid) SET search_path = public;

-- 3. Site settings: restrict read to authenticated
DROP POLICY IF EXISTS "Site settings are readable by everyone" ON public.site_settings;
CREATE POLICY "Authenticated users can read site settings"
  ON public.site_settings FOR SELECT TO authenticated USING (true);
REVOKE SELECT ON public.site_settings FROM anon;

-- 4. Discussion posts: only enrolled users (or admins) can read
DROP POLICY IF EXISTS "Authenticated users can view discussion posts" ON public.discussion_posts;
CREATE POLICY "Enrolled users can view discussion posts"
  ON public.discussion_posts FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR is_master_admin(auth.uid())
    OR EXISTS (
      SELECT 1 FROM enrollments e WHERE e.user_id = auth.uid() AND e.course_id = discussion_posts.course_id
    )
  );

-- 5. Discussion votes: only owner sees their votes
DROP POLICY IF EXISTS "Users can view votes" ON public.discussion_votes;
CREATE POLICY "Users can view their own votes"
  ON public.discussion_votes FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 6. User badges: only owner sees
DROP POLICY IF EXISTS "Users can view all earned badges" ON public.user_badges;
CREATE POLICY "Users can view their own badges"
  ON public.user_badges FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 7. Avatars bucket: prevent listing via storage API (public URLs still work)
DROP POLICY IF EXISTS "Avatars are publicly accessible" ON storage.objects;
CREATE POLICY "Users can read their own avatar files"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'avatars' AND (auth.uid())::text = (storage.foldername(name))[1]);

-- 8. Defense-in-depth trigger: only master_admin can grant master_admin
CREATE OR REPLACE FUNCTION public.enforce_role_assignment()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.role = 'master_admin'::app_role AND NOT public.is_master_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only master_admin can grant master_admin role';
  END IF;
  RETURN NEW;
END; $$;
REVOKE EXECUTE ON FUNCTION public.enforce_role_assignment() FROM PUBLIC, anon, authenticated;

DROP TRIGGER IF EXISTS enforce_role_assignment_trg ON public.user_roles;
CREATE TRIGGER enforce_role_assignment_trg
  BEFORE INSERT OR UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.enforce_role_assignment();

-- 9. Revoke EXECUTE on internal SECURITY DEFINER helpers not meant for direct client calls
REVOKE EXECUTE ON FUNCTION public.generate_referral_code() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.cleanup_rate_limits() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.check_rate_limit(uuid, text, integer, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.log_profile_access(uuid, text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_deck_card_count() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;

-- verify_certificate is intentionally callable by anon for the public verify page.
-- has_role / is_master_admin / has_attempted_quiz are used inside RLS policies and other
-- definer functions, so they remain executable by anon/authenticated.
