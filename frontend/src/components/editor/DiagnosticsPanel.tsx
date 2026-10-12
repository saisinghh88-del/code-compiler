import React from 'react';
import { Diagnostic } from '../../types';
import { AlertCircle, AlertTriangle, CheckCircle2, Sparkles, Compass } from 'lucide-react';

interface DiagnosticsPanelProps {
  diagnostics: Diagnostic[];
  onExplainDiagnostic: (diag: Diagnostic) => void;
  selectedDiagnostic: Diagnostic | null;
  onSelectDiagnostic: (diag: Diagnostic) => void;
  onViewBlueprint?: (diag: Diagnostic) => void;
}

export const DiagnosticsPanel: React.FC<DiagnosticsPanelProps> = ({
  diagnostics,
  onExplainDiagnostic,
  selectedDiagnostic,
  onSelectDiagnostic,
  onViewBlueprint,
}) => {
  const errorCount = diagnostics.filter(d => d.severity === 'error').length;
  const warningCount = diagnostics.filter(d => d.severity === 'warning').length;

  return (
    <div className="flex h-full flex-col bg-slate-950 text-slate-200">
      {/* Panel Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Preflight Diagnostics
          </span>
          <div className="flex items-center gap-1 text-[11px]">
            {errorCount > 0 && (
              <span className="flex items-center gap-1 rounded bg-rose-500/20 px-1.5 py-0.5 font-medium text-rose-400 border border-rose-500/30">
                <AlertCircle className="h-3 w-3" /> {errorCount} Error{errorCount > 1 ? 's' : ''}
              </span>
            )}
            {warningCount > 0 && (
              <span className="flex items-center gap-1 rounded bg-amber-500/20 px-1.5 py-0.5 font-medium text-amber-400 border border-amber-500/30">
                <AlertTriangle className="h-3 w-3" /> {warningCount} Warning{warningCount > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Diagnostics List or Empty State */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {diagnostics.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-6 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-3">
              <CheckCircle2 className="h-6 w-6" />
            </div>
            <h4 className="text-sm font-medium text-slate-200 mb-1">
              No issues detected by available checks
            </h4>
            <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
              Your source code passed preflight syntax parsing and static analysis checks. Safe to execute in isolated sandbox.
            </p>
          </div>
        ) : (
          diagnostics.map((diag, index) => {
            const isSelected = selectedDiagnostic === diag;
            const isError = diag.severity === 'error';

            return (
              <div
                key={index}
                onClick={() => onSelectDiagnostic(diag)}
                className={`group cursor-pointer rounded-lg border p-3 transition-all ${
                  isSelected
                    ? isError
                      ? 'border-rose-500/50 bg-rose-950/20 shadow-sm'
                      : 'border-amber-500/50 bg-amber-950/20 shadow-sm'
                    : isError
                    ? 'border-rose-900/40 bg-slate-900/40 hover:border-rose-800'
                    : 'border-amber-900/40 bg-slate-900/40 hover:border-amber-800'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {isError ? (
                      <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 shrink-0 text-amber-400" />
                    )}
                    <span className="font-mono text-xs font-semibold text-slate-200">
                      Line {diag.line}:{diag.column}
                    </span>
                    <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-400">
                      {diag.error_code}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      [{diag.source}]
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {diag.blueprint && onViewBlueprint && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectDiagnostic(diag);
                          onViewBlueprint(diag);
                        }}
                        className="flex items-center gap-1 rounded bg-amber-500/10 px-2 py-1 text-[11px] font-medium text-amber-300 hover:bg-amber-500/20 hover:text-amber-200 border border-amber-500/30 transition-all cursor-pointer"
                        title="View compiler token anatomy and syntax blueprint"
                      >
                        <Compass className="h-3 w-3" />
                        Blueprint
                      </button>
                    )}

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onExplainDiagnostic(diag);
                      }}
                      className="flex items-center gap-1 rounded bg-teal-500/10 px-2 py-1 text-[11px] font-medium text-teal-300 hover:bg-teal-500/20 hover:text-teal-200 border border-teal-500/30 transition-all shrink-0 cursor-pointer"
                    >
                      <Sparkles className="h-3 w-3" />
                      Explain with AI
                    </button>
                  </div>
                </div>

                <p className="mt-1.5 text-xs text-slate-300 font-mono leading-relaxed pl-6">
                  {diag.message}
                </p>

                {diag.suggested_fix && (
                  <div className="mt-2 ml-6 rounded bg-slate-950/80 p-2 text-[11px] text-teal-400 border border-teal-900/30">
                    <span className="font-semibold text-teal-300">Suggested Action: </span>
                    {diag.suggested_fix}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
