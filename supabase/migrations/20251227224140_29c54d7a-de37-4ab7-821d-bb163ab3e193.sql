-- Create quizzes table
CREATE TABLE public.quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create quiz questions table
CREATE TABLE public.quiz_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  options JSONB NOT NULL DEFAULT '[]',
  correct_answer INTEGER NOT NULL,
  explanation TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;

-- Public read access for quizzes and questions
CREATE POLICY "Quizzes are viewable by everyone" ON public.quizzes FOR SELECT USING (true);
CREATE POLICY "Quiz questions are viewable by everyone" ON public.quiz_questions FOR SELECT USING (true);

-- Insert sample quizzes for BA1 course
INSERT INTO public.quizzes (course_id, title, description, order_index)
SELECT id, 'Introduction to Business Quiz', 'Test your understanding of business fundamentals', 1
FROM public.courses WHERE slug = 'ba1';

INSERT INTO public.quizzes (course_id, title, description, order_index)
SELECT id, 'Management Principles Quiz', 'Assess your knowledge of core management concepts', 2
FROM public.courses WHERE slug = 'ba1';

-- Insert sample questions for the first quiz
INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer, explanation, order_index)
SELECT q.id, 
  'What is the primary purpose of a business organization?',
  '["To maximize employee satisfaction", "To create value and generate profit", "To minimize operational costs", "To comply with regulations"]'::jsonb,
  1,
  'The primary purpose of a business is to create value for stakeholders and generate sustainable profits.',
  1
FROM public.quizzes q
JOIN public.courses c ON q.course_id = c.id
WHERE c.slug = 'ba1' AND q.title = 'Introduction to Business Quiz';

INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer, explanation, order_index)
SELECT q.id,
  'Which of the following is NOT a key function of management?',
  '["Planning", "Organizing", "Entertainment", "Controlling"]'::jsonb,
  2,
  'The four key functions of management are Planning, Organizing, Leading, and Controlling. Entertainment is not a management function.',
  2
FROM public.quizzes q
JOIN public.courses c ON q.course_id = c.id
WHERE c.slug = 'ba1' AND q.title = 'Introduction to Business Quiz';

INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer, explanation, order_index)
SELECT q.id,
  'What does SWOT analysis stand for?',
  '["Strengths, Weaknesses, Opportunities, Threats", "Sales, Wages, Operations, Taxes", "Strategy, Workflow, Objectives, Targets", "Systems, Work, Output, Time"]'::jsonb,
  0,
  'SWOT stands for Strengths, Weaknesses, Opportunities, and Threats - a strategic planning technique.',
  3
FROM public.quizzes q
JOIN public.courses c ON q.course_id = c.id
WHERE c.slug = 'ba1' AND q.title = 'Introduction to Business Quiz';

INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer, explanation, order_index)
SELECT q.id,
  'Which organizational structure has a clear chain of command from top to bottom?',
  '["Matrix structure", "Flat structure", "Hierarchical structure", "Network structure"]'::jsonb,
  2,
  'A hierarchical structure features a clear chain of command with distinct levels of authority from top management to frontline employees.',
  4
FROM public.quizzes q
JOIN public.courses c ON q.course_id = c.id
WHERE c.slug = 'ba1' AND q.title = 'Introduction to Business Quiz';

INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer, explanation, order_index)
SELECT q.id,
  'What is the term for a companys reason for existence beyond making money?',
  '["Vision statement", "Mission statement", "Business plan", "Strategic objective"]'::jsonb,
  1,
  'A mission statement defines a companys purpose and primary objectives, explaining why it exists beyond just generating profit.',
  5
FROM public.quizzes q
JOIN public.courses c ON q.course_id = c.id
WHERE c.slug = 'ba1' AND q.title = 'Introduction to Business Quiz';

-- Insert questions for second quiz
INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer, explanation, order_index)
SELECT q.id,
  'Which management theory emphasizes efficiency through scientific methods?',
  '["Human Relations Theory", "Scientific Management", "Systems Theory", "Contingency Theory"]'::jsonb,
  1,
  'Scientific Management, developed by Frederick Taylor, emphasizes efficiency through systematic observation and analysis of work processes.',
  1
FROM public.quizzes q
JOIN public.courses c ON q.course_id = c.id
WHERE c.slug = 'ba1' AND q.title = 'Management Principles Quiz';

INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer, explanation, order_index)
SELECT q.id,
  'What leadership style involves making decisions without consulting team members?',
  '["Democratic", "Laissez-faire", "Autocratic", "Transformational"]'::jsonb,
  2,
  'Autocratic leadership involves making decisions without input from team members, with the leader having complete authority.',
  2
FROM public.quizzes q
JOIN public.courses c ON q.course_id = c.id
WHERE c.slug = 'ba1' AND q.title = 'Management Principles Quiz';

INSERT INTO public.quiz_questions (quiz_id, question, options, correct_answer, explanation, order_index)
SELECT q.id,
  'What is delegation in management?',
  '["Avoiding responsibility", "Assigning tasks and authority to subordinates", "Making all decisions yourself", "Reducing workforce"]'::jsonb,
  1,
  'Delegation is the process of assigning tasks and granting authority to subordinates while maintaining accountability.',
  3
FROM public.quizzes q
JOIN public.courses c ON q.course_id = c.id
WHERE c.slug = 'ba1' AND q.title = 'Management Principles Quiz';