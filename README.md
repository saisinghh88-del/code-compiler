# CodeMaster AI 🚀

CodeMaster AI is a production-grade coding education platform designed for beginner, intermediate, and advanced developers. It provides interactive curriculum pathways, coding challenges, a **pre-execution static analysis engine** that catches syntax errors before running, an **AI-powered diagnostic tutor**, and **secure sandbox execution**.

---

## 🌟 Key Features

1. **Pre-Execution Static Analysis Pipeline**:
   - Analyzes code using genuine AST parsing, language linters (`pyflakes`, Node.js V8 parser, C++ compile checks).
   - Normalizes diagnostics into `severity`, `line`, `column`, `error_code`, `message`, and `source`.
   - Renders Monaco markers on exact error coordinates before execution.
   - Halts runtime execution when blocking syntax errors exist.
   - Accurately displays `"No issues detected by available checks"` when clean.

2. **Progressive AI Coding Tutor**:
   - Structured diagnostic explanation and root-cause determination.
   - **3-Tier Progressive Hints**: Level 1 (Conceptual), Level 2 (Target location), Level 3 (Concrete fix).
   - Minimal surgical patches that learners review and explicitly apply into the Monaco editor with one click.
   - Line-by-line code structure breakdown.

3. **Secure Sandbox Code Execution**:
   - Remote code execution integrated through FastAPI using **Judge0 API**.
   - Enforced CPU limits (5s max), memory limits (128 MB), and disabled network access.
   - Isolated fallback container runner for zero-friction local development when Judge0 API keys are pending.

4. **Industrial-Grade Monaco Editor**:
   - Python 3, JavaScript (Node.js), and C++20 support.
   - Resizable panels: Editor, Preflight Diagnostics, AI Tutor, and Output Terminal with standard input (`stdin`) tab.
   - Keyboard shortcuts: `Ctrl+Enter` to Run, `Ctrl+Shift+A` to Analyze.

5. **Curriculum & Algorithmic Problem Solving**:
   - Course lessons with runnable code snippets and interactive checkpoint quizzes.
   - Problem challenges evaluated against both public and hidden test case suites.
   - User workspaces, XP tracking, and streak analytics.

---

## 📐 Architecture & Repository Structure

```
codemaster-ai/
├── backend/
│   ├── app/
│   │   ├── api/v1/          # Versioned REST endpoints (health, analyze, execute, ai/tutor, etc.)
│   │   ├── core/            # Config settings and JWT authentication
│   │   ├── models/          # Pydantic v2 schemas and data validation
│   │   └── services/        # Analyzer, Executor (Judge0), AI Tutor, DB service
│   ├── tests/               # Backend Pytest test suite
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── components/      # Monaco editor, diagnostics panel, AI tutor panel, navbar
│   │   ├── context/         # AuthContext and ThemeContext (Dark/Light mode)
│   │   ├── pages/           # Landing, Compiler, Dashboard, Courses, Challenges, Profile
│   │   └── services/        # Typed API and Supabase client
│   └── package.json
├── supabase/
│   └── migrations/
│       ├── 001_initial_schema.sql  # PostgreSQL schema with RLS policies and triggers
│       └── 002_seed_data.sql       # Seed curriculum, languages, quizzes, and problems
├── tests/
│   └── test_e2e_integration.py     # End-to-end integration test suite
├── docs/
│   ├── ARCHITECTURE.md             # System architecture & security specification
│   └── IMPLEMENTATION_PLAN.md      # Implementation roadmap
├── .env.example                    # Environment variable template with placeholders
├── pytest.ini                      # Pytest runner configuration
└── README.md
```

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **Python**: 3.10+
- **npm** or **pnpm**

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(The platform operates with offline/sandbox simulation out-of-the-box if external API keys are not yet provided).*

### 3. Backend Setup
```bash
# Navigate to backend and install requirements
pip install -r backend/requirements.txt

# Start the FastAPI backend server
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000 --reload
```
API Documentation will be live at: `http://127.0.0.1:8000/api/v1/docs`

### 4. Frontend Setup
```bash
# In another terminal, navigate to frontend
cd frontend
npm install

# Start Vite dev server
npm run dev
```
Open your browser at: `http://127.0.0.1:5173/`

---

## 🧪 Running Automated Tests

### Backend Unit Tests:
```bash
python -m pytest backend/tests/
```

### End-to-End API Integration Tests:
```bash
python -m pytest tests/test_e2e_integration.py
```

### Frontend Unit & Component Tests:
```bash
cd frontend
npm run test
```

### Frontend Production Build Verification:
```bash
cd frontend
npm run build
```

---

## 🔐 Security & Sandbox Guarantees

1. **Untrusted Code Isolation**:
   - Submitted code is never executed inside the FastAPI host process.
   - Code runs via isolated Judge0 containers with timeouts (5s max) and memory bounds (128 MB).
2. **Deterministic Preflight Checks**:
   - Confirmed syntax and compilation errors block execution by default to prevent wasteful container spin-ups.
3. **No Automatic Code Execution**:
   - AI recommendations require explicit review and manual application by the learner.
4. **Row-Level Security (RLS)**:
   - Supabase PostgreSQL policies strictly isolate private workspaces, quiz attempts, and submission logs to authenticated owners. Hidden challenge test cases are never readable from the client anon key.

---

## 🚢 Deployment

- **Frontend**: Deploy `frontend/` to **Vercel** with build command `npm run build` and output directory `dist`.
- **Backend**: Deploy `backend/` to any Python-compatible container host (AWS ECS, Google Cloud Run, Railway, or Render) using `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
- **Database**: Apply migrations in `supabase/migrations/` to your Supabase project dashboard or Supabase CLI.
