import React, { useState } from 'react';
import { 
  Sparkles, 
  Lightbulb, 
  Code, 
  ShieldCheck, 
  Check, 
  ArrowRight, 
  HelpCircle, 
  Loader2,
  FileText,
  RotateCcw
} from 'lucide-react';
import { api } from '../services/api';
import { AITutorResponse, Diagnostic, LanguageSlug } from '../types';

export const AITutorPage: React.FC = () => {
  const [language, setLanguage] = useState<LanguageSlug>('python');
  const [sourceCode, setSourceCode] = useState<string>(
    '# Paste any code snippet with an error or question\ndef divide_items(items, n)\n    return [item / n for item in items]\n\nprint(divide_items([10, 20, 30], 2))'
  );
  const [hintLevel, setHintLevel] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [tutorResult, setTutorResult] = useState<AITutorResponse | null>(null);

  // 1. Diagnose & Explain Code
  const handleDiagnose = async () => {
    if (!sourceCode.trim()) return;
    setLoading(true);
    try {
      // First run static analysis to detect verified diagnostics
      const analysis = await api.analyzeCode(language, sourceCode);
      const topDiag = analysis.diagnostics.length > 0 ? analysis.diagnostics[0] : undefined;

      const res = await api.getAITutor(
        'explain_diagnostic',
        language,
        sourceCode,
        topDiag,
        hintLevel
      );
      setTutorResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 2. Line by line explanation
  const handleExplainLines = async () => {
    if (!sourceCode.trim()) return;
    setLoading(true);
    try {
      const res = await api.getAITutor('explain_code', language, sourceCode);
      setTutorResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // 3. Progressive hints
  const handleGetHint = async (lvl: number) => {
    setHintLevel(lvl);
    if (!sourceCode.trim()) return;
    setLoading(true);
    try {
      const res = await api.getAITutor('get_hint', language, sourceCode, undefined, lvl);
      setTutorResult(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-400 border border-teal-500/20">
            <Sparkles className="h-3.5 w-3.5" />
            AI Coding Tutor & Diagnostic Studio
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Understand Code Errors with Pedagogical Clarity
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Get structured root-cause breakdowns, 3-tier progressive hints that guide without spoiling, and line-by-line concept maps.
          </p>
        </div>

        {/* Main Interface Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Code Input & Controls (6 Cols) */}
          <div className="lg:col-span-6 space-y-4">
            
            <div className="rounded-2xl border border-slate-800 bg-[#0d1117] shadow-xl overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-slate-300">Target Language:</span>
                  <div className="flex items-center gap-1 rounded bg-slate-900 p-0.5 border border-slate-800">
                    {(['python', 'javascript', 'cpp'] as LanguageSlug[]).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => setLanguage(lang)}
                        className={`rounded px-2.5 py-1 text-xs font-semibold capitalize transition-all ${
                          language === lang
                            ? 'bg-teal-500 text-slate-950'
                            : 'text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {lang === 'cpp' ? 'C++20' : lang}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setSourceCode('')}
                  className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Clear
                </button>
              </div>

              <div className="p-3">
                <textarea
                  value={sourceCode}
                  onChange={(e) => setSourceCode(e.target.value)}
                  rows={14}
                  placeholder="Paste your code snippet here..."
                  className="w-full resize-y rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-200 outline-none focus:border-teal-500 leading-relaxed"
                />
              </div>

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 bg-slate-950 p-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleDiagnose}
                    disabled={loading}
                    className="flex items-center gap-1.5 rounded-xl bg-teal-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-glow-cyan hover:bg-teal-400 transition-all disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                    Diagnose & Explain
                  </button>

                  <button
                    onClick={handleExplainLines}
                    disabled={loading}
                    className="flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-all disabled:opacity-50"
                  >
                    <Code className="h-3.5 w-3.5 text-cyan-400" />
                    Line Breakdown
                  </button>
                </div>

                {/* Progressive Hint Stepper Button */}
                <div className="flex items-center gap-1 text-xs">
                  <span className="text-[11px] text-slate-400 mr-1">Hint Level:</span>
                  {[1, 2, 3].map((lvl) => (
                    <button
                      key={lvl}
                      onClick={() => handleGetHint(lvl)}
                      className={`flex h-6 w-6 items-center justify-center rounded text-xs font-bold transition-all ${
                        hintLevel === lvl
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>
              </div>

            </div>

          </div>

          {/* Right Column: AI Tutor Response Cards (6 Cols) */}
          <div className="lg:col-span-6 space-y-4">
            
            {loading ? (
              <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/30 p-8 text-center space-y-3">
                <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
                <p className="text-xs text-slate-400">
                  Parsing abstract syntax tree, verifying error markers, and prompting pedagogical tutor...
                </p>
              </div>
            ) : !tutorResult ? (
              <div className="flex h-64 flex-col items-center justify-center rounded-2xl border border-slate-800 bg-slate-900/20 p-8 text-center space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-teal-400 border border-slate-800">
                  <Lightbulb className="h-6 w-6" />
                </div>
                <h4 className="text-sm font-semibold text-slate-200">
                  Ready to assist your learning
                </h4>
                <p className="text-xs text-slate-400 max-w-sm leading-relaxed">
                  Click <span className="text-teal-400 font-semibold">Diagnose & Explain</span> to receive immediate root-cause clarity and progressive guidance.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                
                {/* Title & Overview */}
                <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-teal-400" />
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                      {tutorResult.title}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {tutorResult.explanation}
                  </p>
                </div>

                {/* Root Cause Card */}
                {tutorResult.likely_cause && (
                  <div className="rounded-2xl border border-rose-950/60 bg-rose-950/20 p-5 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-rose-300">
                      <HelpCircle className="h-4 w-4 text-rose-400" />
                      Likely Root Cause
                    </div>
                    <p className="text-xs text-rose-200/90 leading-relaxed">
                      {tutorResult.likely_cause}
                    </p>
                  </div>
                )}

                {/* Progressive Hint */}
                {tutorResult.hint && (
                  <div className="rounded-2xl border border-amber-950/60 bg-amber-950/20 p-5 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-semibold text-amber-300">
                      <Lightbulb className="h-4 w-4 text-amber-400" />
                      Progressive Hint (Level {hintLevel})
                    </div>
                    <p className="text-xs text-amber-200/90 leading-relaxed">
                      {tutorResult.hint}
                    </p>
                  </div>
                )}

                {/* Minimal Fix */}
                {tutorResult.suggested_fix && (
                  <div className="rounded-2xl border border-teal-950/60 bg-teal-950/20 p-5 space-y-2">
                    <div className="text-xs font-semibold text-teal-300">
                      Minimal Recommended Correction
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {tutorResult.suggested_fix}
                    </p>
                    {tutorResult.suggested_patch && (
                      <pre className="overflow-x-auto rounded-lg bg-slate-950 p-2.5 font-mono text-xs text-emerald-400 border border-slate-800">
                        {tutorResult.suggested_patch}
                      </pre>
                    )}
                  </div>
                )}

                {/* Line by line breakdown */}
                {tutorResult.line_explanations && tutorResult.line_explanations.length > 0 && (
                  <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 space-y-3">
                    <div className="text-xs font-bold text-white uppercase tracking-wider">
                      Line-by-Line Breakdown
                    </div>
                    <div className="space-y-2">
                      {tutorResult.line_explanations.map((le, idx) => (
                        <div key={idx} className="rounded-xl bg-slate-950/70 p-3 border border-slate-800/80 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-cyan-400 font-bold">
                              Line {le.line}
                            </span>
                            <code className="rounded bg-slate-900 px-1.5 py-0.5 font-mono text-xs text-slate-200">
                              {le.code}
                            </code>
                          </div>
                          <p className="text-slate-400 text-xs leading-relaxed pl-1">
                            {le.explanation}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};
