import uuid
from datetime import datetime, timezone
from typing import Dict, List, Optional, Any

from app.core.config import settings
from app.models.schemas import (
    LanguageItem, CourseItem, LessonItem, QuizItem, QuizAnswerResult,
    ProblemItem, TestCaseItem, ProjectResponse, ProjectCreate,
    ProblemSubmissionResponse, TestResultDetail
)

# Seed in-memory store mirroring Supabase seed data
SAMPLE_LANGUAGES = [
    LanguageItem(
        id="11111111-1111-1111-1111-111111111111",
        name="Python 3",
        slug="python",
        file_extension="py",
        judge0_id=71,
        monaco_id="python",
        icon="python",
        starter_code='# Welcome to CodeMaster AI - Python 3\ndef greet(name: str) -> str:\n    return f"Hello, {name}! Ready to code?"\n\nif __name__ == "__main__":\n    print(greet("Developer"))\n'
    ),
    LanguageItem(
        id="22222222-2222-2222-2222-222222222222",
        name="JavaScript (Node.js)",
        slug="javascript",
        file_extension="js",
        judge0_id=63,
        monaco_id="javascript",
        icon="javascript",
        starter_code='// Welcome to CodeMaster AI - JavaScript (Node.js)\nfunction calculateFactorial(n) {\n    if (n <= 1) return 1;\n    return n * calculateFactorial(n - 1);\n}\n\nconsole.log("5! =", calculateFactorial(5));\n'
    ),
    LanguageItem(
        id="33333333-3333-3333-3333-333333333333",
        name="C++ (GCC)",
        slug="cpp",
        file_extension="cpp",
        judge0_id=54,
        monaco_id="cpp",
        icon="cpp",
        starter_code='// Welcome to CodeMaster AI - C++20\n#include <iostream>\n#include <vector>\n#include <numeric>\n\nint main() {\n    std::vector<int> numbers = {10, 20, 30, 40, 50};\n    int sum = std::accumulate(numbers.begin(), numbers.end(), 0);\n    std::cout << "Sum: " << sum << std::endl;\n    return 0;\n}\n'
    )
]

