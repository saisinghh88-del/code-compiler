import ast
import re
import shutil
import subprocess
import tempfile
import os
from datetime import datetime, timezone
from typing import List, Tuple
from pyflakes import checker, messages

from app.models.schemas import Diagnostic, AnalysisResponse, ErrorBlueprint, SyntaxAnatomyItem

class BlueprintEngine:
    """Generates structural syntax blueprints dissecting errors into grammar rules and compiler stages."""

    @staticmethod
    def generate(
        err_code: str, 
        message: str, 
        line_text: str = "", 
        language: str = "python",
        line: int = 1,
        column: int = 1
    ) -> ErrorBlueprint:
        code = (err_code or "").upper()
        msg_lower = (message or "").lower()
        cleaned_line = line_text.strip() if line_text else ""

        # 1. MISSING COLON (Python)
        if "MISSING_COLON" in code or "expected ':'" in msg_lower:
            keyword = "statement"
            if cleaned_line.startswith("def "):
                keyword = "def"
            elif cleaned_line.startswith("class "):
                keyword = "class"
            elif cleaned_line.startswith("if "):
                keyword = "if"
            elif cleaned_line.startswith("elif "):
                keyword = "elif"
            elif cleaned_line.startswith("else"):
                keyword = "else"
            elif cleaned_line.startswith("for "):
                keyword = "for"
            elif cleaned_line.startswith("while "):
                keyword = "while"
            elif cleaned_line.startswith("try"):
                keyword = "try"
            elif cleaned_line.startswith("except"):
                keyword = "except"
            elif cleaned_line.startswith("with "):
                keyword = "with"

            anatomy = [
                SyntaxAnatomyItem(token=keyword, label=f"Compound Header '{keyword}'", status="valid", role="keyword"),
                SyntaxAnatomyItem(token=cleaned_line[len(keyword):].strip() or "expression", label="Header Signature / Condition", status="valid", role="expression"),
                SyntaxAnatomyItem(token=":", label="Suite Header Delimiter (Colon)", status="missing", role="delimiter"),
                SyntaxAnatomyItem(token="    suite", label="Indented Execution Suite", status="unresolved", role="scope"),
            ]

            if keyword == "def":
                canonical = "def calculate_total(subtotal: float, tax_rate: float) -> float:\n    total = subtotal * (1 + tax_rate)\n    return total"
            elif keyword == "if":
                canonical = "if user_score >= 90:\n    print('Outstanding achievement!')\n    award_xp(100)"
            elif keyword == "for":
                canonical = "for index, item in enumerate(items):\n    print(f'Item {index}: {item}')"
            else:
                canonical = f"{cleaned_line or keyword + ' condition'}:\n    # Indented block body\n    pass"

            schematic = f"{cleaned_line if cleaned_line else keyword}   <--- [ERROR: Missing ':']\n{cleaned_line if cleaned_line else keyword}:  <--- [CORRECT: Block Header Colon]"

            return ErrorBlueprint(
                title=f"Python Compound {keyword.capitalize()} Header Blueprint",
                grammar_rule=f"{keyword}_stmt ::= '{keyword}' header_expression ':' NEWLINE INDENT suite",
                parser_stage="Syntactic Parser (CST -> AST Construction)",
                expected_token="':' (Colon Delimiter)",
                actual_token="'\\n' (Newline without header terminator)",
                impact="The parser was scanning the block header and encountered a newline without finding the required colon delimiter ':'. In Python grammar, colons are mandatory delimiters separating header declarations from the execution suite body.",
                canonical_spec=canonical,
                anatomy=anatomy,
                correction_schematic=schematic
            )

        # 2. INDENTATION ERROR (Python)
        if "INDENTATION" in code or "indentation" in msg_lower or "expected an indented block" in msg_lower:
            anatomy = [
                SyntaxAnatomyItem(token="header:", label="Block Header Declaration", status="valid", role="keyword"),
                SyntaxAnatomyItem(token="    ", label="PEP 8 4-Space Indentation", status="missing", role="scope"),
                SyntaxAnatomyItem(token=cleaned_line or "unindented_statement", label="Body Statement Payload", status="unexpected", role="expression"),
            ]
            canonical = "def compute_average(values: list) -> float:\n    # Indented by exactly 4 spaces\n    if not values:\n        # Nested by 8 spaces\n        return 0.0\n    return sum(values) / len(values)"
            schematic = f"def function_header():\n{cleaned_line or 'code_line'}  <--- [ERROR: Mismatched indentation]\n    {cleaned_line or 'code_line'}  <--- [CORRECT: 4 spaces indent]"

            return ErrorBlueprint(
                title="Python Indentation & Block Scope Blueprint",
                grammar_rule="suite ::= NEWLINE INDENT statement+ DEDENT (Off-side Rule)",
                parser_stage="Lexical Tokenizer (INDENT/DEDENT Stream Generator)",
                expected_token="INDENT token (4 whitespace characters)",
                actual_token="Unindented statement or mixed whitespace",
                impact="Python uses significant whitespace (the off-side rule) instead of curly braces to delimit code blocks. The lexical scanner failed to generate an INDENT token for this statement, preventing the parser from nesting it under the preceding header frame.",
                canonical_spec=canonical,
                anatomy=anatomy,
                correction_schematic=schematic
            )

        # 3. UNCLOSED BRACKET / DELIMITER (Python, JS, C++)
        if any(term in code for term in ["UNCLOSED", "UNMATCHED", "UNBALANCED"]) or "was never closed" in msg_lower or "unmatched" in msg_lower:
            delim = ")"
            opening = "("
            if "]" in msg_lower or "[" in msg_lower:
                delim = "]"
                opening = "["
            elif "}" in msg_lower or "{" in msg_lower:
                delim = "}"
                opening = "{"

            anatomy = [
                SyntaxAnatomyItem(token=opening, label=f"Opening Enclosure '{opening}'", status="valid", role="delimiter"),
                SyntaxAnatomyItem(token="payload_expression", label="Contained Expression List", status="valid", role="expression"),
                SyntaxAnatomyItem(token=delim, label=f"Matching Enclosure '{delim}'", status="missing", role="delimiter"),
            ]
            canonical = f"result = calculate_metrics(alpha, beta, gamma)  # Strict pair matching '{opening}...{delim}'"
            schematic = f"call_function(arg1, arg2    <--- [ERROR: Unclosed '{opening}']\ncall_function(arg1, arg2)   <--- [CORRECT: Closed '{opening}...{delim}']"

            return ErrorBlueprint(
                title=f"Delimiter Balance & LIFO Stack Blueprint",
                grammar_rule=f"enclosure ::= '{opening}' [expression_list] '{delim}'",
                parser_stage="Lexical Scanner (LIFO Bracket Token Stack)",
                expected_token=f"'{delim}' (Matching Enclosure Delimiter)",
                actual_token="EOF or conflicting delimiter",
                impact=f"The scanner maintains a Last-In First-Out (LIFO) stack to track nested parentheses, brackets, and braces. An unclosed '{opening}' prevents expression reduction and cascades into parsing errors across remaining lines.",
                canonical_spec=canonical,
                anatomy=anatomy,
                correction_schematic=schematic
            )

        # 4. UNDEFINED NAME / IDENTIFIER (Python, C++)
        if "UNDEFINED" in code or "not defined" in msg_lower or "not declared in this scope" in msg_lower:
            var_name = "identifier"
            match = re.search(r"'(.*?)'", message)
            if match:
                var_name = match.group(1)

            anatomy = [
                SyntaxAnatomyItem(token=var_name, label=f"Identifier Symbol '{var_name}'", status="unresolved", role="identifier"),
                SyntaxAnatomyItem(token="=", label="Assignment / Definition Binding", status="missing", role="delimiter"),
                SyntaxAnatomyItem(token="value / import", label="Bound Memory Address", status="missing", role="expression"),
            ]
            canonical = f"# 1. Define or import symbol before use:\n{var_name} = 100\n\n# 2. Reference symbol:\nprint({var_name})"
            schematic = f"# Scope Symbol Table Lookup:\n# [Local]    -> {var_name} NOT FOUND\n# [Enclosing]-> {var_name} NOT FOUND\n# [Global]   -> {var_name} NOT FOUND\n# [Builtin]  -> {var_name} NOT FOUND\n# Resolution: Declare '{var_name} = ...' prior to line {line}"

            return ErrorBlueprint(
                title="LEGB Symbol Scope Resolution Blueprint",
                grammar_rule="symbol_lookup ::= Local -> Enclosing -> Global -> Built-in (LEGB)",
                parser_stage="Semantic Analyzer (Symbol Table & Scope Resolution)",
                expected_token=f"Bound symbol for '{var_name}' in accessible scope",
                actual_token="Unbound identifier symbol",
                impact=f"The compiler's semantic symbol table traversed local, enclosing, global, and built-in scopes but found no binding for symbol '{var_name}'. Compiling this will raise NameError at runtime as no memory address or opcode can be emitted.",
                canonical_spec=canonical,
                anatomy=anatomy,
                correction_schematic=schematic
            )

        # 5. MISSING SEMICOLON (C++, JS)
        if "SEMICOLON" in code or "expected ';'" in msg_lower:
            anatomy = [
                SyntaxAnatomyItem(token=cleaned_line or "expression", label="Executable Statement Expression", status="valid", role="expression"),
                SyntaxAnatomyItem(token=";", label="Statement Terminator Semicolon", status="missing", role="delimiter"),
            ]
            canonical = "std::cout << \"System ready.\" << std::endl;\nreturn 0;"
            schematic = f"{cleaned_line}   <--- [ERROR: Missing ';']\n{cleaned_line};  <--- [CORRECT: Semicolon Appended]"

            return ErrorBlueprint(
                title="Statement Termination Syntax Blueprint",
                grammar_rule="expression_statement ::= [expression] ';'",
                parser_stage="Syntactic Parser (Grammar Statement Delimiter)",
                expected_token="';' (Statement Terminator)",
                actual_token="'\\n' (Newline or subsequent statement start)",
                impact="In C++ and strict grammar specifications, semicolons are required statement terminators. The syntactic parser cannot distinguish where the expression ends, causing subsequent keywords to be treated as invalid expression continuations.",
                canonical_spec=canonical,
                anatomy=anatomy,
                correction_schematic=schematic
            )

        # 6. MUTABLE DEFAULT ARGUMENT (Python)
        if "MUTABLE_DEFAULT" in code:
            anatomy = [
                SyntaxAnatomyItem(token="def function_name(arg=", label="Function Parameter Declaration", status="valid", role="keyword"),
                SyntaxAnatomyItem(token="[]", label="Mutable Collection Default (List/Dict)", status="unexpected", role="expression"),
                SyntaxAnatomyItem(token="None", label="Immutable Sentinel Value", status="missing", role="identifier"),
            ]
            canonical = "def append_item(item: str, target_list: list = None) -> list:\n    if target_list is None:\n        target_list = []\n    target_list.append(item)\n    return target_list"
            schematic = "def buggy(items=[]):        <--- [ERROR: Mutable default evaluated once at import]\ndef safe(items=None):      <--- [CORRECT: Sentinel None pattern]\n    if items is None:\n        items = []"

            return ErrorBlueprint(
                title="Default Argument & Object Identity Blueprint",
                grammar_rule="parameter ::= identifier ['=' immutable_expression]",
                parser_stage="Semantic AST Inspection",
                expected_token="'None' sentinel or immutable literal",
                actual_token="Mutable object reference ([], {}, set())",
                impact="In Python, default parameter expressions are evaluated exactly once when the function definition is executed (at module import time). Using a mutable container shares that exact same object instance across every subsequent function call.",
                canonical_spec=canonical,
                anatomy=anatomy,
                correction_schematic=schematic
            )

        # 7. INVALID INCLUDE (C++)
        if "INVALID_INCLUDE" in code or "#include" in msg_lower:
            anatomy = [
                SyntaxAnatomyItem(token="#include", label="Preprocessor Directive Token", status="valid", role="keyword"),
                SyntaxAnatomyItem(token="<iostream>", label="System Header Enclosure (<...> or \"...\")", status="missing", role="delimiter"),
            ]
            canonical = "#include <iostream>\n#include <vector>\n#include <string>"
            schematic = "#include iostream     <--- [ERROR: Missing '<' and '>']\n#include <iostream>   <--- [CORRECT: Angle Bracket Enclosure]"

            return ErrorBlueprint(
                title="C++ Preprocessor Directive Blueprint",
                grammar_rule="include_directive ::= '#' 'include' ('<' header '>' | '\"' header '\"')",
                parser_stage="Preprocessor Translation Phase (Phase 4)",
                expected_token="'<filename>' or '\"filename\"'",
                actual_token="Unenclosed header identifier",
                impact="The C++ preprocessor failed to recognize the target header path. Without angle brackets for system libraries or quotes for local files, header expansion cannot link into the translation unit.",
                canonical_spec=canonical,
                anatomy=anatomy,
                correction_schematic=schematic
            )

        # 8. NO MAIN FUNCTION (C++)
        if "NO_MAIN" in code or "main" in msg_lower:
            anatomy = [
                SyntaxAnatomyItem(token="int", label="Return Type Specifier", status="missing", role="keyword"),
                SyntaxAnatomyItem(token="main", label="Entrypoint Identifier 'main'", status="missing", role="identifier"),
                SyntaxAnatomyItem(token="()", label="Parameter List", status="missing", role="delimiter"),
                SyntaxAnatomyItem(token="{ ... }", label="Compound Statement Body", status="missing", role="scope"),
            ]
            canonical = "#include <iostream>\n\nint main() {\n    std::cout << \"CodeMaster AI Ready!\" << std::endl;\n    return 0;\n}"
            schematic = "int main() {\n    // Executable instructions\n    return 0;\n}"

            return ErrorBlueprint(
                title="Program Entrypoint Architecture Blueprint",
                grammar_rule="entrypoint ::= 'int' 'main' '(' [param_list] ')' compound_statement",
                parser_stage="Linker & Entrypoint Resolver",
                expected_token="'int main()' signature definition",
                actual_token="No entrypoint symbol found",
                impact="A standalone executable C++ binary requires an 'int main()' function as the designated operating system startup routine. Without it, the linker aborts because the entry symbol cannot be bound.",
                canonical_spec=canonical,
                anatomy=anatomy,
                correction_schematic=schematic
            )

        # 9. Generic / General Syntax Blueprint
        anatomy = [
            SyntaxAnatomyItem(token=cleaned_line or "code_statement", label="Source Code Token Stream", status="unexpected", role="expression"),
            SyntaxAnatomyItem(token="valid_token", label="Grammar-Conforming Token", status="missing", role="delimiter"),
        ]
        return ErrorBlueprint(
            title=f"{language.capitalize()} Syntactic Architecture Blueprint",
            grammar_rule=f"statement ::= expression / declaration [ISO/{language.upper()}]",
            parser_stage="Abstract Syntax Tree (AST) Syntactic Parser",
            expected_token="Grammar-valid language token sequence",
            actual_token=f"Violation at Line {line}, Column {column}",
            impact=f"The {language} compiler or parser encountered an unexpected sequence of tokens that does not match any valid production rule in the formal language grammar.",
            canonical_spec=cleaned_line if cleaned_line else f"# Standard {language} syntax",
            anatomy=anatomy,
            correction_schematic=f"{cleaned_line}  <--- [ERROR: {message}]"
        )


