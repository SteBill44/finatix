CREATE OR REPLACE FUNCTION public.lesson_is_taught(p_content text, p_video_url text)
RETURNS boolean LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  select length(coalesce(p_content,'')) >= 1500
      or (coalesce(p_video_url,'') <> '' and p_video_url not ilike '%example.com%')
$$;

-- Internal, provisional launch checks only. Not CIMA requirements and not proof of academic quality.
CREATE OR REPLACE FUNCTION public.evaluate_course_readiness(
  p_lesson_records int, p_taught_lessons int, p_questions int, p_usable_mocks int, p_is_case_study boolean)
RETURNS boolean LANGUAGE sql IMMUTABLE SET search_path = public AS $$
  select not coalesce(p_is_case_study,false)
     and p_lesson_records > 0
     and p_taught_lessons >= p_lesson_records
     and p_questions >= 100
     and p_usable_mocks >= 1
$$;

DROP FUNCTION IF EXISTS public.get_course_content_status();
CREATE FUNCTION public.get_course_content_status()
RETURNS TABLE(course_id uuid, is_free boolean, lesson_records integer, substantive_lessons integer, videos integer, questions integer, downloads integer, placeholder_downloads integer, mock_exams integer, usable_mocks integer, editorially_approved boolean, prerequisites_met boolean, on_sale boolean, taught_lessons integer, is_case_study boolean, blocked_reason text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $function$
  with base as (
    select c.id, (c.price = 0) as is_free,
      (c.slug ilike '%case-study%') as is_case_study,
      (select count(*)::int from lessons l where l.course_id=c.id) as lesson_records,
      (select count(*)::int from lessons l where l.course_id=c.id and length(coalesce(l.content,'')) >= 1500) as substantive_lessons,
      (select count(*)::int from lessons l where l.course_id=c.id and coalesce(l.video_url,'') <> '' and l.video_url not ilike '%example.com%') as videos,
      (select count(distinct l.id)::int from lessons l where l.course_id=c.id and public.lesson_is_taught(l.content, l.video_url)) as taught_lessons,
      (select count(*)::int from quiz_questions q join quizzes z on z.id=q.quiz_id where z.course_id=c.id) as questions,
      (select count(*)::int from lesson_resources r join lessons l on l.id=r.lesson_id where l.course_id=c.id and r.file_url not ilike '%example.com%' and coalesce(r.file_url,'')<>'') as downloads,
      (select count(*)::int from lesson_resources r join lessons l on l.id=r.lesson_id where l.course_id=c.id and (r.file_url ilike '%example.com%' or coalesce(r.file_url,'')='')) as placeholder_downloads,
      (select count(*)::int from quizzes z where z.course_id=c.id and z.quiz_type='mock_exam') as mock_exams,
      (select count(*)::int from quizzes z where z.course_id=c.id and z.quiz_type='mock_exam'
         and (select count(*) from quiz_questions q where q.quiz_id=z.id) >= 20) as usable_mocks,
      coalesce((select a.approved from course_editorial_approvals a where a.course_id=c.id), false) as editorially_approved
    from courses c
  ), ev as (
    select b.*, public.evaluate_course_readiness(b.lesson_records, b.taught_lessons, b.questions, b.usable_mocks, b.is_case_study) as prereq
    from base b
  )
  select id, is_free, lesson_records, substantive_lessons, videos, questions, downloads, placeholder_downloads,
    mock_exams, usable_mocks, editorially_approved, prereq, (editorially_approved and prereq),
    taught_lessons, is_case_study,
    case when is_case_study then 'case_study_policy_pending' end
  from ev
$function$;

GRANT EXECUTE ON FUNCTION public.get_course_content_status() TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.lesson_is_taught(text, text) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.evaluate_course_readiness(int,int,int,int,boolean) TO anon, authenticated, service_role;