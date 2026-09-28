create or replace function public.get_course_content_status()
returns table(course_id uuid, lessons integer, lessons_with_content integer, videos integer, questions integer, resources integer)
language sql stable security definer set search_path = public as $$
  select c.id,
    (select count(*)::int from lessons l where l.course_id=c.id),
    (select count(*)::int from lessons l where l.course_id=c.id and length(coalesce(l.content,''))>=500),
    (select count(*)::int from lessons l where l.course_id=c.id and l.video_url is not null and l.video_url<>''),
    (select count(*)::int from quiz_questions q join quizzes z on z.id=q.quiz_id where z.course_id=c.id),
    (select count(*)::int from lesson_resources r join lessons l on l.id=r.lesson_id where l.course_id=c.id)
  from courses c
$$;
grant execute on function public.get_course_content_status() to anon, authenticated;