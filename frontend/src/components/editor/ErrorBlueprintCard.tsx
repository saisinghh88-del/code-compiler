import React, { useState } from 'react';
import { 
  Compass, 
  Workflow, 
  Cpu, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  HelpCircle, 
  Copy, 
  Check, 
  Sparkles, 
  Layers,
  ArrowRight,
  BookOpen
} from 'lucide-react';
import { Diagnostic, ErrorBlueprint, SyntaxAnatomyItem } from '../../types';

interface ErrorBlueprintCardProps {
  diagnostic: Diagnostic;
  onApplyFix?: (fixedCode: string) => void;
  onExplainWithAI?: (diagnostic: Diagnostic) => void;
}

export const ErrorBlueprintCard: React.FC<ErrorBlueprintCardProps> = ({
  diagnostic,
  onApplyFix,
  onExplainWithAI,
}) => {
  const [copiedSpec, setCopiedSpec] = useState(false);
  const blueprint: ErrorBlueprint | undefined = diagnostic.blueprint;

  if (!blueprint) {
    return (
      <div className="flex h-full flex-col items-center justify-center p-6 text-center bg-slate-950 text-slate-300">
        <Compass className="h-10 w-10 text-slate-600 mb-3 animate-pulse" />
        <h4 className="text-sm font-semibold text-slate-300 mb-1">
          No Blueprint Available
        </h4>
        <p className="text-xs text-slate-400 max-w-sm">
          Select a diagnostic with an architectural syntax violation to inspect token flows and compiler mechanics.
        </p>
      </div>
    );
  }

  const handleCopySpec = () => {
    if (blueprint.canonical_spec) {
      navigator.clipboard.writeText(blueprint.canonical_spec);
      setCopiedSpec(true);
      setTimeout(() => setCopiedSpec(false), 2000);
    }
  };

  const getStatusBadge = (status: SyntaxAnatomyItem['status']) => {
    switch (status) {
      case 'valid':
        return {
          icon: <CheckCircle2 className="h-3 w-3 text-emerald-400" />,
          bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
          label: 'Valid Token'
        };
      case 'missing':
        return {
          icon: <XCircle className="h-3 w-3 text-rose-400" />,
          bg: 'bg-rose-500/20 border-rose-500/50 text-rose-300 ring-1 ring-rose-500/30 animate-pulse',
          label: 'Missing Token'
        };
      case 'unexpected':
        return {
          icon: <AlertCircle className="h-3 w-3 text-amber-400" />,
          bg: 'bg-amber-500/20 border-amber-500/40 text-amber-300',
          label: 'Unexpected'
        };
      case 'unresolved':
      default:
        return {
          icon: <HelpCircle className="h-3 w-3 text-purple-400" />,
          bg: 'bg-purple-500/20 border-purple-500/40 text-purple-300',
          label: 'Unresolved Scope'
        };
    }
  };

  return (
    <div className="flex h-full flex-col bg-slate-950 text-slate-100 overflow-y-auto p-4 space-y-4">
      {/* Title & Stage Banner */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 shadow-sm backdrop-blur">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-md bg-teal-500/10 text-teal-400 border border-teal-500/20">
                <Compass className="h-3.5 w-3.5" />
              </span>
              <span className="text-[11px] font-mono uppercase tracking-wider text-teal-400 font-semibold">
                Compiler Syntax Architecture
              </span>
            </div>
            <h3 className="mt-1 text-base font-bold text-white tracking-tight">
              {blueprint.title}
            </h3>
          </div>

          <span className="flex items-center gap-1 rounded-full bg-slate-800/90 border border-slate-700/80 px-2.5 py-1 text-[11px] font-mono text-slate-300 shrink-0">
            <Cpu className="h-3 w-3 text-teal-400" />
            Line {diagnostic.line}:{diagnostic.column}
          </span>
        </div>

        {/* Compiler Pipeline Stage & Formal Grammar Rule */}
        <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
          <div className="rounded-lg bg-slate-950/80 border border-slate-800/80 p-2.5">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
              Compiler Pipeline Stage
            </span>
            <div className="flex items-center gap-1.5 font-medium text-teal-300">
              <Workflow className="h-3.5 w-3.5 text-teal-400 shrink-0" />
              <span className="truncate">{blueprint.parser_stage}</span>
            </div>
          </div>

          <div className="rounded-lg bg-slate-950/80 border border-slate-800/80 p-2.5">
            <span className="text-[10px] uppercase font-semibold text-slate-400 block mb-1">
              Grammar Production Rule
            </span>
            <div className="font-mono text-[11px] text-amber-300/90 truncate" title={blueprint.grammar_rule}>
              {blueprint.grammar_rule}
            </div>
          </div>
        </div>
      </div>

      {/* Visual Token Stream Anatomy Schematic */}
      {blueprint.anatomy && blueprint.anatomy.length > 0 && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Layers className="h-4 w-4 text-teal-400" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                Grammar Token Anatomy
              </h4>
            </div>
            <span className="text-[11px] text-slate-400">
              Visual Left-to-Right Lexer Stream
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2 p-3 rounded-lg bg-slate-950 border border-slate-800/80">
            {blueprint.anatomy.map((item, idx) => {
              const badge = getStatusBadge(item.status);
              return (
                <React.Fragment key={idx}>
                  <div className={`flex flex-col rounded-lg border px-2.5 py-1.5 transition-all ${badge.bg}`}>
                    <div className="flex items-center justify-between gap-1.5 mb-1">
                      <span className="text-[10px] uppercase font-mono font-bold tracking-wider">
                        {item.role}
                      </span>
                      {badge.icon}
                    </div>
                    <span className="font-mono text-xs font-bold text-white">
                      {item.token}
                    </span>
                    <span className="text-[10px] text-slate-300 opacity-90 mt-0.5">
                      {item.label}
                    </span>
                  </div>
                  {idx < blueprint.anatomy.length - 1 && (
                    <ArrowRight className="h-3.5 w-3.5 text-slate-600 shrink-0" />
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}

      {/* Expected vs Actual Token Breakdown */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="rounded-xl border border-emerald-900/40 bg-emerald-950/10 p-3.5">
          <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-semibold mb-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Expected Syntactic Token</span>
          </div>
          <div className="font-mono text-xs text-emerald-200 font-bold bg-slate-950/80 p-2 rounded border border-emerald-800/30">
            {blueprint.expected_token || 'Valid syntax token'}
          </div>
        </div>

        <div className="rounded-xl border border-rose-900/40 bg-rose-950/10 p-3.5">
          <div className="flex items-center gap-1.5 text-rose-400 text-xs font-semibold mb-1">
            <XCircle className="h-3.5 w-3.5" />
            <span>Actual Token Received</span>
          </div>
          <div className="font-mono text-xs text-rose-200 font-bold bg-slate-950/80 p-2 rounded border border-rose-800/30">
            {blueprint.actual_token || 'Invalid/missing token'}
          </div>
        </div>
      </div>

      {/* Compiler Impact Explanation */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <div className="flex items-center gap-2 mb-2">
          <Cpu className="h-4 w-4 text-amber-400" />
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Compiler & Bytecode Impact
          </h4>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed font-sans">
          {blueprint.impact}
        </p>
      </div>

      {/* Correction Schematic */}
      {blueprint.correction_schematic && (
        <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Architectural Correction Schematic
            </h4>
            <span className="text-[10px] text-teal-400 font-mono">AST Alignment</span>
          </div>
          <pre className="font-mono text-xs text-slate-200 bg-slate-950 p-3 rounded-lg border border-slate-800/80 overflow-x-auto whitespace-pre leading-relaxed text-teal-300/90">
            {blueprint.correction_schematic}
          </pre>
        </div>
      )}

      {/* Canonical Spec Blueprint */}
      <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-teal-400" />
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">
              Canonical Specification Blueprint
            </h4>
          </div>
          <button
            onClick={handleCopySpec}
            className="flex items-center gap-1 text-[11px] font-medium text-slate-400 hover:text-white bg-slate-800/60 px-2 py-1 rounded transition-colors"
          >
            {copiedSpec ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            {copiedSpec ? 'Copied' : 'Copy Spec'}
          </button>
        </div>

        <pre className="font-mono text-xs text-slate-200 bg-slate-950 p-3 rounded-lg border border-slate-800/80 overflow-x-auto whitespace-pre leading-relaxed text-slate-200">
          {blueprint.canonical_spec}
        </pre>
      </div>

      {/* Bottom Action Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
        <div className="text-[11px] text-slate-400">
          Source: <span className="font-mono text-slate-300">{diagnostic.source}</span>
        </div>

        <div className="flex items-center gap-2">
          {onExplainWithAI && (
            <button
              onClick={() => onExplainWithAI(diagnostic)}
              className="flex items-center gap-1.5 rounded-lg bg-teal-500/10 border border-teal-500/30 px-3 py-1.5 text-xs font-semibold text-teal-300 hover:bg-teal-500/20 hover:text-teal-200 transition-all shadow-sm cursor-pointer"
            >
              <Sparkles className="h-3.5 w-3.5 text-teal-400" />
              Deep Tutor Breakdown
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
