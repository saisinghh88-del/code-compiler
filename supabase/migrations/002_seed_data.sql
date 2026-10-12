-- ============================================================================
-- CodeMaster AI - Migration 002: Seed Data for Languages, Courses, Lessons, Challenges
-- ============================================================================

-- 1. Insert Languages
INSERT INTO public.languages (id, name, slug, file_extension, judge0_id, monaco_id, icon, is_active, starter_code)
VALUES
(
    '11111111-1111-1111-1111-111111111111',
    'Python 3',
    'python',
    'py',
    71, -- Judge0 ID for Python 3.8+ / 3.10
    'python',
    'python',
    true,
    '# Welcome to CodeMaster AI - Python 3' || E'\n' ||
    'def greet(name: str) -> str:' || E'\n' ||
    '    return f"Hello, {name}! Ready to code?"' || E'\n\n' ||
    'if __name__ == "__main__":' || E'\n' ||
    '    print(greet("Developer"))' || E'\n'
),
(
    '22222222-2222-2222-2222-222222222222',
    'JavaScript (Node.js)',
    'javascript',
    'js',
    63, -- Judge0 ID for JavaScript Node.js
    'javascript',
    'javascript',
    true,
    '// Welcome to CodeMaster AI - JavaScript (Node.js)' || E'\n' ||
    'function calculateFactorial(n) {' || E'\n' ||
    '    if (n <= 1) return 1;' || E'\n' ||
    '    return n * calculateFactorial(n - 1);' || E'\n' ||
    '}' || E'\n\n' ||
    'console.log("5! =", calculateFactorial(5));' || E'\n'
),
(
    '33333333-3333-3333-3333-333333333333',
    'C++ (GCC)',
    'cpp',
    'cpp',
    54, -- Judge0 ID for C++ (GCC 9.2.0+)
    'cpp',
    'cpp',
    true,
    '// Welcome to CodeMaster AI - C++20' || E'\n' ||
    '#include <iostream>' || E'\n' ||
    '#include <vector>' || E'\n' ||
    '#include <numeric>' || E'\n\n' ||
    'int main() {' || E'\n' ||
    '    std::vector<int> numbers = {10, 20, 30, 40, 50};' || E'\n' ||
    '    int sum = std::accumulate(numbers.begin(), numbers.end(), 0);' || E'\n' ||
    '    std::cout << "Sum: " << sum << std::endl;' || E'\n' ||
    '    return 0;' || E'\n' ||
    '}' || E'\n'
)
ON CONFLICT (slug) DO NOTHING;

-- 2. Insert Courses
INSERT INTO public.courses (id, language_id, title, slug, description, level, order_index, is_published)
VALUES
(
    'c1111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'Python Mastery: Zero to Production',
    'python-mastery',
    'Comprehensive path from core syntax, control flow, functions, and data structures to algorithmic problem solving.',
    'beginner',
    1,
    true
),
(
    'c2222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    'Modern JavaScript Deep Dive',
    'modern-javascript',
    'Master ES6+, closures, asynchronous event loop, functional transformations, and Node.js fundamentals.',
    'intermediate',
    2,
    true
),
(
    'c3333333-3333-3333-3333-333333333333',
    '33333333-3333-3333-3333-333333333333',
    'High-Performance C++ Fundamentals',
    'cpp-fundamentals',
    'Deep-dive into memory layout, pointers, references, RAII, STL containers, and modern C++ idiom best practices.',
    'advanced',
    3,
    true
)
ON CONFLICT (slug) DO NOTHING;