class PythonCodeChecker:
    """Preflight static analysis for Python using AST parsing and pyflakes."""
    
    @staticmethod
    def analyze(source_code: str) -> List[Diagnostic]:
        diagnostics: List[Diagnostic] = []
        
        # 1. AST Parsing for SyntaxError & IndentationError
        try:
            tree = ast.parse(source_code, filename="<user_code>")
        except SyntaxError as e:
            line = e.lineno or 1
            col = e.offset or 1
            msg = e.msg or "Syntax error"
            
            lines = source_code.splitlines()
            line_idx = line - 1
            line_text = lines[line_idx] if 0 <= line_idx < len(lines) else ""
            
            # Bound col to line text length
            if line_text:
                col = max(1, min(col, len(line_text)))
                end_col = getattr(e, 'end_offset', None) or (len(line_text) + 1)
            else:
                end_col = col + 2

            # Beginner friendly tips
            err_code = "SYNTAX_ERROR"
            suggested_fix = None
            if "expected ':'" in msg.lower():
                err_code = "MISSING_COLON"
                suggested_fix = "Add a colon ':' at the end of the statement line."
            elif "unmatched" in msg.lower() or "was never closed" in msg.lower():
                err_code = "UNCLOSED_BRACKET_OR_PAREN"
                suggested_fix = "Ensure every opening parenthesis, bracket, or quotation mark has a matching closing pair."
            elif isinstance(e, IndentationError):
                err_code = "INDENTATION_ERROR"
                suggested_fix = "Use consistent 4-space indentation for nested code blocks."

            blueprint = BlueprintEngine.generate(
                err_code=err_code,
                message=msg,
                line_text=line_text,
                language="python",
                line=line,
                column=col
            )
                
            diagnostics.append(Diagnostic(
                severity="error",
                line=line,
                column=col,
                end_line=getattr(e, 'end_lineno', None) or line,
                end_column=end_col,
                error_code=err_code,
                message=f"Python Syntax Error: {msg}",
                source="python-ast",
                suggested_fix=suggested_fix,
                blueprint=blueprint
            ))
            # AST failed, return immediately as other tools cannot parse malformed syntax
            return diagnostics

        # 2. Pyflakes Static Analysis for Semantic / Name Errors
        try:
            w = checker.Checker(tree, filename="<user_code>")
            lines = source_code.splitlines()
            for message in w.messages:
                line = message.lineno
                col = getattr(message, 'col', 1) or 1
                msg_str = message.message % message.message_args
                line_idx = line - 1
                line_text = lines[line_idx] if 0 <= line_idx < len(lines) else ""
                end_col = len(line_text) + 1 if line_text else col + 1

                # Pinpoint precise column for undefined variables
                if isinstance(message, messages.UndefinedName) and message.message_args:
                    var_name = str(message.message_args[0])
                    idx_in_line = line_text.find(var_name)
                    if idx_in_line != -1:
                        col = idx_in_line + 1
                        end_col = col + len(var_name)
                
                # Severity determination
                if isinstance(message, (messages.UndefinedName, messages.ReturnOutsideFunction, messages.YieldOutsideFunction)):
                    sev = "error"
                    code = "UNDEFINED_NAME" if isinstance(message, messages.UndefinedName) else "ILLEGAL_STATEMENT"
                    suggested = "Ensure all referenced variables and functions are defined or imported prior to use."
                elif isinstance(message, (messages.UnusedImport, messages.UnusedVariable)):
                    sev = "warning"
                    code = "UNUSED_IDENTIFIER"
                    suggested = "Remove unused variable or import to keep the namespace clean."
                elif isinstance(message, (messages.RedefinedWhileUnused, messages.DuplicateArgumentName)):
                    sev = "warning"
                    code = "REDEFINED_IDENTIFIER"
                    suggested = "Avoid shadowing existing variable or parameter names."
                else:
                    sev = "warning"
                blueprint = BlueprintEngine.generate(
                    err_code=code,
                    message=msg_str,
                    line_text=line_text,
                    language="python",
                    line=line,
                    column=col
                )
                    
                diagnostics.append(Diagnostic(
                    severity=sev,
                    line=line,
                    column=col,
                    end_line=line,
                    end_column=end_col,
                    error_code=code,
                    message=msg_str,
                    source="pyflakes",
                    suggested_fix=suggested,
                    blueprint=blueprint
                ))
        except Exception:
            pass

        # 3. Detect mutable default arguments in functions
        for node in ast.walk(tree):
            if isinstance(node, ast.FunctionDef):
                for default in node.args.defaults:
                    if isinstance(default, (ast.List, ast.Dict, ast.Set)):
                        blueprint = BlueprintEngine.generate(
                            err_code="MUTABLE_DEFAULT_ARG",
                            message=f"Function '{node.name}' uses a mutable default argument",
                            line_text=f"def {node.name}(...):",
                            language="python",
                            line=default.lineno,
                            column=default.col_offset + 1
                        )
                        diagnostics.append(Diagnostic(
                            severity="warning",
                            line=default.lineno,
                            column=default.col_offset + 1,
                            error_code="MUTABLE_DEFAULT_ARG",
                            message=f"Function '{node.name}' uses a mutable default argument. Use None and instantiate inside the function.",
                            source="ast-linter",
                            suggested_fix="def func(arg=None): if arg is None: arg = []",
                            blueprint=blueprint
                        ))

        return diagnostics


