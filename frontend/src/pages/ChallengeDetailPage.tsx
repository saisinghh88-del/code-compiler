import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Trophy, 
  ArrowLeft, 
  Play, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Clock, 
  Cpu, 
  Lightbulb, 
  Loader2,
  Check,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

import { api } from '../services/api';
import { ProblemItem, ProblemSubmissionResponse, Diagnostic, LanguageSlug } from '../types';
import { MonacoCodeEditor } from '../components/editor/MonacoCodeEditor';
import { useAuth } from '../context/AuthContext';

export const ChallengeDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addXP } = useAuth();

  const [problem, setProblem] = useState<ProblemItem | null>(null);
  const [code, setCode] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // Preflight analysis state
  const [diagnostics, setDiagnostics] = useState<Diagnostic[]>([]);
  const [analyzing, setAnalyzing] = useState(false);

  // Submission state
  const [submitting, setSubmitting] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<ProblemSubmissionResponse | null>(null);

  // Hints toggle
  const [showHints, setShowHints] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);

    api.getProblem(slug)
      .then((data) => {
        setProblem(data);
        setCode(data.starter_code);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [slug]);

  // Real-time debounced pre-execution error analysis as user types
  useEffect(() => {
    if (!problem || !code.trim()) {
      setDiagnostics([]);
      return;
    }

    const timer = setTimeout(() => {
      setAnalyzing(true);
      api.analyzeCode(problem.language, code)
        .then((res) => {
          setDiagnostics(res.diagnostics);
        })
        .catch((err) => {
          console.error("Challenge preflight analysis failed:", err);
        })
        .finally(() => {
          setAnalyzing(false);
        });
    }, 450);

    return () => clearTimeout(timer);
  }, [code, problem]);

  const handleAnalyze = async () => {
    if (!problem || !code.trim()) return;
    setAnalyzing(true);
    try {
      const res = await api.analyzeCode(problem.language, code);
      setDiagnostics(res.diagnostics);
    } catch (err) {
      console.error(err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = async () => {
    if (!problem || !code.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.submitProblem(problem.id, problem.language, code);
      setSubmissionResult(res);

      if (res.status === 'passed') {
        addXP(50);
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        } catch (e) {}
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !problem) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0b0f17]">
        <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col bg-[#0b0f17] text-slate-100 overflow-hidden">
      
      {/* Top Navbar */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-4 py-2 text-xs">
        <div className="flex items-center gap-3">
          <Link to="/challenges" className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            Challenges
          </Link>
          <span className="text-slate-600">/</span>
          <span className="font-bold text-white">{problem.title}</span>
          <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-bold uppercase text-emerald-400">
            {problem.difficulty}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-300 hover:border-teal-500/50 hover:text-teal-300 transition-all disabled:opacity-50"
          >
            {analyzing ? <Loader2 className="h-3.5 w-3.5 animate-spin text-teal-400" /> : <ShieldCheck className="h-3.5 w-3.5 text-teal-400" />}
            Preflight Check
          </button>

          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="flex items-center gap-1.5 rounded-lg bg-teal-500 px-4 py-1.5 text-xs font-semibold text-slate-950 shadow-glow-cyan hover:bg-teal-400 transition-all disabled:opacity-50"
          >
            {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Play className="h-3.5 w-3.5 fill-slate-950" />}
            Submit Solution
          </button>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid h-full grid-cols-1 lg:grid-cols-12 overflow-hidden">
        
        {/* Left Column: Problem Details & Submissions (5 Cols) */}
        <div className="lg:col-span-5 h-full overflow-y-auto border-r border-slate-800 p-6 space-y-6 bg-slate-950/60">
          
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-white">{problem.title}</h2>
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 text-xs text-slate-300 leading-relaxed whitespace-pre-line">
              {problem.description}
            </div>
          </div>

          {problem.constraints && (
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Constraints:
              </h4>
              <div className="rounded-xl border border-slate-800 bg-slate-900/20 p-3 font-mono text-[11px] text-slate-300 whitespace-pre-line">
                {problem.constraints}
              </div>
            </div>
          )}

          {/* Public Test Cases */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Example Test Cases:
            </h4>
            <div className="space-y-2">
              {problem.public_test_cases.map((tc, idx) => (
                <div key={tc.id} className="rounded-xl border border-slate-800 bg-[#0d1117] p-3 text-xs space-y-1 font-mono">
                  <div className="text-slate-400 text-[10px] font-sans font-semibold">Example {idx + 1}:</div>
                  <div><span className="text-slate-500">Input: </span><span className="text-slate-200">{tc.input_data}</span></div>
                  <div><span className="text-slate-500">Output: </span><span className="text-teal-400">{tc.expected_output}</span></div>
                  {tc.explanation && (
                    <div className="text-[11px] text-slate-400 font-sans pt-1">
                      {tc.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Hints Accordion */}
          {problem.hints && problem.hints.length > 0 && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/30 overflow-hidden">
              <button
                onClick={() => setShowHints(!showHints)}
                className="flex w-full items-center justify-between p-3.5 text-xs font-semibold text-amber-400 hover:bg-slate-900/50 transition-colors"
              >
                <div className="flex items-center gap-1.5">
                  <Lightbulb className="h-4 w-4" />
                  View Algorithmic Hints ({problem.hints.length})
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${showHints ? 'rotate-180' : ''}`} />
              </button>

              {showHints && (
                <div className="p-3.5 border-t border-slate-800/80 space-y-2 text-xs text-slate-300">
                  {problem.hints.map((hint, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="font-bold text-amber-400 text-[11px]">{i + 1}.</span>
                      <span className="leading-relaxed">{hint}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Submission Scorecard */}
          {submissionResult && (
            <div className={`rounded-2xl border p-5 space-y-4 ${
              submissionResult.status === 'passed'
                ? 'border-emerald-500/40 bg-emerald-950/20'
                : 'border-rose-500/40 bg-rose-950/20'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {submissionResult.status === 'passed' ? (
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  ) : (
                    <XCircle className="h-5 w-5 text-rose-400" />
                  )}
                  <span className="text-sm font-bold text-white">
                    {submissionResult.status === 'passed' ? 'All Test Cases Passed! (+50 XP)' : 'Some Test Cases Failed'}
                  </span>
                </div>
                <span className="text-xs font-mono font-bold text-slate-200">
                  {submissionResult.passed_tests} / {submissionResult.total_tests} Tests
                </span>
              </div>

              <div className="flex items-center gap-4 text-[11px] text-slate-300 font-mono">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5 text-cyan-400" />
                  {submissionResult.execution_time_ms} ms
                </span>
                <span className="flex items-center gap-1">
                  <Cpu className="h-3.5 w-3.5 text-indigo-400" />
                  {submissionResult.memory_kb} KB
                </span>
              </div>

              {/* Individual test results */}
              <div className="space-y-1.5 pt-2">
                {submissionResult.results.map((tr, idx) => (
                  <div
                    key={idx}
                    className={`flex items-center justify-between rounded-lg p-2 text-xs font-mono ${
                      tr.passed
                        ? 'bg-emerald-950/40 text-emerald-300'
                        : 'bg-rose-950/40 text-rose-300'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {tr.passed ? <Check className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                      <span>Test Case {idx + 1} {tr.is_hidden ? '(Hidden Suite)' : ''}</span>
                    </div>
                    <span>{tr.passed ? 'PASSED' : 'FAILED'}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Code Editor (7 Cols) */}
        <div className="lg:col-span-7 h-full p-2 overflow-hidden bg-[#0d1117]">
          <MonacoCodeEditor
            code={code}
            onChange={setCode}
            language={problem.language as LanguageSlug}
            diagnostics={diagnostics}
            onRun={handleSubmit}
            onAnalyze={handleAnalyze}
          />
        </div>

      </div>

    </div>
  );
};