-- 3. Insert Lessons for Python Course
INSERT INTO public.lessons (id, course_id, title, slug, content_markdown, code_snippet, initial_code, solution_code, order_index, is_published)
VALUES
(
    'l1111111-1111-1111-1111-111111111111',
    'c1111111-1111-1111-1111-111111111111',
    'Variables, Data Types, and String Formatting',
    'python-variables-types',
    '# Python Variables & Types' || E'\n\n' ||
    'In Python, variables are dynamically typed references to objects in memory. You assign variables using the `=` operator.' || E'\n\n' ||
    '### Key Primitive Types:' || E'\n' ||
    '- `int`: Whole numbers (e.g. `42`, `-7`)' || E'\n' ||
    '- `float`: IEEE 754 floating-point decimals (e.g. `3.14159`)' || E'\n' ||
    '- `str`: Unicode text sequences (e.g. `"CodeMaster"`)' || E'\n' ||
    '- `bool`: `True` or `False`' || E'\n\n' ||
    '### Modern F-Strings:' || E'\n' ||
    'Formatted string literals (`f"..."`) let you embed expressions cleanly inside curly brackets.',
    'name = "Alice"' || E'\nage = 25' || E'\nprint(f"{name} is {age} years old.")',
    '# Task: Define username and score, then print a formatted report' || E'\n' ||
    'username = "Coder"' || E'\n' ||
    'score = 95' || E'\n\n' ||
    '# Print: "Player [username] achieved score: [score]"' || E'\n' ||
    'print(f"Player {username} achieved score: {score}")' || E'\n',
    'username = "Coder"' || E'\nscore = 95' || E'\nprint(f"Player {username} achieved score: {score}")',
    1,
    true
),
(
    'l1111112-1111-1111-1111-111111111111',
    'c1111111-1111-1111-1111-111111111111',
    'Control Flow: Conditionals and Match Statements',
    'python-control-flow',
    '# Control Flow in Python' || E'\n\n' ||
    'Python uses indentation (4 spaces) rather than curly braces to define blocks of execution.' || E'\n\n' ||
    '### Conditional Syntax:' || E'\n' ||
    '```python' || E'\n' ||
    'if condition:' || E'\n' ||
    '    # executed if condition is True' || E'\n' ||
    'elif other_condition:' || E'\n' ||
    '    # executed if alternative is True' || E'\n' ||
    'else:' || E'\n' ||
    '    # fallback' || E'\n' ||
    '```' || E'\n\n' ||
    'Always watch out for indentation errors (`IndentationError`) and missing colons (`:`). Our static analyzer will catch these before you run!',
    'def check_status(code):' || E'\n    if code == 200:' || E'\n        return "OK"' || E'\n    return "Error"',
    'def classify_number(n: int) -> str:' || E'\n' ||
    '    # TODO: Return "positive" if n > 0, "negative" if n < 0, else "zero"' || E'\n' ||
    '    if n > 0:' || E'\n' ||
    '        return "positive"' || E'\n' ||
    '    elif n < 0:' || E'\n' ||
    '        return "negative"' || E'\n' ||
    '    return "zero"' || E'\n\n' ||
    'print(classify_number(42))' || E'\n',
    'def classify_number(n: int) -> str:' || E'\n    if n > 0: return "positive"' || E'\n    elif n < 0: return "negative"' || E'\n    return "zero"',
    2,
    true
)
ON CONFLICT (course_id, slug) DO NOTHING;

-- 4. Insert Quizzes
INSERT INTO public.quizzes (id, lesson_id, question, options_json, correct_option_index, explanation, points)
VALUES
(
    'q1111111-1111-1111-1111-111111111111',
    'l1111111-1111-1111-1111-111111111111',
    'Which string formatting mechanism is evaluated at runtime and offers optimal performance in modern Python?',
    '["%-formatting (printf style)", "str.format() method", "f-strings (Formatted String Literals)", "Template Strings"]'::jsonb,
    2,
    'f-strings (introduced in Python 3.6) are evaluated at runtime directly as bytecode expressions, making them faster and more readable than %-formatting or .format().',
    10
),
(
    'q1111112-1111-1111-1111-111111111111',
    'l1111112-1111-1111-1111-111111111111',
    'What exception is raised when code blocks lack proper indentation inside an if statement in Python?',
    '["SyntaxError", "IndentationError", "TabError", "BlockStructureError"]'::jsonb,
    1,
    'IndentationError (a subclass of SyntaxError) is explicitly raised whenever inconsistent or missing whitespace is detected at the start of a block.',
    10
)
ON CONFLICT (id) DO NOTHING;

