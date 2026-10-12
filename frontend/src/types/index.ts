export type LanguageSlug = 'python' | 'javascript' | 'cpp';

export interface SyntaxAnatomyItem {
  token: string;
  label: string;
  status: 'valid' | 'missing' | 'unexpected' | 'unresolved';
  role: 'keyword' | 'identifier' | 'delimiter' | 'expression' | 'scope';
}

export interface ErrorBlueprint {
  title: string;
  grammar_rule: string;
  parser_stage: string;
  expected_token?: string;
  actual_token?: string;
  impact: string;
  canonical_spec: string;
  anatomy: SyntaxAnatomyItem[];
  correction_schematic?: string;
}

export interface Diagnostic {
  severity: 'error' | 'warning' | 'info';
  line: number;
  column: number;
  end_line?: number;
  end_column?: number;
  error_code: string;
  message: string;
  source: string;
  suggested_fix?: string;
  blueprint?: ErrorBlueprint;
}

export interface AnalysisResponse {
  can_execute: boolean;
  has_blocking_errors: boolean;
  diagnostics: Diagnostic[];
  summary: string;
  checked_at: string;
  language: string;
}

export interface ExecutionResponse {
  status: 'passed' | 'failed' | 'compile_error' | 'runtime_error' | 'time_limit_exceeded' | 'blocked';
  stdout?: string | null;
  stderr?: string | null;
  compile_output?: string | null;
  exit_code?: number | null;
  execution_time_ms?: number | null;
  memory_kb?: number | null;
  sandbox_provider: string;
  preflight_passed: boolean;
  diagnostics: Diagnostic[];
}

export interface LineExplanation {
  line: number;
  code: string;
  explanation: string;
}

export interface AITutorResponse {
  action: string;
  title: string;
  explanation: string;
  likely_cause?: string | null;
  hint?: string | null;
  suggested_fix?: string | null;
  suggested_patch?: string | null;
  line_explanations?: LineExplanation[] | null;
}

export interface LanguageItem {
  id: string;
  name: string;
  slug: LanguageSlug;
  file_extension: string;
  judge0_id: number;
  monaco_id: string;
  icon: string;
  starter_code: string;
}

export interface QuizItem {
  id: string;
  question: string;
  options: string[];
  points: number;
}

export interface QuizAnswerResult {
  quiz_id: string;
  is_correct: boolean;
  explanation: string;
  points_awarded: number;
}

export interface LessonItem {
  id: string;
  course_id: string;
  title: string;
  slug: string;
  content_markdown: string;
  code_snippet?: string;
  initial_code?: string;
  solution_code?: string;
  order_index: number;
  quizzes: QuizItem[];
}

export interface CourseItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  language_slug: LanguageSlug;
  lesson_count: number;
  lessons?: LessonItem[];
}

export interface TestCaseItem {
  id: string;
  input_data: string;
  expected_output: string;
  is_hidden: boolean;
  explanation?: string;
}

export interface ProblemItem {
  id: string;
  title: string;
  slug: string;
  difficulty: 'easy' | 'medium' | 'hard';
  language: string;
  description: string;
  starter_code: string;
  constraints?: string;
  hints: string[];
  public_test_cases: TestCaseItem[];
}

export interface TestResultDetail {
  test_case_id: string;
  input: string;
  expected: string;
  actual?: string | null;
  passed: boolean;
  is_hidden: boolean;
  runtime_ms?: number | null;
  error?: string | null;
}

export interface ProblemSubmissionResponse {
  submission_id: string;
  problem_id: string;
  status: 'passed' | 'failed' | 'compile_error' | 'runtime_error';
  passed_tests: number;
  total_tests: number;
  results: TestResultDetail[];
  execution_time_ms: number;
  memory_kb: number;
}

export interface ProjectItem {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  language: string;
  source_code: string;
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  email: string;
  username: string;
  full_name: string;
  avatar_url?: string;
  bio?: string;
  xp_points: number;
  role: 'learner' | 'instructor' | 'admin';
}