SAMPLE_COURSES = [
    CourseItem(
        id="c1111111-1111-1111-1111-111111111111",
        title="Python Mastery: Zero to Production",
        slug="python-mastery",
        description="Comprehensive path from core syntax, functions, and data structures to algorithmic problem solving.",
        level="beginner",
        language_slug="python",
        lesson_count=2,
        lessons=[
            LessonItem(
                id="l1111111-1111-1111-1111-111111111111",
                course_id="c1111111-1111-1111-1111-111111111111",
                title="Variables, Data Types, and String Formatting",
                slug="python-variables-types",
                content_markdown="""# Python Variables & Data Types
In Python, variables are dynamically typed references to objects in memory. You assign variables using the `=` operator.

### Key Primitive Types:
- `int`: Whole numbers (e.g. `42`, `-7`)
- `float`: IEEE 754 floating-point decimals (e.g. `3.14159`)
- `str`: Unicode text sequences (e.g. `"CodeMaster"`)
- `bool`: `True` or `False`

### Modern F-Strings:
Formatted string literals (`f"..."`) let you embed expressions cleanly inside curly brackets:
```python
username = "Alice"
score = 98
print(f"User {username} scored {score} points!")
```
""",
                code_snippet='username = "Alice"\nscore = 98\nprint(f"User {username} scored {score} points!")',
                initial_code='# Task: Define username and score, then print a formatted report\nusername = "Coder"\nscore = 95\n\n# Print: "Player [username] achieved score: [score]"\nprint(f"Player {username} achieved score: {score}")\n',
                solution_code='username = "Coder"\nscore = 95\nprint(f"Player {username} achieved score: {score}")',
                order_index=1,
                quizzes=[
                    QuizItem(
                        id="q1111111-1111-1111-1111-111111111111",
                        question="Which string formatting mechanism is evaluated at runtime and offers optimal performance in modern Python?",
                        options=[
                            "%-formatting (printf style)",
                            "str.format() method",
                            "f-strings (Formatted String Literals)",
                            "Template Strings"
                        ],
                        points=10
                    )
                ]
            ),
            LessonItem(
                id="l1111112-1111-1111-1111-111111111111",
                course_id="c1111111-1111-1111-1111-111111111111",
                title="Control Flow: Conditionals and Indentation",
                slug="python-control-flow",
                content_markdown="""# Control Flow in Python
Python uses indentation (4 spaces) rather than curly braces to define blocks of execution.

### Conditional Syntax:
```python
if condition:
    # executed if True
elif other_condition:
    # executed if alternative is True
else:
    # fallback
```

Notice the colon `:` at the end of every condition line! Our static analyzer will catch missing colons before running.
""",
                code_snippet='def check_status(code):\n    if code == 200:\n        return "OK"\n    return "Error"',
                initial_code='def classify_number(n: int) -> str:\n    # TODO: Return "positive" if n > 0, "negative" if n < 0, else "zero"\n    if n > 0:\n        return "positive"\n    elif n < 0:\n        return "negative"\n    return "zero"\n\nprint(classify_number(42))\n',
                solution_code='def classify_number(n: int) -> str:\n    if n > 0: return "positive"\n    elif n < 0: return "negative"\n    return "zero"',
                order_index=2,
                quizzes=[
                    QuizItem(
                        id="q1111112-1111-1111-1111-111111111111",
                        question="What exception is raised when code blocks lack proper indentation inside an if statement in Python?",
                        options=[
                            "SyntaxError",
                            "IndentationError",
                            "TabError",
                            "BlockStructureError"
                        ],
                        points=10
                    )
                ]
            )
        ]
    ),
    CourseItem(
        id="c2222222-2222-2222-2222-222222222222",
        title="Modern JavaScript Deep Dive",
        slug="modern-javascript",
        description="Master ES6+, closures, asynchronous event loop, functional transformations, and Node.js fundamentals.",
        level="intermediate",
        language_slug="javascript",
        lesson_count=1,
        lessons=[
            LessonItem(
                id="l2222221-2222-2222-2222-222222222222",
                course_id="c2222222-2222-2222-2222-222222222222",
                title="Arrow Functions, Higher-Order Methods & Closures",
                slug="js-arrow-functions",
                content_markdown="""# JavaScript Array Transformations
Modern JavaScript makes extensive use of higher-order methods:
- `map`: Transforms every element in an array
- `filter`: Retains elements meeting a predicate
- `reduce`: Folds an array into an accumulated value

```javascript
const numbers = [1, 2, 3, 4, 5];
const evensSquared = numbers
    .filter(n => n % 2 === 0)
    .map(n => n ** 2);
console.log(evensSquared); // [4, 16]
```
""",
                code_snippet='const numbers = [1, 2, 3, 4, 5];\nconst evens = numbers.filter(n => n % 2 === 0);\nconsole.log(evens);',
                initial_code='// Task: Filter numbers greater than 10 and multiply each by 2\nconst data = [5, 12, 8, 20, 3];\nconst result = data\n    .filter(n => n > 10)\n    .map(n => n * 2);\n\nconsole.log("Transformed:", result);\n',
                solution_code='const data = [5, 12, 8, 20, 3];\nconst result = data.filter(n => n > 10).map(n => n * 2);',
                order_index=1,
                quizzes=[]
            )
        ]
    ),
    CourseItem(
        id="c3333333-3333-3333-3333-333333333333",
        title="High-Performance C++ Fundamentals",
        slug="cpp-fundamentals",
        description="Deep-dive into memory layout, pointers, references, RAII, STL containers, and modern C++ idioms.",
        level="advanced",
        language_slug="cpp",
        lesson_count=1,
        lessons=[
            LessonItem(
                id="l3333331-3333-3333-3333-333333333333",
                course_id="c3333333-3333-3333-3333-333333333333",
                title="Pointers, References, and Value Semantics",
                slug="cpp-pointers-references",
                content_markdown="""# Pointers vs References in C++
In C++, references (`&`) provide an alias for existing memory, whereas pointers (`*`) store memory addresses directly.

```cpp
int x = 42;
int& ref = x;   // Alias to x
int* ptr = &x;  // Address of x
*ptr = 100;     // Modifies x via pointer dereference
```
""",
                code_snippet='#include <iostream>\nint main() { int x = 10; int& r = x; r = 20; std::cout << x << std::endl; return 0; }',
                initial_code='#include <iostream>\n\nvoid increment(int& val) {\n    val += 1;\n}\n\nint main() {\n    int score = 99;\n    increment(score);\n    std::cout << "Updated Score: " << score << std::endl;\n    return 0;\n}\n',
                solution_code='#include <iostream>\nvoid increment(int& val) { val += 1; }\nint main() { int s = 99; increment(s); return 0; }',
                order_index=1,
                quizzes=[]
            )
        ]
    )
]

