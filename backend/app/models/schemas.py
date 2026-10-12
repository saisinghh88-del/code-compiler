from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

# --- Diagnostics & Static Analysis ---
class SyntaxAnatomyItem(BaseModel):
    token: str
    label: str
    status: str = Field(..., description="'valid', 'missing', 'unexpected', or 'unresolved'")
    role: str = Field(..., description="'keyword', 'identifier', 'delimiter', 'expression', or 'scope'")

class ErrorBlueprint(BaseModel):
    title: str = Field("Syntax Architecture Blueprint")
    grammar_rule: str = Field(..., description="Formal language grammar rule violated")
    parser_stage: str = Field(..., description="Compiler stage that caught the violation")
    expected_token: Optional[str] = None
    actual_token: Optional[str] = None
    impact: str = Field(..., description="Impact on bytecode generation and execution")
    canonical_spec: str = Field(..., description="Canonical standard code blueprint")
    anatomy: List[SyntaxAnatomyItem] = Field(default_factory=list)
    correction_schematic: Optional[str] = None

class Diagnostic(BaseModel):
    severity: str = Field(..., description="'error', 'warning', or 'info'")
    line: int = Field(..., description="1-indexed line number")
    column: int = Field(1, description="1-indexed column number")
    end_line: Optional[int] = None
    end_column: Optional[int] = None
    error_code: str = Field("E001", description="Identifier like 'SYNTAX_ERROR', 'UNDEFINED_VAR'")
    message: str = Field(..., description="Human-readable issue description")
    source: str = Field("static-analysis", description="'ast-parser', 'pyflakes', 'node-checker', 'cpp-syntax'")
    suggested_fix: Optional[str] = None
    blueprint: Optional[ErrorBlueprint] = None

class AnalysisRequest(BaseModel):
    language: str = Field(..., description="'python', 'javascript', or 'cpp'")
    source_code: str = Field(..., max_length=50000, description="Source code text (max 50KB)")

class AnalysisResponse(BaseModel):
    can_execute: bool = Field(..., description="True if no blocking syntax/compilation errors")
    has_blocking_errors: bool = Field(..., description="True if severity == 'error' exists")
    diagnostics: List[Diagnostic] = Field(default_factory=list)
    summary: str = Field("Analysis complete")
    checked_at: str
    language: str

# --- Code Execution ---
class ExecutionRequest(BaseModel):
    language: str = Field(..., description="'python', 'javascript', or 'cpp'")
    source_code: str = Field(..., max_length=50000)
    stdin: Optional[str] = Field(default="", max_length=10000)
    skip_preflight: bool = Field(default=False, description="Whether to bypass warning checks")

class ExecutionResponse(BaseModel):
    status: str = Field(..., description="'passed', 'failed', 'compile_error', 'runtime_error', 'time_limit_exceeded', 'blocked'")
    stdout: Optional[str] = None
    stderr: Optional[str] = None
    compile_output: Optional[str] = None
    exit_code: Optional[int] = None
    execution_time_ms: Optional[float] = None
    memory_kb: Optional[int] = None
    sandbox_provider: str = Field("Judge0 Isolated Container")
    preflight_passed: bool = True
    diagnostics: List[Diagnostic] = Field(default_factory=list)

# --- AI Coding Tutor ---
class AITutorRequest(BaseModel):
    action: str = Field("explain_diagnostic", description="'explain_diagnostic', 'get_hint', 'explain_code', 'suggest_fix'")
    language: str
    source_code: str = Field(..., max_length=50000)
    diagnostic: Optional[Diagnostic] = None
    hint_level: Optional[int] = Field(1, description="1: Conceptual, 2: Area focus, 3: Concrete pointer")
    context: Optional[str] = None

class LineExplanation(BaseModel):
    line: int
    code: str
    explanation: str

class AITutorResponse(BaseModel):
    action: str
    title: str = "AI Tutor Guidance"
    explanation: str
    likely_cause: Optional[str] = None
    hint: Optional[str] = None
    suggested_fix: Optional[str] = None
    suggested_patch: Optional[str] = None
    line_explanations: Optional[List[LineExplanation]] = None

# --- Languages, Courses, Lessons ---
class LanguageItem(BaseModel):
    id: str
    name: str
    slug: str
    file_extension: str
    judge0_id: int
    monaco_id: str
    icon: str
    starter_code: str

class QuizItem(BaseModel):
    id: str
    question: str
    options: List[str]
    points: int = 10

class QuizAnswerSubmit(BaseModel):
    quiz_id: str
    selected_option_index: int

class QuizAnswerResult(BaseModel):
    quiz_id: str
    is_correct: bool
    explanation: str
    points_awarded: int

class LessonItem(BaseModel):
    id: str
    course_id: str
    title: str
    slug: str
    content_markdown: str
    code_snippet: Optional[str] = None
    initial_code: Optional[str] = None
    solution_code: Optional[str] = None
    order_index: int
    quizzes: List[QuizItem] = Field(default_factory=list)

class CourseItem(BaseModel):
    id: str
    title: str
    slug: str
    description: str
    level: str
    language_slug: str
    lesson_count: int = 0
    lessons: Optional[List[LessonItem]] = None

# --- Code Projects ---
class ProjectCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    language: str
    source_code: str
    is_public: bool = False

class ProjectResponse(BaseModel):
    id: str
    user_id: str
    title: str
    description: Optional[str]
    language: str
    source_code: str
    is_public: bool
    created_at: str
    updated_at: str

# --- Coding Challenges / Problems ---
class TestCaseItem(BaseModel):
    id: str
    input_data: str
    expected_output: str
    is_hidden: bool = False
    explanation: Optional[str] = None

class ProblemItem(BaseModel):
    id: str
    title: str
    slug: str
    difficulty: str
    language: str
    description: str
    starter_code: str
    constraints: Optional[str]
    hints: List[str] = Field(default_factory=list)
    public_test_cases: List[TestCaseItem] = Field(default_factory=list)

class ProblemSubmissionRequest(BaseModel):
    source_code: str
    language: str

class TestResultDetail(BaseModel):
    test_case_id: str
    input: str
    expected: str
    actual: Optional[str]
    passed: bool
    is_hidden: bool
    runtime_ms: Optional[float] = None
    error: Optional[str] = None

class ProblemSubmissionResponse(BaseModel):
    submission_id: str
    problem_id: str
    status: str # 'passed', 'failed', 'compile_error', 'runtime_error'
    passed_tests: int
    total_tests: int
    results: List[TestResultDetail]
    execution_time_ms: float
    memory_kb: int

# --- Progress ---
class ProgressUpdate(BaseModel):
    status: str = Field("completed", description="'in_progress', 'completed'")
    last_code: Optional[str] = None
    quiz_score: Optional[int] = None
