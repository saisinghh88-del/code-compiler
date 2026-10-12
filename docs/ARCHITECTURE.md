# CodeMaster AI - Architecture Document

## 1. System Overview

CodeMaster AI is a production-oriented, full-stack programming education platform designed for learners ranging from beginner to advanced. It combines interactive courseware, coding challenges, a real-time pre-execution static analysis pipeline, an AI-powered diagnostic tutor, and isolated sandboxed code execution.

```
+-----------------------------------------------------------------------------------------+
|                                    Frontend (Client)                                    |
|   React 18+ / TypeScript / Vite / Tailwind CSS / Monaco Editor                          |
|   - Landing & Course Explorer      - Full-Screen IDE (Monaco)                           |
|   - Interactive Lessons & Quizzes  - Preflight Diagnostics & AI Diff View              |
|   - Challenge Submissions          - User Dashboard & Analytics                         |
+-----------------------------------------------------------------------------------------+
                                    |                 |
                   Auth & Direct DB | (RLS)           | REST API (Analysis, AI, Execution)
                                    v                 v
+-------------------------------+          +----------------------------------------------+
|     Supabase Cloud / Local    |          |            FastAPI Backend Service           |
| - PostgreSQL with RLS         |          | - Versioned API: /api/v1/*                   |
| - GoTrue Authentication (JWT) |<-------->| - Static Analysis Engine (Python, JS, C++)   |
| - Storage & Realtime          |   Auth   | - AI Tutor Service (Structured Prompts)      |
| - Database Migrations         |   Verify | - Sandbox Orchestrator (Judge0 Client)       |
+-------------------------------+          +----------------------------------------------+
                                                              |
                                                              v
                                                   +----------------------+
                                                   | Judge0 Isolated API  |
                                                   | (Sandbox Execution)  |
                                                   +----------------------+
```

---

## 2. Key Architecture Principles

1. **Defense-in-Depth & Untrusted Code Isolation**:
   - Client code is never executed directly on the host or inside the main FastAPI server process.
   - All code execution is routed through the isolated execution provider (Judge0 API or isolated container sandbox) with strict memory, timeout, file size, and network restrictions.
2. **Deterministic Pre-Execution Static Analysis**:
   - Static analysis does not rely solely on LLMs. True language-level parsers and linters (Python AST + Pyflakes, Node syntax checker / JS linter, C++ syntax check) detect genuine syntax and lexical errors.
   - Diagnostics are normalized into a unified contract (`severity`, `line`, `column`, `error_code`, `message`, `source`).
   - The editor renders Monaco markers directly on offending code lines.
3. **Structured AI Explanations & Safe Patching**:
   - LLMs explain verified diagnostics and suggest minimal fixes.
   - Fixes are returned as structured diffs/suggestions that the learner must explicitly review and accept; no arbitrary automatic code execution.
4. **Zero Client Secret Exposure**:
   - Third-party API keys (LLM keys, Judge0 tokens, Supabase Service Role keys) are strictly contained within backend environment variables.
   - Frontend only accesses Supabase through the public anon key with Row Level Security (RLS) enforcement.

---

## 3. Technology Stack & Responsibilities

| Tier | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18, TypeScript, Vite | Fast SPA bundling, strict type safety, responsive component rendering. |
| **Styling & UI** | Tailwind CSS, Lucide React | Modern dark-first developer UI, responsive layouts, accessible controls. |
| **Code Editor** | Monaco Editor (`@monaco-editor/react`) | Industrial-grade code editing, syntax highlighting, diagnostic markers, minimap. |
| **Backend API** | FastAPI (Python 3.10+), Pydantic v2 | High-performance asynchronous REST endpoints, typed schemas, CORS, rate limiting. |
| **Static Analysis** | Python `ast` + `pyflakes`, Node.js CLI / JS Parser, C++ syntax validator | Genuine preflight compiler checks and static analysis. |
| **Code Sandbox** | Judge0 API (or compatible isolated worker) | Safe remote compilation and execution of C++, Python, and JavaScript code. |
| **AI Tutor Engine** | FastAPI AI Service (Google Gemini / OpenAI compatible) | Structured diagnostic explanations, line-by-line breakdowns, progressive hints. |
| **Database & Auth** | Supabase PostgreSQL + Auth (GoTrue) | Relational data model with Row Level Security, JWT session tokens, profiles. |
| **Testing** | Vitest, Pytest, Playwright / Integration scripts | Multi-tier test suite covering frontend, backend, and API pipelines. |

---

## 4. API Specification (`/api/v1`)

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/v1/health` | `GET` | Health check and external dependency status (DB, Judge0, AI). |
| `/api/v1/languages` | `GET` | Supported languages, versions, starter code templates. |
| `/api/v1/courses` | `GET` | Available courses, modules, and lesson listings. |
| `/api/v1/analyze` | `POST` | Pre-execution static analysis and diagnostic normalization. |
| `/api/v1/execute` | `POST` | Dispatch code execution to sandbox, poll/wait for output with limits. |
| `/api/v1/ai/tutor` | `POST` | AI diagnostic explanation, hint progression, line-by-line explanation. |
| `/api/v1/projects` | `GET`, `POST` | User's saved code projects (authenticated via JWT). |
| `/api/v1/projects/{id}` | `GET`, `PUT`, `DELETE` | Specific code project CRUD. |
| `/api/v1/problems/{id}/submit` | `POST` | Submit solution for challenge problem against hidden test cases. |
| `/api/v1/submissions/{id}` | `GET` | Retrieve challenge submission outcome and test results. |
| `/api/v1/progress/{lesson_id}` | `PUT` | Update lesson completion state and quiz score for user. |

---

## 5. Security & Threat Modeling

1. **Remote Code Execution (RCE) on Host**:
   - Submit programs strictly through external containerized sandbox (Judge0).
   - Time limit: default 5s (max 10s).
   - Memory limit: default 128MB.
   - Network disabled during untrusted program execution.
2. **Injection Attacks in AI Service**:
   - User code and comments are treated as untrusted data in LLM prompts.
   - Prompts use system instruction boundaries and require structured JSON output conforming to Pydantic schemas.
3. **Database Authorization (Cross-tenant leakage)**:
   - Supabase Row Level Security (RLS) is applied to all sensitive tables (`profiles`, `code_projects`, `lesson_progress`, `submissions`, `analysis_reports`).
   - Hidden test cases (`is_hidden = true`) and solution answer keys are never accessible by client anon tokens; backend access uses service key or dedicated RPCs.
4. **Rate Limiting & Abuse Prevention**:
   - Backend implements endpoint-level rate limiting on `/analyze`, `/execute`, and `/ai/tutor`.