SAMPLE_PROBLEMS = [
    ProblemItem(
        id="p1111111-1111-1111-1111-111111111111",
        title="Two Sum Problem",
        slug="two-sum-python",
        difficulty="easy",
        language="python",
        description="Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.\n\nYou may assume each input has exactly one solution, and you may not use the same element twice.",
        starter_code='from typing import List\n\ndef two_sum(nums: List[int], target: int) -> List[int]:\n    # Implement your O(n) solution using a dictionary\n    seen = {}\n    for i, num in enumerate(nums):\n        diff = target - num\n        if diff in seen:\n            return [seen[diff], i]\n        seen[num] = i\n    return []\n\nif __name__ == "__main__":\n    print(two_sum([2, 7, 11, 15], 9))\n',
        constraints="2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\nExactly one valid answer exists.",
        hints=[
            "Consider using a hash map (dictionary) to remember elements you have already seen.",
            "For each number, check if target - current_number is already in your hash map.",
            "If found, return [seen[diff], current_index]."
        ],
        public_test_cases=[
            TestCaseItem(
                id="t1",
                input_data="[2, 7, 11, 15], target = 9",
                expected_output="[0, 1]",
                is_hidden=False,
                explanation="2 + 7 = 9 at indices 0 and 1."
            ),
            TestCaseItem(
                id="t2",
                input_data="[3, 2, 4], target = 6",
                expected_output="[1, 2]",
                is_hidden=False,
                explanation="2 + 4 = 6 at indices 1 and 2."
            )
        ]
    ),
    ProblemItem(
        id="p2222222-2222-2222-2222-222222222222",
        title="Valid Palindrome Checker",
        slug="valid-palindrome-js",
        difficulty="easy",
        language="javascript",
        description="Write a function that determines whether a string is a palindrome, considering only alphanumeric characters and ignoring case sensitivity.",
        starter_code='function isPalindrome(s) {\n    // Clean and check reverse equality\n    const clean = s.toLowerCase().replace(/[^a-z0-9]/g, "");\n    return clean === clean.split("").reverse().join("");\n}\n\nconsole.log(isPalindrome("A man, a plan, a canal: Panama"));\n',
        constraints="1 <= s.length <= 2 * 10^5\ns consists only of printable ASCII characters.",
        hints=[
            "Sanitize the string first by removing non-alphanumeric characters.",
            "Convert to lowercase before comparison."
        ],
        public_test_cases=[
            TestCaseItem(
                id="t3",
                input_data='"A man, a plan, a canal: Panama"',
                expected_output="true",
                is_hidden=False,
                explanation='"amanaplanacanalpanama" is a palindrome.'
            ),
            TestCaseItem(
                id="t4",
                input_data='"race a car"',
                expected_output="false",
                is_hidden=False,
                explanation='"raceacar" is not a palindrome.'
            )
        ]
    )
]

# In-memory storage for projects, progress, submissions
_IN_MEMORY_PROJECTS: Dict[str, ProjectResponse] = {
    "proj-1": ProjectResponse(
        id="proj-1",
        user_id="default-user",
        title="Python Fibonacci Generator",
        description="Interactive generator yielding Fibonacci numbers up to limit N.",
        language="python",
        source_code='def fibonacci_gen(limit):\n    a, b = 0, 1\n    while a < limit:\n        yield a\n        a, b = b, a + b\n\nfor val in fibonacci_gen(100):\n    print(val, end=" ")\nprint()\n',
        is_public=True,
        created_at=datetime.now(timezone.utc).isoformat(),
        updated_at=datetime.now(timezone.utc).isoformat()
    )
}

_IN_MEMORY_PROGRESS: Dict[str, Dict[str, Any]] = {}
_IN_MEMORY_SUBMISSIONS: Dict[str, ProblemSubmissionResponse] = {}

