import React, { useState } from 'react';
import { AITutorResponse, Diagnostic } from '../../types';
import { 
  Sparkles, 
  Lightbulb, 
  Check, 
  HelpCircle, 
  Code, 
  ArrowRight, 
  Loader2,
  ChevronRight,
  RotateCcw
} from 'lucide-react';

interface AITutorPanelProps {
  loading: boolean;
  tutorResponse: AITutorResponse | null;
  activeDiagnostic: Diagnostic | null;
  onRequestHint: (level: number) => void;
  onRequestLineExplanation: () => void;
  onApplyFix: (fixCode: string) => void;
  onClose?: () => void;
}

export const AITutorPanel: React.FC<AITutorPanelProps> = ({
  loading,
  tutorResponse,
  activeDiagnostic,
  onRequestHint,
  onRequestLineExplanation,
  onApplyFix,
}) => {
  const [hintLevel, setHintLevel] = useState<number>(1);
  const [applied, setApplied] = useState(false);

  const handleLevelChange = (lvl: number) => {
    setHintLevel(lvl);
    onRequestHint(lvl);
  };

  const handleApply = (codeToApply: string) => {
    onApplyFix(codeToApply);
    setApplied(true);
    setTimeout(() => setApplied(false), 3000);
  };

  return (
    <div className="flex h-full flex-col bg-slate-950 text-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-teal-500/20 text-teal-400 border border-teal-500/30">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">
            AI Coding Tutor & Explainer
          </span>
        </div>
        <button
          onClick={onRequestLineExplanation}
          disabled={loading}
          className="flex items-center gap-1 rounded bg-slate-900 px-2 py-1 text-[11px] font-medium text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700 transition-all"
        >
          <Code className="h-3 w-3 text-cyan-400" />
          Explain Line-by-Line
        </button>
      </div>

      {/* Main Content Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex h-48 flex-col items-center justify-center space-y-3 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
            <p className="text-xs text-slate-400">
              Analyzing AST context and crafting pedagogical guidance...
            </p>
          </div>
        ) : !tutorResponse ? (
          <div className="flex h-full flex-col items-center justify-center p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-900 text-teal-400 border border-slate-800 mb-3">
              <Lightbulb className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-semibold text-slate-200 mb-1">
              Interactive AI Tutor Ready
            </h4>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed mb-4">
              Click <span className="text-teal-400 font-medium">Explain with AI</span> on any diagnostic, or request a progressive hint to resolve issues without spoiling the solution.
            </p>
            <button
              onClick={() => onRequestHint(1)}
              className="flex items-center gap-1.5 rounded-lg bg-teal-500/10 px-3 py-1.5 text-xs font-medium text-teal-400 border border-teal-500/30 hover:bg-teal-500/20 transition-all"
            >
              <Lightbulb className="h-3.5 w-3.5" />
              Request Concept Hint
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            
            {/* Title & Overview Card */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 shadow-sm">
              <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400 mb-1">
                {tutorResponse.title}
              </h4>
              <p className="text-xs text-slate-200 leading-relaxed">
                {tutorResponse.explanation}
              </p>
            </div>

            {/* Root Cause Card */}
            {tutorResponse.likely_cause && (
              <div className="rounded-xl border border-rose-950/60 bg-rose-950/20 p-3.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-300 mb-1">
                  <HelpCircle className="h-3.5 w-3.5 text-rose-400" />
                  Likely Root Cause
                </div>
                <p className="text-xs text-rose-200/90 leading-relaxed">
                  {tutorResponse.likely_cause}
                </p>
              </div>
            )}

            {/* Progressive Hint Stepper */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3.5">
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-300">
                  <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                  Progressive Hints
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3].map((level) => (
                    <button
                      key={level}
                      onClick={() => handleLevelChange(level)}
                      className={`flex h-6 w-6 items-center justify-center rounded text-[11px] font-bold transition-all ${
                        hintLevel === level
                          ? 'bg-amber-500 text-slate-950 shadow-sm'
                          : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-lg bg-slate-950/80 p-2.5 text-xs text-slate-300 border border-slate-800/80 leading-relaxed">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-amber-400/80 mb-1">
                  Level {hintLevel}: {hintLevel === 1 ? 'Concept' : hintLevel === 2 ? 'Target Area' : 'Concrete Fix'}
                </div>
                {tutorResponse.hint || 'Examine the flagged line carefully.'}
              </div>
            </div>

            {/* Minimal Suggested Fix with Explicit Apply Button */}
            {tutorResponse.suggested_fix && (
              <div className="rounded-xl border border-teal-900/40 bg-teal-950/20 p-3.5">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-xs font-semibold text-teal-300">
                    Minimal Suggested Fix
                  </div>
                  {tutorResponse.suggested_patch && (
                    <button
                      onClick={() => handleApply(tutorResponse.suggested_patch!)}
                      disabled={applied}
                      className="flex items-center gap-1 rounded bg-teal-500 px-2.5 py-1 text-xs font-semibold text-slate-950 shadow hover:bg-teal-400 transition-all disabled:opacity-50"
                    >
                      {applied ? (
                        <>
                          <Check className="h-3.5 w-3.5" />
                          Applied!
                        </>
                      ) : (
                        <>
                          <ArrowRight className="h-3.5 w-3.5" />
                          Apply Fix
                        </>
                      )}
                    </button>
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {tutorResponse.suggested_fix}
                </p>
                {tutorResponse.suggested_patch && (
                  <pre className="mt-2 overflow-x-auto rounded bg-slate-950 p-2 text-[11px] font-mono text-emerald-400 border border-slate-800">
                    {tutorResponse.suggested_patch}
                  </pre>
                )}
              </div>
            )}

            {/* Line-by-Line Breakdown if available */}
            {tutorResponse.line_explanations && tutorResponse.line_explanations.length > 0 && (
              <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-3.5">
                <div className="text-xs font-semibold text-indigo-300 mb-2.5">
                  Line-by-Line Analysis
                </div>
                <div className="space-y-2">
                  {tutorResponse.line_explanations.map((le, idx) => (
                    <div key={idx} className="rounded bg-slate-950/60 p-2 text-xs border border-slate-800/60">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[10px] text-cyan-400 font-semibold">
                          Line {le.line}
                        </span>
                        <code className="rounded bg-slate-900 px-1.5 py-0.5 text-[11px] text-slate-200">
                          {le.code}
                        </code>
                      </div>
                      <p className="text-slate-400 text-[11px] leading-relaxed pl-1">
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
  );
};
