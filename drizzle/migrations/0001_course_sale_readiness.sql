create table if not exists public.course_editorial_approvals (
  course_id uuid primary key references public.courses(id) on delete cascade,
  approved boolean not null default false,
  approved_by uuid,
  approved_at timestamptz,
  notes text,
  updated_at timestamptz not null default now()
);
grant select, insert, update, delete on public.course_editorial_approvals to authenticated;
grant all on public.course_editorial_approvals to service_role;
alter table public.course_editorial_approvals enable row level security;
create policy "Admins manage editorial approvals" on public.course_editorial_approvals
  for all to authenticated
  using (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'master_admin'))
  with check (public.has_role(auth.uid(),'admin') or public.has_role(auth.uid(),'master_admin'));

drop function if exists public.get_course_content_status();
create function public.get_course_content_status()
returns table(
  course_id uuid, is_free boolean, lesson_records integer, substantive_lessons integer,
  videos integer, questions integer, downloads integer, placeholder_downloads integer,
  mock_exams integer, usable_mocks integer, editorially_approved boolean,
  prerequisites_met boolean, on_sale boolean)
language sql stable security definer set search_path = public as $$
  with base as (
    select c.id, (c.price = 0) as is_free,
      (select count(*)::int from lessons l where l.course_id=c.id) as lesson_records,
      (select count(*)::int from lessons l where l.course_id=c.id and length(coalesce(l.content,'')) >= 1500) as substantive_lessons,
      (select count(*)::int from lessons l where l.course_id=c.id and coalesce(l.video_url,'') <> '' and l.video_url not ilike '%example.com%') as videos,
      (select count(*)::int from quiz_questions q join quizzes z on z.id=q.quiz_id where z.course_id=c.id) as questions,
      (select count(*)::int from lesson_resources r join lessons l on l.id=r.lesson_id where l.course_id=c.id and r.file_url not ilike '%example.com%' and coalesce(r.file_url,'')<>'') as downloads,
      (select count(*)::int from lesson_resources r join lessons l on l.id=r.lesson_id where l.course_id=c.id and (r.file_url ilike '%example.com%' or coalesce(r.file_url,'')='')) as placeholder_downloads,
      (select count(*)::int from quizzes z where z.course_id=c.id and z.quiz_type='mock_exam') as mock_exams,
      (select count(*)::int from quizzes z where z.course_id=c.id and z.quiz_type='mock_exam'
         and (select count(*) from quiz_questions q where q.quiz_id=z.id) >= 20) as usable_mocks,
      coalesce((select a.approved from course_editorial_approvals a where a.course_id=c.id), false) as editorially_approved
    from courses c
  )
  select b.id, b.is_free, b.lesson_records, b.substantive_lessons, b.videos, b.questions,
    b.downloads, b.placeholder_downloads, b.mock_exams, b.usable_mocks, b.editorially_approved,
    (b.lesson_records > 0
      and (b.substantive_lessons + b.videos) >= b.lesson_records
      and b.questions >= 100
      and b.usable_mocks >= 1) as prerequisites_met,
    (b.editorially_approved and b.lesson_records > 0
      and (b.substantive_lessons + b.videos) >= b.lesson_records
      and b.questions >= 100 and b.usable_mocks >= 1) as on_sale
  from base b
$$;
grant execute on function public.get_course_content_status() to anon, authenticated, service_role;