
-- Create referral_codes table for unique user referral codes
CREATE TABLE public.referral_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  code VARCHAR(12) NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create referrals table to track who referred whom
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL,
  referred_id UUID NOT NULL UNIQUE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  reward_claimed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Create referral_rewards table to track earned rewards
CREATE TABLE public.referral_rewards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  referral_id UUID NOT NULL REFERENCES public.referrals(id) ON DELETE CASCADE,
  reward_type VARCHAR(50) NOT NULL DEFAULT 'credit',
  reward_value INTEGER NOT NULL DEFAULT 1,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_rewards ENABLE ROW LEVEL SECURITY;

-- RLS policies for referral_codes
CREATE POLICY "Users can view their own referral code"
  ON public.referral_codes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own referral code"
  ON public.referral_codes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- RLS policies for referrals
CREATE POLICY "Users can view referrals they made"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referrer_id);

CREATE POLICY "Users can view if they were referred"
  ON public.referrals FOR SELECT
  USING (auth.uid() = referred_id);

-- RLS policies for referral_rewards
CREATE POLICY "Users can view their own rewards"
  ON public.referral_rewards FOR SELECT
  USING (auth.uid() = user_id);

-- Function to generate a unique referral code
CREATE OR REPLACE FUNCTION public.generate_referral_code()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- Generate a random 8-character alphanumeric code
    new_code := upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM referral_codes WHERE code = new_code) INTO code_exists;
    
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  RETURN new_code;
END;
$$;

-- Function to get or create referral code for user
CREATE OR REPLACE FUNCTION public.get_or_create_referral_code(p_user_id UUID)
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_code TEXT;
  new_code TEXT;
BEGIN
  -- Check for existing code
  SELECT code INTO existing_code FROM referral_codes WHERE user_id = p_user_id;
  
  IF existing_code IS NOT NULL THEN
    RETURN existing_code;
  END IF;
  
  -- Generate new code
  new_code := generate_referral_code();
  
  -- Insert new code
  INSERT INTO referral_codes (user_id, code) VALUES (p_user_id, new_code);
  
  RETURN new_code;
END;
$$;

-- Function to apply referral code during signup
CREATE OR REPLACE FUNCTION public.apply_referral_code(p_referred_id UUID, p_code TEXT)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  referrer_user_id UUID;
  new_referral_id UUID;
BEGIN
  -- Find the referrer by code
  SELECT user_id INTO referrer_user_id FROM referral_codes WHERE code = upper(p_code);
  
  IF referrer_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Invalid referral code');
  END IF;
  
  -- Check if user is trying to refer themselves
  IF referrer_user_id = p_referred_id THEN
    RETURN json_build_object('success', false, 'error', 'Cannot use your own referral code');
  END IF;
  
  -- Check if user was already referred
  IF EXISTS(SELECT 1 FROM referrals WHERE referred_id = p_referred_id) THEN
    RETURN json_build_object('success', false, 'error', 'User already has a referrer');
  END IF;
  
  -- Create the referral
  INSERT INTO referrals (referrer_id, referred_id, status)
  VALUES (referrer_user_id, p_referred_id, 'pending')
  RETURNING id INTO new_referral_id;
  
  RETURN json_build_object('success', true, 'referral_id', new_referral_id);
END;
$$;

-- Function to complete referral and award rewards (called when referred user completes first course/lesson)
CREATE OR REPLACE FUNCTION public.complete_referral(p_referred_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  ref_record RECORD;
BEGIN
  -- Find pending referral
  SELECT * INTO ref_record FROM referrals 
  WHERE referred_id = p_referred_id AND status = 'pending';
  
  IF ref_record IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'No pending referral found');
  END IF;
  
  -- Update referral status
  UPDATE referrals SET status = 'completed', completed_at = now()
  WHERE id = ref_record.id;
  
  -- Award reward to referrer
  INSERT INTO referral_rewards (user_id, referral_id, reward_type, reward_value, description)
  VALUES (ref_record.referrer_id, ref_record.id, 'credit', 1, 'Referral bonus - friend completed first lesson');
  
  -- Award reward to referred user too
  INSERT INTO referral_rewards (user_id, referral_id, reward_type, reward_value, description)
  VALUES (p_referred_id, ref_record.id, 'credit', 1, 'Welcome bonus - signed up with referral');
  
  RETURN json_build_object('success', true);
END;
$$;

-- Function to get referral stats for a user
CREATE OR REPLACE FUNCTION public.get_referral_stats(p_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  stats JSON;
BEGIN
  SELECT json_build_object(
    'totalReferrals', (SELECT COUNT(*) FROM referrals WHERE referrer_id = p_user_id),
    'pendingReferrals', (SELECT COUNT(*) FROM referrals WHERE referrer_id = p_user_id AND status = 'pending'),
    'completedReferrals', (SELECT COUNT(*) FROM referrals WHERE referrer_id = p_user_id AND status = 'completed'),
    'totalCredits', (SELECT COALESCE(SUM(reward_value), 0) FROM referral_rewards WHERE user_id = p_user_id),
    'referralCode', (SELECT code FROM referral_codes WHERE user_id = p_user_id)
  ) INTO stats;
  
  RETURN stats;
END;
$$;

-- Create indexes for performance
CREATE INDEX idx_referral_codes_code ON public.referral_codes(code);
CREATE INDEX idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_referred_id ON public.referrals(referred_id);
CREATE INDEX idx_referral_rewards_user_id ON public.referral_rewards(user_id);