class JavaScriptCodeChecker:
    """Preflight static analysis for JavaScript using Node.js syntax checker & AST heuristics."""
    
    @staticmethod
    def analyze(source_code: str) -> List[Diagnostic]:
        diagnostics: List[Diagnostic] = []
        node_bin = shutil.which("node")
        
        # 1. Run Node.js --check on temporary script
        if node_bin:
            with tempfile.NamedTemporaryFile("w", suffix=".js", delete=False, encoding="utf-8") as tmp:
                tmp.write(source_code)
                tmp_path = tmp.name
                
            try:
                result = subprocess.run(
                    [node_bin, "--check", tmp_path],
                    capture_output=True,
                    text=True,
                    timeout=3
                )
                if result.returncode != 0:
                    stderr = result.stderr or ""
                    # Parse error line and message: e.g. "path:3:15: SyntaxError: Unexpected token ')'"
                    # or "SyntaxError: Unexpected identifier on line 2"
                    line = 1
                    col = 1
                    msg = "JavaScript Syntax Error"
                    
                    match = re.search(r":(\d+)(?::(\d+))?", stderr)
                    if match:
                        line = int(match.group(1))
                        if match.group(2):
                            col = int(match.group(2))
                            
                    for l in stderr.splitlines():
                        if "SyntaxError:" in l:
                            msg = l.strip()
                            break
                            
                    suggested_fix = None
                    if "unexpected token" in msg.lower():
                        suggested_fix = "Check for missing or extra brackets, semicolons, or commas."
                    elif "already been declared" in msg.lower():
                        suggested_fix = "Avoid declaring the same variable multiple times in the same scope."
                        
                    lines = source_code.splitlines()
                    line_text = lines[line - 1] if 0 <= line - 1 < len(lines) else ""
                    blueprint = BlueprintEngine.generate(
                        err_code="JS_SYNTAX_ERROR",
                        message=msg,
                        line_text=line_text,
                        language="javascript",
                        line=line,
                        column=col
                    )
                    diagnostics.append(Diagnostic(
                        severity="error",
                        line=line,
                        column=col,
                        error_code="JS_SYNTAX_ERROR",
                        message=msg,
                        source="node-parser",
                        suggested_fix=suggested_fix,
                        blueprint=blueprint
                    ))
                    return diagnostics
            except Exception:
                pass
            finally:
                if os.path.exists(tmp_path):
                    try:
                        os.remove(tmp_path)
                    except OSError:
                        pass

        # 2. Heuristic checks for unclosed brackets and common bugs
        lines = source_code.splitlines()
        bracket_stack = []
        matching = {')': '(', '}': '{', ']': '['}
        
        in_multiline_comment = False
        for idx, line_text in enumerate(lines, start=1):
            trimmed = line_text.strip()
            
            # Check equality operator warning
            if "==" in line_text and "===" not in line_text and "!=" not in line_text:
                if not trimmed.startswith("//") and not in_multiline_comment:
                    diagnostics.append(Diagnostic(
                        severity="warning",
                        line=idx,
                        column=line_text.find("==") + 1,
                        error_code="LOOSE_EQUALITY",
                        message="Use strict equality '===' instead of loose equality '==' to avoid implicit type coercion.",
                        source="js-linter",
                        suggested_fix="Replace '==' with '==='"
                    ))

            # Bracket balance check
            i = 0
            while i < len(line_text):
                char = line_text[i]
                if char in "({[":
                    bracket_stack.append((char, idx, i + 1))
                elif char in ")}]":
                    if not bracket_stack or bracket_stack[-1][0] != matching[char]:
                        blueprint = BlueprintEngine.generate(
                            err_code="UNMATCHED_BRACKET",
                            message=f"Unmatched closing delimiter '{char}'.",
                            line_text=line_text,
                            language="javascript",
                            line=idx,
                            column=i + 1
                        )
                        diagnostics.append(Diagnostic(
                            severity="error",
                            line=idx,
                            column=i + 1,
                            error_code="UNMATCHED_BRACKET",
                            message=f"Unmatched closing delimiter '{char}'.",
                            source="js-checker",
                            suggested_fix=f"Ensure matching open bracket for '{char}'",
                            blueprint=blueprint
                        ))
                    else:
                        bracket_stack.pop()
                i += 1
                
        if bracket_stack and not diagnostics:
            unclosed, u_line, u_col = bracket_stack[-1]
            u_line_text = lines[u_line - 1] if 0 <= u_line - 1 < len(lines) else ""
            blueprint = BlueprintEngine.generate(
                err_code="UNCLOSED_DELIMITER",
                message=f"Unclosed opening delimiter '{unclosed}'.",
                line_text=u_line_text,
                language="javascript",
                line=u_line,
                column=u_col
            )
            diagnostics.append(Diagnostic(
                severity="error",
                line=u_line,
                column=u_col,
                error_code="UNCLOSED_DELIMITER",
                message=f"Unclosed opening delimiter '{unclosed}'.",
                source="js-checker",
                suggested_fix=f"Close '{unclosed}' with corresponding closing bracket.",
                blueprint=blueprint
            ))

        return diagnostics


