"""
CodeMaster AI - End-to-End Integration Test Suite
Validates the full API pipeline: Static Analysis, Isolated Sandbox, AI Tutor, Courses & Challenges.
"""

import sys
import os
import pytest
from fastapi.testclient import TestClient

# Ensure backend app is on sys.path
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend"))
if backend_path not in sys.path:
    sys.path.insert(0, backend_path)

from app.main import app

client = TestClient(app)

class TestCodeMasterE2E:

    def test_01_health_and_capabilities(self):
        """Verifies backend is healthy and lists engine capabilities."""
        res = client.get("/api/v1/health")
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "healthy"
        assert data["capabilities"]["static_analysis"]["python"] is True
        assert data["capabilities"]["ai_tutor"]["offline_pedagogical_engine"] is True

    def test_02_supported_languages(self):
        """Verifies language definitions and initial templates."""
        res = client.get("/api/v1/languages")
        assert res.status_code == 200
        languages = res.json()
        slugs = [l["slug"] for l in languages]
        assert "python" in slugs
        assert "javascript" in slugs
        assert "cpp" in slugs

    def test_03_preflight_detects_python_syntax_error(self):
        """Detects syntax error before execution and normalizes diagnostics."""
        broken_python = "def greet(name)\n    return f'Hello, {name}'\n"
        res = client.post("/api/v1/analyze", json={
            "language": "python",
            "source_code": broken_python
        })
        assert res.status_code == 200
        data = res.json()
        assert data["can_execute"] is False
        assert data["has_blocking_errors"] is True
        assert len(data["diagnostics"]) > 0
        diag = data["diagnostics"][0]
        assert diag["severity"] == "error"
        assert diag["line"] == 1
        assert "MISSING_COLON" in diag["error_code"] or "SYNTAX_ERROR" in diag["error_code"]

    def test_04_preflight_passes_valid_code(self):
        """Passes valid code with 'No issues detected by available checks'."""
        clean_python = "def square(n: int) -> int:\n    return n * n\n\nprint(square(6))\n"
        res = client.post("/api/v1/analyze", json={
            "language": "python",
            "source_code": clean_python
        })
        assert res.status_code == 200
        data = res.json()
        assert data["can_execute"] is True
        assert data["has_blocking_errors"] is False
        assert "No issues detected" in data["summary"]

    def test_05_execution_blocks_syntax_errors(self):
        """Gatekeeper halts execution when blocking syntax errors exist."""
        broken_python = "def divide(a, b)\n    return a / b\n"
        res = client.post("/api/v1/execute", json={
            "language": "python",
            "source_code": broken_python
        })
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "blocked"
        assert data["preflight_passed"] is False
        assert "Execution blocked by preflight checks" in data["compile_output"]

    def test_06_execution_runs_valid_program(self):
        """Executes valid program in sandbox and captures stdout."""
        code = "total = sum([1, 2, 3, 4, 5])\nprint(f'Sum: {total}')\n"
        res = client.post("/api/v1/execute", json={
            "language": "python",
            "source_code": code
        })
        assert res.status_code == 200
        data = res.json()
        assert data["status"] == "passed"
        assert "Sum: 15" in data["stdout"]
        assert data["execution_time_ms"] is not None

    def test_07_ai_tutor_diagnostic_explanation_and_hints(self):
        """AI tutor generates explanation, cause, and progressive hints."""
        broken_code = "if x > 10\n    print('High')"
        res = client.post("/api/v1/ai/tutor", json={
            "action": "explain_diagnostic",
            "language": "python",
            "source_code": broken_code,
            "diagnostic": {
                "severity": "error",
                "line": 1,
                "column": 10,
                "error_code": "MISSING_COLON",
                "message": "Python Syntax Error: expected ':'",
                "source": "python-ast"
            },
            "hint_level": 2
        })
        assert res.status_code == 200
        data = res.json()
        assert data["likely_cause"] is not None
        assert data["hint"] is not None
        assert data["suggested_fix"] is not None

    def test_08_course_quizzes_and_grading(self):
        """Submits quiz answers and records score."""
        res = client.post("/api/v1/courses/python-mastery/quiz", json={
            "quiz_id": "q1111111-1111-1111-1111-111111111111",
            "selected_option_index": 2
        })
        assert res.status_code == 200
        data = res.json()
        assert data["is_correct"] is True
        assert data["points_awarded"] == 10

    def test_09_challenge_evaluation(self):
        """Submits solution to challenge and checks test cases."""
        problems = client.get("/api/v1/problems").json()
        p = problems[0]
        
        solution_code = (
            "import sys\n"
            "raw = sys.stdin.read()\n"
            "if '3, 2, 4' in raw:\n"
            "    print('[1, 2]')\n"
            "else:\n"
            "    print('[0, 1]')\n"
        )
        res = client.post(f"/api/v1/problems/{p['id']}/submit", json={
            "language": "python",
            "source_code": solution_code
        })
        assert res.status_code == 200
        sub = res.json()
        assert sub["passed_tests"] > 0
        assert sub["status"] == "passed"

    def test_10_project_crud(self):
        """Saves and retrieves student code workspaces."""
        save_res = client.post("/api/v1/projects", json={
            "title": "E2E Test Workspace",
            "description": "Integration test project",
            "language": "python",
            "source_code": "print('Integration Project')",
            "is_public": True
        })
        assert save_res.status_code == 200
        proj = save_res.json()
        assert proj["title"] == "E2E Test Workspace"

        get_res = client.get(f"/api/v1/projects/{proj['id']}")
        assert get_res.status_code == 200
        assert get_res.json()["id"] == proj["id"]

if __name__ == "__main__":
    pytest.main(["-v", __file__])
