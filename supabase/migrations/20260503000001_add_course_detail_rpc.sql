-- RPC to fetch course details with related data in one call
-- Reduces N+1 queries: course + lessons + progress + quizzes from 5+ queries to 1

create or replace function get_course_detail_with_progress(
  p_course_id uuid,
  p_user_id uuid default null
)
returns jsonb
language plpgsql
as $$
declare
  v_course jsonb;
  v_lessons jsonb;
  v_progress jsonb;
  v_quizzes jsonb;
begin
  -- Fetch course
  select jsonb_agg(row_to_json(c.*))
  into v_course
  from courses c
  where c.id = p_course_id;

  -- Fetch lessons
  select jsonb_agg(row_to_json(l.*))
  into v_lessons
  from lessons l
  where l.course_id = p_course_id
  order by l.order_index asc;

  -- Fetch user progress (if user provided)
  if p_user_id is not null then
    select jsonb_agg(row_to_json(lp.*))
    into v_progress
    from lesson_progress lp
    where lp.user_id = p_user_id
    and lp.lesson_id in (select id from lessons where course_id = p_course_id);
  else
    v_progress := 'null'::jsonb;
  end if;

  -- Fetch quizzes
  select jsonb_agg(row_to_json(q.*))
  into v_quizzes
  from quizzes q
  where q.course_id = p_course_id;

  return jsonb_build_object(
    'course', v_course,
    'lessons', v_lessons,
    'progress', v_progress,
    'quizzes', v_quizzes
  );
end;
$$;

-- RPC to fetch lesson with all related data
-- Reduces N+1 queries: lesson + course + progress + resources + quizzes from 6+ to 1

create or replace function get_lesson_detail_with_context(
  p_lesson_id uuid,
  p_user_id uuid default null
)
returns jsonb
language plpgsql
as $$
declare
  v_lesson jsonb;
  v_course jsonb;
  v_progress jsonb;
  v_resources jsonb;
  v_quizzes jsonb;
begin
  -- Fetch lesson
  select jsonb_agg(row_to_json(l.*))
  into v_lesson
  from lessons l
  where l.id = p_lesson_id;

  -- Fetch course
  select jsonb_agg(row_to_json(c.*))
  into v_course
  from courses c
  where c.id = (select course_id from lessons where id = p_lesson_id);

  -- Fetch user progress (if user provided)
  if p_user_id is not null then
    select jsonb_agg(row_to_json(lp.*))
    into v_progress
    from lesson_progress lp
    where lp.user_id = p_user_id
    and lp.lesson_id = p_lesson_id;
  else
    v_progress := 'null'::jsonb;
  end if;

  -- Fetch resources
  select jsonb_agg(row_to_json(r.*))
  into v_resources
  from resources r
  where r.lesson_id = p_lesson_id;

  -- Fetch quizzes for this lesson
  select jsonb_agg(row_to_json(q.*))
  into v_quizzes
  from quizzes q
  where q.lesson_id = p_lesson_id;

  return jsonb_build_object(
    'lesson', v_lesson,
    'course', v_course,
    'progress', v_progress,
    'resources', v_resources,
    'quizzes', v_quizzes
  );
end;
$$;

-- RPC to fetch quiz with questions and user answers
-- Reduces N+1 queries: quiz + questions + user answers from 3+ to 1

create or replace function get_quiz_with_questions(
  p_quiz_id uuid,
  p_user_id uuid default null
)
returns jsonb
language plpgsql
as $$
declare
  v_quiz jsonb;
  v_questions jsonb;
  v_user_answers jsonb;
begin
  -- Fetch quiz
  select jsonb_agg(row_to_json(q.*))
  into v_quiz
  from quizzes q
  where q.id = p_quiz_id;

  -- Fetch questions
  select jsonb_agg(row_to_json(qq.* order by qq.order_index))
  into v_questions
  from quiz_questions qq
  where qq.quiz_id = p_quiz_id
  order by qq.order_index asc;

  -- Fetch user answers (if user provided)
  if p_user_id is not null then
    select jsonb_agg(row_to_json(qa.*))
    into v_user_answers
    from quiz_answers qa
    where qa.user_id = p_user_id
    and qa.quiz_id = p_quiz_id;
  else
    v_user_answers := 'null'::jsonb;
  end if;

  return jsonb_build_object(
    'quiz', v_quiz,
    'questions', v_questions,
    'userAnswers', v_user_answers
  );
end;
$$;