class CppCodeChecker:
    """Preflight static analysis for C++ using compiler syntax check or lexical verification."""
    
    @staticmethod
    def analyze(source_code: str) -> List[Diagnostic]:
        diagnostics: List[Diagnostic] = []
        
        # 1. Check if g++ or clang++ is installed on system
        compiler = shutil.which("clang++") or shutil.which("g++")
        if compiler:
            with tempfile.NamedTemporaryFile("w", suffix=".cpp", delete=False, encoding="utf-8") as tmp:
                tmp.write(source_code)
                tmp_path = tmp.name
                
            try:
                result = subprocess.run(
                    [compiler, "-fsyntax-only", "-std=c++20", tmp_path],
                    capture_output=True,
                    text=True,
                    timeout=4
                )
                if result.returncode != 0:
                    output = result.stderr or result.stdout or ""
                    # Parse diagnostics like "file:4:5: error: expected ';' before 'return'"
                    for line_out in output.splitlines():
                        match = re.search(r":(\d+):(\d+):\s*(error|warning):\s*(.+)", line_out)
                        if match:
                            lineno = int(match.group(1))
                            col = int(match.group(2))
                            level = "error" if match.group(3) == "error" else "warning"
                            raw_msg = match.group(4)
                            
                            code = "CPP_SYNTAX_ERROR" if level == "error" else "CPP_WARNING"
                            fix = None
                            if "expected ';'" in raw_msg:
                                fix = "Add missing semicolon ';' at the end of the statement."
                            elif "not declared in this scope" in raw_msg:
                                fix = "Check variable spelling or include the corresponding header (e.g., #include <vector>)."
                                
                            lines_cpp = source_code.splitlines()
                            cpp_line_text = lines_cpp[lineno - 1] if 0 <= lineno - 1 < len(lines_cpp) else ""
                            blueprint = BlueprintEngine.generate(
                                err_code=code,
                                message=raw_msg,
                                line_text=cpp_line_text,
                                language="cpp",
                                line=lineno,
                                column=col
                            )
                            diagnostics.append(Diagnostic(
                                severity=level,
                                line=lineno,
                                column=col,
                                error_code=code,
                                message=f"C++: {raw_msg}",
                                source="compiler-check",
                                suggested_fix=fix,
                                blueprint=blueprint
                            ))
                    if diagnostics:
                        return diagnostics
            except Exception:
                pass
            finally:
                if os.path.exists(tmp_path):
                    try:
                        os.remove(tmp_path)
                    except OSError:
                        pass

        # 2. Structural & Lexical Validator for C++
        lines = source_code.splitlines()
        has_main = False
        bracket_stack = []
        matching = {')': '(', '}': '{', ']': '['}
        
        for idx, line in enumerate(lines, start=1):
            stripped = line.strip()
            
            # Check main function signature
            if re.search(r"\bint\s+main\s*\(", stripped):
                has_main = True
                
            # Check include syntax
            if stripped.startswith("#include"):
                if not (stripped.endswith(">") or stripped.endswith('"')):
                    blueprint = BlueprintEngine.generate(
                        err_code="INVALID_INCLUDE",
                        message="Malformed #include directive. Headers must be enclosed in <...> or \"...\".",
                        line_text=line,
                        language="cpp",
                        line=idx,
                        column=1
                    )
                    diagnostics.append(Diagnostic(
                        severity="error",
                        line=idx,
                        column=1,
                        error_code="INVALID_INCLUDE",
                        message="Malformed #include directive. Headers must be enclosed in <...> or \"...\".",
                        source="cpp-validator",
                        suggested_fix='#include <iostream>',
                        blueprint=blueprint
                    ))

            # Missing semicolon check on simple statement candidates
            if stripped and not stripped.startswith("//") and not stripped.startswith("#") and not stripped.startswith("/*"):
                if not stripped.endswith(";") and not stripped.endswith("{") and not stripped.endswith("}") and not stripped.endswith(":"):
                    # If line looks like a statement: std::cout, return, variable assignment
                    if any(stripped.startswith(prefix) for prefix in ["std::", "cout", "cin", "return ", "int ", "double ", "auto ", "string "]):
                        if "(" in stripped and ")" in stripped and not stripped.endswith(")"):
                            pass
                        elif not stripped.endswith(">") and not stripped.endswith(","):
                            blueprint = BlueprintEngine.generate(
                                err_code="MISSING_SEMICOLON",
                                message="Missing semicolon ';' at the end of the statement.",
                                line_text=line,
                                language="cpp",
                                line=idx,
                                column=len(line)
                            )
                            diagnostics.append(Diagnostic(
                                severity="error",
                                line=idx,
                                column=len(line),
                                error_code="MISSING_SEMICOLON",
                                message="Missing semicolon ';' at the end of the statement.",
                                source="cpp-validator",
                                suggested_fix="Add ';' at the end of the line",
                                blueprint=blueprint
                            ))

            # Bracket balance check
            for col_idx, ch in enumerate(line, start=1):
                if ch in "({[":
                    bracket_stack.append((ch, idx, col_idx))
                elif ch in ")}]":
                    if not bracket_stack or bracket_stack[-1][0] != matching[ch]:
                        blueprint = BlueprintEngine.generate(
                            err_code="UNBALANCED_DELIMITER",
                            message=f"Unmatched closing bracket '{ch}'.",
                            line_text=line,
                            language="cpp",
                            line=idx,
                            column=col_idx
                        )
                        diagnostics.append(Diagnostic(
                            severity="error",
                            line=idx,
                            column=col_idx,
                            error_code="UNBALANCED_DELIMITER",
                            message=f"Unmatched closing bracket '{ch}'.",
                            source="cpp-validator",
                            blueprint=blueprint
                        ))
                    else:
                        bracket_stack.pop()

        if bracket_stack and not diagnostics:
            b_char, b_line, b_col = bracket_stack[-1]
            b_line_text = lines[b_line - 1] if 0 <= b_line - 1 < len(lines) else ""
            blueprint = BlueprintEngine.generate(
                err_code="UNCLOSED_DELIMITER",
                message=f"Unclosed opening bracket '{b_char}'.",
                line_text=b_line_text,
                language="cpp",
                line=b_line,
                column=b_col
            )
            diagnostics.append(Diagnostic(
                severity="error",
                line=b_line,
                column=b_col,
                error_code="UNCLOSED_DELIMITER",
                message=f"Unclosed opening bracket '{b_char}'.",
                source="cpp-validator",
                blueprint=blueprint
            ))

        if not has_main and not any(d.severity == 'error' for d in diagnostics):
            blueprint = BlueprintEngine.generate(
                err_code="NO_MAIN_FUNCTION",
                message="No 'int main()' entrypoint found. Standard executable programs require a main function.",
                line_text="",
                language="cpp",
                line=1,
                column=1
            )
            diagnostics.append(Diagnostic(
                severity="warning",
                line=1,
                column=1,
                error_code="NO_MAIN_FUNCTION",
                message="No 'int main()' entrypoint found. Standard executable programs require a main function.",
                source="cpp-validator",
                suggested_fix="int main() {\n    return 0;\n}",
                blueprint=blueprint
            ))

        return diagnostics