-- 5. Insert Challenges / Problems
INSERT INTO public.problems (id, language_id, title, slug, difficulty, description, starter_code, solution_code, constraints, hints_json, order_index, is_published)
VALUES
(
    'p1111111-1111-1111-1111-111111111111',
    '11111111-1111-1111-1111-111111111111',
    'Two Sum Problem',
    'two-sum-python',
    'easy',
    'Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to `target`.' || E'\n\n' ||
    'You may assume that each input has exactly one solution, and you may not use the same element twice.' || E'\n\n' ||
    'Output format: Return a list containing the two 0-indexed positions.',
    'from typing import List' || E'\n\n' ||
    'def two_sum(nums: List[int], target: int) -> List[int]:' || E'\n' ||
    '    # Write your solution here' || E'\n' ||
    '    seen = {}' || E'\n' ||
    '    for i, num in enumerate(nums):' || E'\n' ||
    '        complement = target - num' || E'\n' ||
    '        if complement in seen:' || E'\n' ||
    '            return [seen[complement], i]' || E'\n' ||
    '        seen[num] = i' || E'\n' ||
    '    return []' || E'\n\n' ||
    '# Test example' || E'\n' ||
    'print(two_sum([2, 7, 11, 15], 9))' || E'\n',
    'def two_sum(nums, target):' || E'\n    seen = {}' || E'\n    for i, n in enumerate(nums):' || E'\n        if target - n in seen: return [seen[target - n], i]' || E'\n        seen[n] = i' || E'\n    return []',
    '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\nOnly one valid answer exists.',
    '["Consider using a hash map (dictionary) to achieve O(n) time complexity.", "Store each number and its index as you iterate.", "Check if target - current_number exists in the dictionary."]'::jsonb,
    1,
    true
),
(
    'p2222222-2222-2222-2222-222222222222',
    '22222222-2222-2222-2222-222222222222',
    'Valid Palindrome Checker',
    'valid-palindrome-js',
    'easy',
    'Write a JavaScript function that determines whether a given string is a palindrome, considering only alphanumeric characters and ignoring cases.',
    'function isPalindrome(s) {' || E'\n' ||
    '    // Clean the string and compare forwards and backwards' || E'\n' ||
    '    const clean = s.toLowerCase().replace(/[^a-z0-9]/g, "");' || E'\n' ||
    '    return clean === clean.split("").reverse().join("");' || E'\n' ||
    '}' || E'\n\n' ||
    'console.log(isPalindrome("A man, a plan, a canal: Panama"));' || E'\n',
    'function isPalindrome(s) { const clean = s.toLowerCase().replace(/[^a-z0-9]/g, ""); return clean === clean.split("").reverse().join(""); }',
    '1 <= s.length <= 2 * 10^5\ns consists only of printable ASCII characters.',
    '["Strip all non-alphanumeric characters using a regex like /[^a-z0-9]/gi.", "Compare characters from both ends towards the center."]'::jsonb,
    2,
    true
)
ON CONFLICT (slug) DO NOTHING;

-- 6. Insert Test Cases for Problems (Public and Hidden)
INSERT INTO public.test_cases (id, problem_id, input_data, expected_output, is_hidden, explanation, order_index)
VALUES
(
    't1111111-1111-1111-1111-111111111111',
    'p1111111-1111-1111-1111-111111111111',
    '[2, 7, 11, 15]' || E'\n' || '9',
    '[0, 1]',
    false,
    'nums[0] + nums[1] == 2 + 7 == 9, so return [0, 1].',
    1
),
(
    't1111112-1111-1111-1111-111111111111',
    'p1111111-1111-1111-1111-111111111111',
    '[3, 2, 4]' || E'\n' || '6',
    '[1, 2]',
    false,
    'nums[1] + nums[2] == 2 + 4 == 6, so return [1, 2].',
    2
),
(
    't1111113-1111-1111-1111-111111111111',
    'p1111111-1111-1111-1111-111111111111',
    '[3, 3]' || E'\n' || '6',
    '[0, 1]',
    true, -- Hidden evaluation test case!
    'Duplicate numbers test case.',
    3
)
ON CONFLICT (id) DO NOTHING;