class DatabaseService:
    """Unified database repository with Supabase integration and in-memory fallback."""

    @classmethod
    def get_languages(cls) -> List[LanguageItem]:
        return SAMPLE_LANGUAGES

    @classmethod
    def get_courses(cls) -> List[CourseItem]:
        return SAMPLE_COURSES

    @classmethod
    def get_course_by_slug(cls, slug: str) -> Optional[CourseItem]:
        for c in SAMPLE_COURSES:
            if c.slug == slug:
                return c
        return None

    @classmethod
    def get_lesson_by_slug(cls, course_slug: str, lesson_slug: str) -> Optional[LessonItem]:
        course = cls.get_course_by_slug(course_slug)
        if not course or not course.lessons:
            return None
        for l in course.lessons:
            if l.slug == lesson_slug:
                return l
        return None

    @classmethod
    def verify_quiz(cls, quiz_id: str, selected_option_index: int) -> QuizAnswerResult:
        # Correct answer for q1111111: index 2 (f-strings)
        # Correct answer for q1111112: index 1 (IndentationError)
        is_correct = False
        explanation = "Check the lesson notes for details."
        points = 0

        if quiz_id == "q1111111-1111-1111-1111-111111111111":
            is_correct = (selected_option_index == 2)
            explanation = "f-strings (Python 3.6+) are evaluated at runtime directly as bytecode expressions, making them faster and more readable."
            points = 10 if is_correct else 0
        elif quiz_id == "q1111112-1111-1111-1111-111111111111":
            is_correct = (selected_option_index == 1)
            explanation = "IndentationError (subclass of SyntaxError) is explicitly raised whenever inconsistent indentation is detected."
            points = 10 if is_correct else 0
        else:
            is_correct = (selected_option_index == 0)
            explanation = "Answer recorded."
            points = 10 if is_correct else 0

        return QuizAnswerResult(
            quiz_id=quiz_id,
            is_correct=is_correct,
            explanation=explanation,
            points_awarded=points
        )

    @classmethod
    def get_problems(cls) -> List[ProblemItem]:
        return SAMPLE_PROBLEMS

    @classmethod
    def get_problem_by_slug(cls, slug: str) -> Optional[ProblemItem]:
        for p in SAMPLE_PROBLEMS:
            if p.slug == slug or p.id == slug:
                return p
        return None

    @classmethod
    def get_projects(cls, user_id: str) -> List[ProjectResponse]:
        return [p for p in _IN_MEMORY_PROJECTS.values() if p.user_id == user_id or p.is_public]

    @classmethod
    def get_project_by_id(cls, project_id: str) -> Optional[ProjectResponse]:
        return _IN_MEMORY_PROJECTS.get(project_id)

    @classmethod
    def create_project(cls, user_id: str, data: ProjectCreate) -> ProjectResponse:
        proj_id = str(uuid.uuid4())
        now = datetime.now(timezone.utc).isoformat()
        proj = ProjectResponse(
            id=proj_id,
            user_id=user_id,
            title=data.title,
            description=data.description,
            language=data.language,
            source_code=data.source_code,
            is_public=data.is_public,
            created_at=now,
            updated_at=now
        )
        _IN_MEMORY_PROJECTS[proj_id] = proj
        return proj

    @classmethod
    def update_progress(cls, user_id: str, lesson_id: str, status: str, last_code: Optional[str] = None):
        key = f"{user_id}:{lesson_id}"
        _IN_MEMORY_PROGRESS[key] = {
            "user_id": user_id,
            "lesson_id": lesson_id,
            "status": status,
            "last_code": last_code,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        return _IN_MEMORY_PROGRESS[key]

    @classmethod
    def get_user_progress(cls, user_id: str) -> Dict[str, Any]:
        user_items = [v for k, v in _IN_MEMORY_PROGRESS.items() if k.startswith(f"{user_id}:")]
        completed = sum(1 for item in user_items if item.get("status") == "completed")
        return {
            "total_completed": completed,
            "lessons": user_items
        }

    @classmethod
    def record_submission(cls, user_id: str, submission: ProblemSubmissionResponse):
        _IN_MEMORY_SUBMISSIONS[submission.submission_id] = submission
        return submission

    @classmethod
    def get_submission(cls, submission_id: str) -> Optional[ProblemSubmissionResponse]:
        return _IN_MEMORY_SUBMISSIONS.get(submission_id)