class StaticAnalysisEngine:
    """Master static analysis orchestrator for all supported languages."""
    
    @classmethod
    def analyze(cls, language: str, source_code: str) -> AnalysisResponse:
        lang_normalized = language.strip().lower()
        if lang_normalized in ["python", "py", "python3"]:
            diagnostics = PythonCodeChecker.analyze(source_code)
        elif lang_normalized in ["javascript", "js", "node"]:
            diagnostics = JavaScriptCodeChecker.analyze(source_code)
        elif lang_normalized in ["cpp", "c++", "cplusplus"]:
            diagnostics = CppCodeChecker.analyze(source_code)
        else:
            diagnostics = [Diagnostic(
                severity="error",
                line=1,
                column=1,
                error_code="UNSUPPORTED_LANGUAGE",
                message=f"Language '{language}' is not supported for static analysis.",
                source="preflight"
            )]

        has_blocking = any(d.severity == "error" for d in diagnostics)
        can_execute = not has_blocking
        
        if not diagnostics:
            summary = "No issues detected by available checks"
        else:
            errors = sum(1 for d in diagnostics if d.severity == "error")
            warnings = sum(1 for d in diagnostics if d.severity == "warning")
            summary = f"Analysis found {errors} error(s) and {warnings} warning(s)"

        return AnalysisResponse(
            can_execute=can_execute,
            has_blocking_errors=has_blocking,
            diagnostics=diagnostics,
            summary=summary,
            checked_at=datetime.now(timezone.utc).isoformat(),
            language=language
        )
