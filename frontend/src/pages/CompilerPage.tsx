import React, { useState, useEffect } from 'react';
import { 
  Play, 
  ShieldCheck, 
  Sparkles, 
  RotateCcw, 
  Save, 
  FileCode, 
  Check, 
  AlertCircle,
  Loader2,
  CheckCircle2,
  Compass
} from 'lucide-react';

import { MonacoCodeEditor } from '../components/editor/MonacoCodeEditor';
import { DiagnosticsPanel } from '../components/editor/DiagnosticsPanel';
import { AITutorPanel } from '../components/editor/AITutorPanel';
import { OutputPanel } from '../components/editor/OutputPanel';
import { ErrorBlueprintCard } from '../components/editor/ErrorBlueprintCard';
import { api } from '../services/api';
import { 
  Diagnostic, 
  ExecutionResponse, 
  AITutorResponse, 
  LanguageSlug, 
  LanguageItem 
} from '../types';
import { useAuth } from '../context/AuthContext';

export const CompilerPage: React.FC = () => {
  const { addXP } = useAuth();

  // State
  const [language, setLanguage] = useState<LanguageSlug>('python');
  const [languages, setLanguages] = useState<LanguageItem[]>([]);
  const [code, setCode] = useState<string>('');
  const [stdin, setStdin] = useState<string>('');
  
  // Diagnostics & Execution state
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [selectedDiagnostic, setSelectedDiagnostic] = useState<Diagnostic | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<ExecutionResponse | null>(null);
  
  // AI Tutor state
  const [tutorLoading, setTutorLoading] = useState(false);
  const [tutorResponse, setTutorResponse] = useState<AITutorResponse | null>(null);

  // Panel layout state
  const [rightPanelTab, setRightPanelTab] = useState<'diagnostics' | 'tutor' | 'blueprint'>('diagnostics');
  const [savedStatus, setSavedStatus] = useState<string | null>(null);

  // Load languages and initial template on mount
  useEffect(() => {
    api.getLanguages()
      .then((data) => {
        setLanguages(data);
        const currentLang = data.find(l => l.slug === language);
        if (currentLang && !code) {
          setCode(currentLang.starter_code);
        }
      })
      .catch((err) => {
        console.error('Failed to load languages:', err);
      });
  }, []);

  // Real-time debounced pre-execution error analysis as user types
  useEffect(() => {
    if (!code.trim()) {
      setDiagnostics([]);
      setSelectedDiagnostic(null);
      return;
    }

    const timer = setTimeout(() => {
      setAnalyzing(true);
      api.analyzeCode(language, code)
        .then((res) => {
          setDiagnostics(res.diagnostics);
          if (res.diagnostics.length > 0) {
            setSelectedDiagnostic(res.diagnostics[0]);
          } else {
            setSelectedDiagnostic(null);
          }
        })
        .catch((err) => {
          console.error('Debounced pre-execution error analysis failed:', err);
        })
        .finally(() => {
          setAnalyzing(false);
        });
    }, 300); // 300ms responsive debounce for instantaneous syntax error spotting

    return () => clearTimeout(timer);
  }, [code, language]);

  // Handle language switch
  const handleLanguageChange = (newLang: LanguageSlug) => {
    setLanguage(newLang);
    const target = languages.find(l => l.slug === newLang);
    if (target) {
      setCode(target.starter_code);
    }
    setDiagnostics([]);
    setSelectedDiagnostic(null);
    setExecutionResult(null);
    setTutorResponse(null);
  };

  // 1. Manual Analyze Code Trigger
  const handleAnalyze = async () => {
    if (!code.trim()) return;
    setAnalyzing(true);
    try {
      const res = await api.analyzeCode(language, code);
      setDiagnostics(res.diagnostics);
      if (res.diagnostics.length > 0) {
        setSelectedDiagnostic(res.diagnostics[0]);
        setRightPanelTab('diagnostics');
      }
    } catch (err: any) {
      console.error('Analysis failed:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  // 2. Execute Code (Runs preflight first, blocks if confirmed syntax error)
  const handleRun = async (bypassPreflight: boolean = false) => {
    if (!code.trim()) return;
    setExecuting(true);
    try {
      const res = await api.executeCode(language, code, stdin, bypassPreflight);
      setExecutionResult(res);
      setDiagnostics(res.diagnostics);

      if (res.status === 'blocked') {
        setRightPanelTab('diagnostics');
      } else if (res.status === 'passed') {
        addXP(5); // Award micro-XP for clean run
      }
    } catch (err: any) {
      setExecutionResult({
        status: 'failed',
        stderr: err.message || 'Execution failed.',
        sandbox_provider: 'System Error',
        preflight_passed: false,
        diagnostics: []
      });
    } finally {
      setExecuting(false);
    }
  };

  // 3. Explain Diagnostic with AI Tutor
  const handleExplainDiagnostic = async (diag: Diagnostic) => {
    setSelectedDiagnostic(diag);
    setRightPanelTab('tutor');
    setTutorLoading(true);
    try {
      const res = await api.getAITutor('explain_diagnostic', language, code, diag, 1);
      setTutorResponse(res);
    } catch (err) {
      console.error('AI Tutor request failed:', err);
    } finally {
      setTutorLoading(false);
    }
  };

  // 4. Request Progressive Hint
  const handleRequestHint = async (level: number) => {
    setTutorLoading(true);
    try {
      const res = await api.getAITutor(
        'get_hint',
        language,
        code,
        selectedDiagnostic || undefined,
        level
      );
      setTutorResponse(res);
    } catch (err) {
      console.error('Hint request failed:', err);
    } finally {
      setTutorLoading(false);
    }
  };

  // 5. Explain Line-by-Line
  const handleRequestLineExplanation = async () => {
    setTutorLoading(true);
    try {
      const res = await api.getAITutor('explain_code', language, code);
      setTutorResponse(res);
    } catch (err) {
      console.error('Line explanation request failed:', err);
    } finally {
      setTutorLoading(false);
    }
  };

  // 6. Explicitly Apply Fix to Editor
  const handleApplyFix = (patchText: string, diagToFix?: Diagnostic | null) => {
    const diag = diagToFix || selectedDiagnostic || (diagnostics.length > 0 ? diagnostics[0] : null);
    if (!diag) return;
    const lines = code.split('\n');
    const targetLineIndex = diag.line - 1;

    if (targetLineIndex >= 0 && targetLineIndex < lines.length) {
      const currentLine = lines[targetLineIndex];
      const errCode = diag.error_code || '';
      const lowerPatch = (patchText || '').toLowerCase();

      if (errCode === 'MISSING_COLON' || lowerPatch.includes('colon') || patchText.includes("ends with ':'")) {
        lines[targetLineIndex] = currentLine.trimEnd() + ':';
      } else if (errCode === 'MISSING_SEMICOLON' || patchText === ';' || lowerPatch.includes('semicolon')) {
        lines[targetLineIndex] = currentLine.trimEnd() + ';';
      } else if (errCode === 'UNCLOSED_BRACKET_OR_PAREN' || errCode === 'UNCLOSED_DELIMITER' || patchText === ')') {
        if (currentLine.includes('(') && !currentLine.includes(')')) {
          lines[targetLineIndex] = currentLine.trimEnd() + ')';
        } else if (currentLine.includes('[') && !currentLine.includes(']')) {
          lines[targetLineIndex] = currentLine.trimEnd() + ']';
        } else if (currentLine.includes('{') && !currentLine.includes('}')) {
          lines[targetLineIndex] = currentLine.trimEnd() + '}';
        } else {
          lines[targetLineIndex] = currentLine.trimEnd() + ')';
        }
      } else if (errCode === 'INDENTATION_ERROR') {
        lines[targetLineIndex] = '    ' + currentLine.trimStart();
      } else if (!patchText.startsWith('Add ') && !patchText.startsWith('Ensure ')) {
        lines[targetLineIndex] = patchText;
      }

      const updatedCode = lines.join('\n');
      setCode(updatedCode);

      // Re-run analysis immediately after applying patch to verify resolution!
      api.analyzeCode(language, updatedCode).then((res) => {
        setDiagnostics(res.diagnostics);
        if (res.diagnostics.length > 0) {
          setSelectedDiagnostic(res.diagnostics[0]);
        } else {
          setSelectedDiagnostic(null);
        }
      });
    }
  };

  // 6b. Auto-Fix Code and Immediately Re-Execute in Sandbox
  const handleApplyFixAndRun = async (diagToFix?: Diagnostic | null) => {
    const diag = diagToFix || selectedDiagnostic || (diagnostics.length > 0 ? diagnostics[0] : null);
    if (!diag) return;

    const lines = code.split('\n');
    const targetLineIndex = diag.line - 1;

    if (targetLineIndex >= 0 && targetLineIndex < lines.length) {
      const currentLine = lines[targetLineIndex];
      const errCode = diag.error_code || '';
      const fixTip = (diag.suggested_fix || '').toLowerCase();

      if (errCode === 'MISSING_COLON' || fixTip.includes('colon')) {
        lines[targetLineIndex] = currentLine.trimEnd() + ':';
      } else if (errCode === 'MISSING_SEMICOLON' || fixTip.includes('semicolon')) {
        lines[targetLineIndex] = currentLine.trimEnd() + ';';
      } else if (errCode === 'UNCLOSED_BRACKET_OR_PAREN' || errCode === 'UNCLOSED_DELIMITER') {
        if (currentLine.includes('(') && !currentLine.includes(')')) {
          lines[targetLineIndex] = currentLine.trimEnd() + ')';
        } else if (currentLine.includes('[') && !currentLine.includes(']')) {
          lines[targetLineIndex] = currentLine.trimEnd() + ']';
        } else if (currentLine.includes('{') && !currentLine.includes('}')) {
          lines[targetLineIndex] = currentLine.trimEnd() + '}';
        } else {
          lines[targetLineIndex] = currentLine.trimEnd() + ')';
        }
      } else if (errCode === 'INDENTATION_ERROR') {
        lines[targetLineIndex] = '    ' + currentLine.trimStart();
      } else if (errCode === 'NO_MAIN_FUNCTION') {
        lines.push('\nint main() {\n    return 0;\n}');
      }

      const updatedCode = lines.join('\n');
      setCode(updatedCode);

      // Run execution and analysis on fixed code
      setExecuting(true);
      try {
        const [anaRes, execRes] = await Promise.all([
          api.analyzeCode(language, updatedCode),
          api.executeCode(language, updatedCode, stdin, false)
        ]);
        setDiagnostics(anaRes.diagnostics);
        setSelectedDiagnostic(anaRes.diagnostics.length > 0 ? anaRes.diagnostics[0] : null);
        setExecutionResult(execRes);
        if (execRes.status === 'passed') {
          addXP(10);
        }
      } catch (err) {
        console.error('Execution after fix failed:', err);
      } finally {
        setExecuting(false);
      }
    }
  };

  // 7. Reset to Starter Template
  const handleReset = () => {
    const target = languages.find(l => l.slug === language);
    if (target) {
      setCode(target.starter_code);
      setDiagnostics([]);
      setExecutionResult(null);
      setTutorResponse(null);
    }
  };

  // 8. Save Project
  const handleSave = async () => {
    try {
      await api.createProject(
        `${language.toUpperCase()} Workspace Project`,
        `Saved at ${new Date().toLocaleTimeString()}`,
        language,
        code,
        true
      );
      setSavedStatus('Saved!');
      setTimeout(() => setSavedStatus(null), 3000);
    } catch (err) {
      setSavedStatus('Failed to save');
      setTimeout(() => setSavedStatus(null), 3000);
    }
  };

  const errorCount = diagnostics.filter(d => d.severity === 'error').length;
  const warningCount = diagnostics.filter(d => d.severity === 'warning').length;

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-[#0b0f17] text-slate-100 overflow-hidden">
      
      {/* Top Toolbar */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-4 py-2 text-xs">
        {/* Left: Language Selection & Title */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-semibold text-slate-200">
            <FileCode className="h-4 w-4 text-teal-400" />
            <span>Workspace:</span>
          </div>

          <div className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900 p-0.5">
            {(['python', 'javascript', 'cpp'] as LanguageSlug[]).map((lang) => (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`rounded px-2.5 py-1 text-xs font-semibold capitalize transition-all ${
                  language === lang
                    ? 'bg-teal-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lang === 'cpp' ? 'C++20' : lang}
              </button>
            ))}
          </div>

          {/* Live Error Spotting Indicator Badge */}
          <div className="hidden sm:flex items-center">
            {analyzing ? (
              <div className="flex items-center gap-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 px-2.5 py-1 text-[11px] font-medium text-cyan-300">
                <Loader2 className="h-3 w-3 animate-spin text-cyan-400" />
                <span>Checking syntax...</span>
              </div>
            ) : errorCount > 0 ? (
              <button
                onClick={() => setRightPanelTab('diagnostics')}
                className="flex items-center gap-1.5 rounded-full bg-rose-500/20 border border-rose-500/40 px-2.5 py-1 text-[11px] font-bold text-rose-300 hover:bg-rose-500/30 transition-all cursor-pointer"
                title="Click to inspect preflight errors"
              >
                <AlertCircle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                <span>{errorCount} Error{errorCount > 1 ? 's' : ''} Spotted</span>
              </button>
            ) : warningCount > 0 ? (
              <button
                onClick={() => setRightPanelTab('diagnostics')}
                className="flex items-center gap-1.5 rounded-full bg-amber-500/20 border border-amber-500/40 px-2.5 py-1 text-[11px] font-bold text-amber-300 hover:bg-amber-500/30 transition-all cursor-pointer"
                title="Click to inspect warnings"
              >
                <AlertCircle className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                <span>{warningCount} Warning{warningCount > 1 ? 's' : ''}</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-medium text-emerald-400">
                <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                <span>Preflight Clean</span>
              </div>
            )}
          </div>
        </div>

        {/* Center: Controls (Run, Analyze, Reset, Save) */}
        <div className="flex items-center gap-2">
          {/* Analyze Code Button */}
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 font-medium text-slate-300 hover:border-teal-500/50 hover:text-teal-300 transition-all disabled:opacity-50"
            title="Perform pre-execution AST parsing and static linting"
          >
            {analyzing ? <Loader2 className="h-3.5 w-3.5 animate-spin text-teal-400" /> : <ShieldCheck className="h-3.5 w-3.5 text-teal-400" />}
            Analyze Code
          </button>

          {/* Run Code Button */}
          <button
            onClick={() => handleRun(false)}
            disabled={executing}
            className="flex items-center gap-1.5 rounded-lg bg-teal-500 px-4 py-1.5 font-semibold text-slate-950 shadow-glow-cyan hover:bg-teal-400 transition-all disabled:opacity-50"
            title="Execute in isolated sandbox container (Ctrl+Enter)"
          >
            {executing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5 fill-slate-950" />}
            Run Code
          </button>

          {/* Reset Template */}
          <button
            onClick={handleReset}
            className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/60 p-1.5 text-slate-400 hover:text-slate-200 transition-colors"
            title="Reset code to initial template"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          {/* Save Project */}
          <button
            onClick={handleSave}
            className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/60 px-2.5 py-1.5 text-slate-300 hover:text-white transition-colors"
            title="Save project workspace"
          >
            {savedStatus ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Save className="h-3.5 w-3.5" />}
            <span>{savedStatus || 'Save'}</span>
          </button>
        </div>

        {/* Right side helper info */}
        <div className="hidden lg:flex items-center gap-3 text-[11px] text-slate-400">
          <span className="font-mono text-teal-400/80">Ctrl + Enter: Run</span>
          <span className="font-mono text-slate-400">Ctrl + Shift + A: Analyze</span>
        </div>
      </div>

      {/* Main Multi-Panel Workspace */}
      <div className="grid h-full grid-cols-1 lg:grid-cols-12 gap-0 overflow-hidden">
        
        {/* Left Column: Monaco Code Editor + Output Panel (7 Cols) */}
        <div className="flex h-full flex-col lg:col-span-7 border-r border-slate-800/80 overflow-hidden">
          
          {/* Active Preflight Notification Banner if error is spotted */}
          {errorCount > 0 && selectedDiagnostic && (
            <div className="bg-rose-950/40 border-b border-rose-900/60 px-4 py-1.5 flex items-center justify-between text-xs text-rose-300">
              <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
                <AlertCircle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                <span className="font-mono font-bold text-rose-200">Line {selectedDiagnostic.line}:{selectedDiagnostic.column}</span>
                <span className="text-slate-300 truncate">{selectedDiagnostic.message}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0 ml-3">
                {selectedDiagnostic.blueprint && (
                  <button
                    onClick={() => setRightPanelTab('blueprint')}
                    className="flex items-center gap-1 text-[11px] font-semibold text-amber-300 hover:text-amber-200 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded transition-all cursor-pointer"
                    title="Inspect structural syntax blueprint"
                  >
                    <Compass className="h-3 w-3" />
                    View Blueprint
                  </button>
                )}
                <button
                  onClick={() => handleExplainDiagnostic(selectedDiagnostic)}
                  className="flex items-center gap-1 text-[11px] font-semibold text-teal-300 hover:text-teal-200 bg-teal-500/10 border border-teal-500/30 px-2 py-0.5 rounded transition-all cursor-pointer"
                >
                  <Sparkles className="h-3 w-3" />
                  Explain with AI
                </button>
              </div>
            </div>
          )}

          {/* Top Half: Monaco Code Editor (60% height) */}
          <div className="h-[60%] w-full overflow-hidden p-2">
            <MonacoCodeEditor
              code={code}
              onChange={setCode}
              language={language}
              diagnostics={diagnostics}
              activeDiagnostic={selectedDiagnostic}
              onRun={() => handleRun(false)}
              onAnalyze={handleAnalyze}
            />
          </div>

          {/* Bottom Half: Output Terminal & stdin (40% height) */}
          <div className="h-[40%] w-full border-t border-slate-800/80 overflow-hidden">
            <OutputPanel
              loading={executing}
              executionResult={executionResult}
              stdin={stdin}
              onStdinChange={setStdin}
              diagnostics={diagnostics}
              onApplyFixAndRun={handleApplyFixAndRun}
              onBypassPreflight={() => handleRun(true)}
              onExplainError={handleExplainDiagnostic}
              onViewBlueprint={(diag) => {
                setSelectedDiagnostic(diag);
                setRightPanelTab('blueprint');
              }}
            />
          </div>
        </div>

        {/* Right Column: Preflight Diagnostics, Error Blueprint, & AI Tutor Panels (5 Cols) */}
        <div className="flex h-full flex-col lg:col-span-5 bg-slate-950 overflow-hidden">
          {/* Tabs: Diagnostics vs Blueprint vs AI Tutor */}
          <div className="flex items-center border-b border-slate-800 bg-slate-900/40 px-3 py-1.5 gap-1">
            <button
              onClick={() => setRightPanelTab('diagnostics')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                rightPanelTab === 'diagnostics'
                  ? 'bg-slate-800 text-teal-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Diagnostics
              {diagnostics.length > 0 && (
                <span className="ml-1 rounded-full bg-rose-500/20 px-1.5 text-[10px] text-rose-300 font-bold border border-rose-500/30">
                  {diagnostics.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setRightPanelTab('blueprint')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                rightPanelTab === 'blueprint'
                  ? 'bg-slate-800 text-amber-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Compass className="h-3.5 w-3.5 text-amber-400" />
              Error Blueprint
              {selectedDiagnostic?.blueprint && (
                <span className="ml-1 rounded-full bg-amber-500/20 px-1.5 text-[10px] text-amber-300 font-bold border border-amber-500/30">
                  Anatomy
                </span>
              )}
            </button>

            <button
              onClick={() => setRightPanelTab('tutor')}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-semibold transition-all ${
                rightPanelTab === 'tutor'
                  ? 'bg-slate-800 text-teal-400 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sparkles className="h-3.5 w-3.5" />
              AI Tutor
            </button>
          </div>

          {/* Panel View */}
          <div className="flex-1 overflow-hidden">
            {rightPanelTab === 'diagnostics' ? (
              <DiagnosticsPanel
                diagnostics={diagnostics}
                onExplainDiagnostic={handleExplainDiagnostic}
                selectedDiagnostic={selectedDiagnostic}
                onSelectDiagnostic={setSelectedDiagnostic}
                onViewBlueprint={(diag) => {
                  setSelectedDiagnostic(diag);
                  setRightPanelTab('blueprint');
                }}
              />
            ) : rightPanelTab === 'blueprint' ? (
              selectedDiagnostic || diagnostics.length > 0 ? (
                <ErrorBlueprintCard
                  diagnostic={selectedDiagnostic || diagnostics[0]}
                  onExplainWithAI={handleExplainDiagnostic}
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center p-6 text-center bg-slate-950 text-slate-300">
                  <Compass className="h-10 w-10 text-slate-600 mb-3 animate-pulse" />
                  <h4 className="text-sm font-semibold text-slate-300 mb-1">
                    No Syntax Errors Spotted
                  </h4>
                  <p className="text-xs text-slate-400 max-w-sm">
                    Write code in the editor. As soon as a syntax or grammar violation is detected, its architectural token blueprint will appear here in real-time.
                  </p>
                </div>
              )
            ) : (
              <AITutorPanel
                loading={tutorLoading}
                tutorResponse={tutorResponse}
                activeDiagnostic={selectedDiagnostic}
                onRequestHint={handleRequestHint}
                onRequestLineExplanation={handleRequestLineExplanation}
                onApplyFix={handleApplyFix}
              />
            )}
          </div>
        </div>

      </div>

    </div>
  );
};
