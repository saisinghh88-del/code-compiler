-- ============================================================================
-- CodeMaster AI - Migration 001: Initial Core Schema & Row Level Security
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    bio TEXT,
    role TEXT NOT NULL DEFAULT 'learner' CHECK (role IN ('learner', 'instructor', 'admin')),
    xp_points INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Supported Programming Languages
CREATE TABLE IF NOT EXISTS public.languages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    file_extension TEXT NOT NULL,
    judge0_id INTEGER NOT NULL,
    monaco_id TEXT NOT NULL,
    icon TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    starter_code TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Courses
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    language_id UUID NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    level TEXT NOT NULL CHECK (level IN ('beginner', 'intermediate', 'advanced')),
    order_index INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. Lessons
CREATE TABLE IF NOT EXISTS public.lessons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL,
    content_markdown TEXT NOT NULL,
    code_snippet TEXT,
    initial_code TEXT,
    solution_code TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(course_id, slug)
);

-- 5. User Lesson Progress
CREATE TABLE IF NOT EXISTS public.lesson_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
    last_code TEXT,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(user_id, lesson_id)
);

-- 6. Quizzes
CREATE TABLE IF NOT EXISTS public.quizzes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lesson_id UUID NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    options_json JSONB NOT NULL,
    correct_option_index INTEGER NOT NULL,
    explanation TEXT NOT NULL,
    points INTEGER NOT NULL DEFAULT 10,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. Quiz Attempts
CREATE TABLE IF NOT EXISTS public.quiz_attempts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    quiz_id UUID NOT NULL REFERENCES public.quizzes(id) ON DELETE CASCADE,
    selected_option_index INTEGER NOT NULL,
    is_correct BOOLEAN NOT NULL,
    points_awarded INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. Coding Challenges / Problems
CREATE TABLE IF NOT EXISTS public.problems (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    language_id UUID NOT NULL REFERENCES public.languages(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    difficulty TEXT NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
    description TEXT NOT NULL,
    starter_code TEXT NOT NULL,
    solution_code TEXT,
    constraints TEXT,
    hints_json JSONB DEFAULT '[]'::jsonb,
    order_index INTEGER NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 9. Test Cases for Problems
CREATE TABLE IF NOT EXISTS public.test_cases (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
    input_data TEXT NOT NULL DEFAULT '',
    expected_output TEXT NOT NULL,
    is_hidden BOOLEAN NOT NULL DEFAULT false,
    explanation TEXT,
    order_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 10. Code Projects (Saved Workspaces)
CREATE TABLE IF NOT EXISTS public.code_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    language_id UUID NOT NULL REFERENCES public.languages(id) ON DELETE RESTRICT,
    source_code TEXT NOT NULL,
    is_public BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 11. Challenge Submissions
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
    language_id UUID NOT NULL REFERENCES public.languages(id) ON DELETE RESTRICT,
    source_code TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('passed', 'failed', 'compile_error', 'runtime_error', 'time_limit_exceeded')),
    test_results_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    execution_time_ms NUMERIC(10, 2),
    memory_kb INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 12. Preflight Analysis Reports
CREATE TABLE IF NOT EXISTS public.analysis_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    language_id UUID NOT NULL REFERENCES public.languages(id) ON DELETE RESTRICT,
    code_hash TEXT NOT NULL,
    diagnostics_json JSONB NOT NULL DEFAULT '[]'::jsonb,
    ai_explanation_json JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- ============================================================================
-- Indexes for High Performance
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_courses_language_id ON public.courses(language_id);
CREATE INDEX IF NOT EXISTS idx_lessons_course_id ON public.lessons(course_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_user ON public.lesson_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_lesson_progress_lesson ON public.lesson_progress(lesson_id);
CREATE INDEX IF NOT EXISTS idx_quizzes_lesson ON public.quizzes(lesson_id);
CREATE INDEX IF NOT EXISTS idx_problems_language ON public.problems(language_id);
CREATE INDEX IF NOT EXISTS idx_test_cases_problem ON public.test_cases(problem_id);
CREATE INDEX IF NOT EXISTS idx_code_projects_user ON public.code_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user_problem ON public.submissions(user_id, problem_id);

-- ============================================================================
-- Row Level Security (RLS) Setup
-- ============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.problems ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.test_cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.code_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analysis_reports ENABLE ROW LEVEL SECURITY;

-- 1. Profiles: Public read, owner update
CREATE POLICY "Public profiles are viewable by everyone" 
ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- 2. Languages: Public read
CREATE POLICY "Languages are readable by all users" 
ON public.languages FOR SELECT USING (is_active = true);

-- 3. Courses: Public read published
CREATE POLICY "Published courses are readable by all" 
ON public.courses FOR SELECT USING (is_published = true);

-- 4. Lessons: Public read published
CREATE POLICY "Published lessons are readable by all" 
ON public.lessons FOR SELECT USING (is_published = true);

-- 5. Lesson Progress: User isolated
CREATE POLICY "Users can read own lesson progress" 
ON public.lesson_progress FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own lesson progress" 
ON public.lesson_progress FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own lesson progress" 
ON public.lesson_progress FOR UPDATE USING (auth.uid() = user_id);

-- 6. Quizzes: Public read for published lessons
CREATE POLICY "Quizzes are readable by authenticated learners" 
ON public.quizzes FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.lessons WHERE lessons.id = quizzes.lesson_id AND lessons.is_published = true)
);

-- 7. Quiz Attempts: User isolated
CREATE POLICY "Users can view own quiz attempts" 
ON public.quiz_attempts FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can record own quiz attempts" 
ON public.quiz_attempts FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 8. Problems: Public read published
CREATE POLICY "Published problems are viewable by all" 
ON public.problems FOR SELECT USING (is_published = true);

-- 9. Test Cases: Public read for NON-HIDDEN test cases only!
-- Hidden test cases are strictly shielded from learners and evaluated server-side.
CREATE POLICY "Learners can view public test cases" 
ON public.test_cases FOR SELECT USING (is_hidden = false);

-- 10. Code Projects: Owner access + Public projects viewable
CREATE POLICY "Users can view own or public projects" 
ON public.code_projects FOR SELECT USING (auth.uid() = user_id OR is_public = true);

CREATE POLICY "Users can manage own code projects" 
ON public.code_projects FOR ALL USING (auth.uid() = user_id);

-- 11. Submissions: User isolated
CREATE POLICY "Users can view own submissions" 
ON public.submissions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own submissions" 
ON public.submissions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 12. Analysis Reports: User isolated or anonymous session viewable
CREATE POLICY "Users can view own analysis reports" 
ON public.analysis_reports FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can save analysis reports" 
ON public.analysis_reports FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- ============================================================================
-- Profile Creation Trigger on Supabase Auth SignUp
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, full_name, avatar_url)
    VALUES (
        new.id,
        COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
        COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
        new.raw_user_meta_data->>'avatar_url'
    );
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
