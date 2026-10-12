# CodeMaster AI - Implementation Plan & Roadmap

## 1. Project Overview & Acceptance Goals

CodeMaster AI is a full-stack developer learning platform. The implementation must deliver a functional, tested application with:
- React + TypeScript + Tailwind CSS + Monaco Editor frontend.
- FastAPI backend with modular services (Analysis, Execution, AI, Auth, Data).
- Supabase SQL schema with migrations, RLS policies, and seed data.
- True pre-execution static analysis with normalized diagnostics.
- Isolated sandbox code execution (Judge0 client with fallback handling).
- AI Tutor service with structured explanation, hint progression, and minimal fix diffs.
- End-to-end testing suite (Frontend Vitest, Backend Pytest, Integration test suite).

---

## 2. Phased Implementation Roadmap

### Phase 1: Environment Scaffolding & Foundation Setup
- [x] Workspace inspection and tooling verification (Node v24, npm 11, Python 3.10).
- [x] Architecture (`docs/ARCHITECTURE.md`) and Implementation Plan (`docs/IMPLEMENTATION_PLAN.md`).
- [ ] Backend scaffolding:
  - `requirements.txt` with FastAPI, Pydantic, Uvicorn, httpx, pyflakes, pytest, python-dotenv, etc.
  - App structure: `backend/app/{api, core, services, models}`.
  - Basic `/api/v1/health` endpoint.
- [ ] Frontend scaffolding:
  - Vite + React + TypeScript in `frontend/`.
  - Tailwind CSS configuration with dark-first theme and custom developer design system.
  - Lucide icons, Monaco editor `@monaco-editor/react`, routing setup (`react-router-dom`).
  - Core layouts, navbar, footer, theme provider.

### Phase 2: Supabase Database Schema & Migrations
- [ ] Create `supabase/migrations/001_initial_schema.sql`:
  - Tables: `profiles`, `languages`, `courses`, `lessons`, `lesson_progress`, `quizzes`, `quiz_attempts`, `problems`, `test_cases`, `code_projects`, `submissions`, `analysis_reports`.
  - Foreign keys, cascading constraints, indexes on user IDs and slug/status fields.
  - Row Level Security (RLS) policies for user data isolation.
- [ ] Create `supabase/migrations/002_seed_data.sql`:
  - Real courses (Python Fundamentals, Modern JavaScript, Modern C++).
  - Rich lessons with sample code, syntax explanations, and quiz questions.
  - Challenge problems with public and hidden test cases.
- [ ] Create backend DB repository layer with Supabase client integration + graceful offline/mock store mode for zero-credential development.

### Phase 3: Core Pre-Execution Static Analysis Pipeline
- [ ] Backend Static Analysis Service (`backend/app/services/analyzer.py`):
  - Python: AST compilation check, syntax error line/col parsing, Pyflakes linter for undefined names and unused variables.
  - JavaScript: Node CLI check / JavaScript syntax validator for syntax and parsing errors.
  - C++: Lexical and structural compiler preflight validator with bracket/type/semicolon analysis.
  - Unified `Diagnostic` schema: `severity`, `line`, `column`, `error_code`, `message`, `source`.
- [ ] Endpoint `POST /api/v1/analyze`:
  - Strict input validation, size limits, execution preflight status (`can_execute: bool`).
  - Unit tests in `tests/test_analyzer.py`.

### Phase 4: Secure Code Execution Service (Judge0 Sandbox)
- [ ] Backend Execution Service (`backend/app/services/executor.py`):
  - Judge0 REST client: submission creation, polling status, fetching stdout/stderr/time/memory.
  - Timeout and size limits (max 5s, max 128MB, input/output caps).
  - Safe fallback runner / mock sandbox when Judge0 API key is unconfigured.
  - Error status differentiation: syntax error, compile error, runtime error, time limit exceeded, memory limit exceeded.
- [ ] Endpoint `POST /api/v1/execute`:
  - Request validation and preflight gatekeeper (blocks execution if blocking syntax error exists).
  - Endpoint `POST /api/v1/problems/{id}/submit`:
    - Executes against all problem test cases (public and hidden).

### Phase 5: AI Coding Tutor Service
- [ ] Backend AI Tutor Service (`backend/app/services/ai_tutor.py`):
  - Prompts and response parsers for:
    1. Diagnostic root cause & beginner explanation.
    2. Progressive hints (Level 1: Concept, Level 2: Target area, Level 3: Concrete fix hint).
    3. Line-by-line code explanation.
    4. Minimal suggested fix diff.
  - Safe fallback AI educator response engine when external LLM API key is pending.
- [ ] Endpoint `POST /api/v1/ai/tutor`:
  - Actions: `explain_diagnostic`, `get_hint`, `explain_code`, `suggest_fix`.

### Phase 6: Frontend Pages & Monaco Editor Studio
- [ ] Monaco Editor Component (`frontend/src/components/editor/`):
  - Integrated syntax highlighting, language selector (Python, JS, C++), code runner, analyzer.
  - Monaco markers rendering from API diagnostics.
  - Diff view / Apply Suggested Fix button.
  - Panels: Editor, Diagnostics, AI Explanation, Input (stdin), Output (stdout/stderr).
- [ ] Full Platform Pages:
  1. `LandingPage`: Hero, product features, language badges, interactive preview, learning pathways.
  2. `AuthPages`: Login, Signup, Session state with Supabase Auth.
  3. `DashboardPage`: Personalized learner stats, progress tracker, continue learning card, recent projects.
  4. `LanguageExplorerPage`: Language deep-dive, features, cheat sheets, syntax comparison.
  5. `CoursePage` & `LessonPage`: Structured modules, rich lesson content, runnable code widgets, interactive quizzes.
  6. `CompilerPage`: Full-screen professional IDE with multi-panel layout, preflight checking, execution, and project saving.
  7. `AITutorPage`: Standalone AI tutoring lab with chat, code analyzer, and hint generator.
  8. `ChallengesPage` & `ChallengeDetailPage`: Problem statements, test cases runner, submission scorecard.
  9. `ProfilePage`: User profile, saved projects manager, achievements, performance analytics.

### Phase 7: Verification, Testing & Documentation
- [ ] Frontend tests (`frontend/src/__tests__/`): Vitest + Testing Library for Editor, Preflight parser, Navigation.
- [ ] Backend tests (`backend/tests/`): Pytest suite covering `/health`, `/analyze`, `/execute`, `/ai/tutor`.
- [ ] End-to-end integration test runner (`tests/run_all_tests.py` or bash/powershell script).
- [ ] Documentation: `.env.example`, `README.md` with complete local startup and deployment guide.
