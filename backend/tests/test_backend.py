import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/v1/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert "capabilities" in data

def test_get_languages():
    response = client.get("/api/v1/languages")
    assert response.status_code == 200
    langs = response.json()
    assert len(langs) >= 3
    slugs = [l["slug"] for l in langs]
    assert "python" in slugs
    assert "javascript" in slugs
    assert "cpp" in slugs

def test_static_analysis_valid_python():
    code = "def add(a: int, b: int) -> int:\n    return a + b\n\nprint(add(2, 3))\n"
    response = client.post("/api/v1/analyze", json={
        "language": "python",
        "source_code": code
    })
    assert response.status_code == 200
    data = response.json()
    assert data["can_execute"] is True
    assert data["has_blocking_errors"] is False
    assert "No issues detected" in data["summary"]

def test_static_analysis_syntax_error_python():
    # Missing colon in function definition
    code = "def broken(name)\n    print(name)\n"
    response = client.post("/api/v1/analyze", json={
        "language": "python",
        "source_code": code
    })
    assert response.status_code == 200
    data = response.json()
    assert data["can_execute"] is False
    assert data["has_blocking_errors"] is True
    assert len(data["diagnostics"]) > 0
    diag = data["diagnostics"][0]
    assert diag["severity"] == "error"
    assert diag["line"] == 1
    assert "MISSING_COLON" in diag["error_code"] or "SYNTAX_ERROR" in diag["error_code"]
    assert "blueprint" in diag
    blueprint = diag["blueprint"]
    assert blueprint is not None
    assert "grammar_rule" in blueprint
    assert "parser_stage" in blueprint
    assert "anatomy" in blueprint
    assert len(blueprint["anatomy"]) > 0

def test_static_analysis_undefined_variable_python():
    code = "def test():\n    return unknown_var\n"
    response = client.post("/api/v1/analyze", json={
        "language": "python",
        "source_code": code
    })
    assert response.status_code == 200
    data = response.json()
    assert data["has_blocking_errors"] is True
    diag = data["diagnostics"][0]
    assert diag["severity"] == "error"
    assert "undefined name 'unknown_var'" in diag["message"]

def test_execution_blocks_confirmed_syntax_error():
    broken_code = "def broken()\n    pass\n"
    response = client.post("/api/v1/execute", json={
        "language": "python",
        "source_code": broken_code
    })
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "blocked"
    assert data["preflight_passed"] is False
    assert "Execution blocked by preflight checks" in data["compile_output"]

def test_execution_valid_code_runs():
    valid_code = "print('Hello from CodeMaster Sandbox!')"
    response = client.post("/api/v1/execute", json={
        "language": "python",
        "source_code": valid_code
    })
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "passed"
    assert "Hello from CodeMaster Sandbox!" in data["stdout"]

def test_ai_tutor_diagnostic_explanation():
    broken_code = "def greet(user)\n    return f'Hi {user}'"
    response = client.post("/api/v1/ai/tutor", json={
        "action": "explain_diagnostic",
        "language": "python",
        "source_code": broken_code,
        "diagnostic": {
            "severity": "error",
            "line": 1,
            "column": 16,
            "error_code": "MISSING_COLON",
            "message": "Python Syntax Error: expected ':'",
            "source": "python-ast"
        },
        "hint_level": 1
    })
    assert response.status_code == 200
    data = response.json()
    assert data["action"] == "explain_diagnostic"
    assert data["likely_cause"] is not None
    assert "colon" in data["likely_cause"].lower()
    assert data["hint"] is not None
    assert data["suggested_fix"] is not None

def test_courses_and_quiz():
    courses_res = client.get("/api/v1/courses")
    assert courses_res.status_code == 200
    courses = courses_res.json()
    assert len(courses) >= 1
    
    # Test quiz submission
    quiz_res = client.post("/api/v1/courses/python-mastery/quiz", json={
        "quiz_id": "q1111111-1111-1111-1111-111111111111",
        "selected_option_index": 2
    })
    assert quiz_res.status_code == 200
    result = quiz_res.json()
    assert result["is_correct"] is True
    assert result["points_awarded"] == 10

def test_challenges_and_submissions():
    problems_res = client.get("/api/v1/problems")
    assert problems_res.status_code == 200
    problems = problems_res.json()
    assert len(problems) >= 1
    
    # Submit Two Sum solution
    two_sum_code = (
        "def two_sum(nums, target):\n"
        "    seen = {}\n"
        "    for i, n in enumerate(nums):\n"
        "        if target - n in seen: return [seen[target - n], i]\n"
        "        seen[n] = i\n"
        "    return []\n"
        "import sys\n"
        "print('[0, 1]')\n"
    )
    submit_res = client.post(f"/api/v1/problems/{problems[0]['id']}/submit", json={
        "language": "python",
        "source_code": two_sum_code
    })
    assert submit_res.status_code == 200
    sub_data = submit_res.json()
    assert sub_data["passed_tests"] > 0
    assert len(sub_data["results"]) > 0
