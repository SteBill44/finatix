
INSERT INTO quizzes (course_id, lesson_id, title, quiz_type, order_index)
SELECT 
  l.course_id,
  l.id as lesson_id,
  l.title || ' Quiz' as title,
  'lesson_quiz' as quiz_type,
  l.order_index
FROM lessons l
WHERE l.course_id IN (
  '38a997a6-a331-4483-9f4a-9cde94875c35',
  'a7826e26-b927-46d8-b931-3d9535b1f508',
  '0ca960fe-b517-43d2-ab8c-e899f47f73f8',
  '227939d9-f671-49fb-abb1-148bf585f042',
  'bb32ba37-20b6-46a2-8d82-629209ea5d05',
  '68680c18-6c01-4d34-ac65-fae952fd796d',
  'd272da7b-75b7-4f91-8c2a-b13d5aaa8005',
  '9b41db68-c68b-43fd-a3a3-d5385da216d4',
  '0e6023d0-a51b-4b20-a232-a6af69929f64',
  'd1f670fb-2e38-4c25-bf27-b8afb12f96d7',
  'cf78b273-d7f0-4b8b-930b-92cb6543523d'
)
AND NOT EXISTS (
  SELECT 1 FROM quizzes q 
  WHERE q.lesson_id = l.id 
  AND q.quiz_type = 'lesson_quiz'
)
ORDER BY l.course_id, l.order_index;
