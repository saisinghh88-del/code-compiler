import React, { useState } from 'react';
import { ExecutionResponse, Diagnostic } from '../../types';
import { 
  Terminal, 
  Clock, 
  Cpu, 
  ShieldCheck, 
  AlertOctagon, 
  CheckCircle2, 
  XCircle, 
  FileText, 
  CornerDownRight, 
  Loader2,
  Wrench,
  Play,
  Sparkles,
  Compass
} from 'lucide-react';

interface OutputPanelProps {
  loading: boolean;
  executionResult: ExecutionResponse | null;
  stdin: string;
  onStdinChange: (val: string) => void;
  diagnostics?: Diagnostic[];
  onApplyFixAndRun?: (diag?: Diagnostic | null) => void;
  onBypassPreflight?: () => void;
  onExplainError?: (diag: Diagnostic) => void;
  onViewBlueprint?: (diag: Diagnostic) => void;
}

export const OutputPanel: React.FC<OutputPanelProps> = ({
  loading,
  executionResult,
  stdin,
  onStdinChange,
  diagnostics = [],
  onApplyFixAndRun,
  onBypassPreflight,
  onExplainError,
  onViewBlueprint,
}) => {
  const [activeTab, setActiveTab] = useState<'output' | 'input' | 'compile'>('output');

  // Identify first blocking or error diagnostic
  const errorDiagnostics = diagnostics.filter(d => d.severity === 'error');
  const targetDiagnostic = errorDiagnostics.length > 0 
    ? errorDiagnostics[0] 
    : (executionResult?.diagnostics && executionResult.diagnostics.length > 0 ? executionResult.diagnostics[0] : null);

  const getStatusBadge = (res: ExecutionResponse) => {
    switch (res.status) {
      case 'passed':
        return (
          <span className="flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 text-[11px] font-semibold text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="h-3 w-3" /> Execution Succeeded (Exit 0)
          </span>
        );
      case 'blocked':
        return (
          <span className="flex items-center gap-1 rounded bg-rose-500/20 px-2 py-0.5 text-[11px] font-semibold text-rose-400 border border-rose-500/30">
            <AlertOctagon className="h-3 w-3" /> Blocked by Preflight
          </span>
        );
      case 'compile_error':
        return (
          <span className="flex items-center gap-1 rounded bg-rose-500/20 px-2 py-0.5 text-[11px] font-semibold text-rose-400 border border-rose-500/30">
            <XCircle className="h-3 w-3" /> Compilation Failed
          </span>
        );
      case 'runtime_error':
        return (
          <span className="flex items-center gap-1 rounded bg-amber-500/20 px-2 py-0.5 text-[11px] font-semibold text-amber-400 border border-amber-500/30">
            <XCircle className="h-3 w-3" /> Runtime Exception
          </span>
        );
      case 'time_limit_exceeded':
        return (
          <span className="flex items-center gap-1 rounded bg-amber-500/20 px-2 py-0.5 text-[11px] font-semibold text-amber-400 border border-amber-500/30">
            <Clock className="h-3 w-3" /> Time Limit Exceeded
          </span>
        );
      default:
        return (
          <span className="flex items-center gap-1 rounded bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-slate-300">
            Status: {res.status}
          </span>
        );
    }
  };

  return (
    <div className="flex h-full flex-col bg-slate-950 text-slate-200">
      {/* Panel Tab Bar */}
      <div className="flex items-center justify-between border-b border-slate-800/80 px-4 py-2">
        <div className="flex items-center gap-1">
          <button
            onClick={() => setActiveTab('output')}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'output'
                ? 'bg-slate-800 text-teal-400 shadow-sm'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <Terminal className="h-3.5 w-3.5" />
            Program Output
          </button>
          <button
            onClick={() => setActiveTab('input')}
            className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'input'
                ? 'bg-slate-800 text-teal-400 shadow-sm'
                : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
            }`}
          >
            <CornerDownRight className="h-3.5 w-3.5" />
            Standard Input (stdin)
            {stdin.trim() && <span className="h-1.5 w-1.5 rounded-full bg-teal-400"></span>}
          </button>
          {executionResult?.compile_output && (
            <button
              onClick={() => setActiveTab('compile')}
              className={`flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'compile'
                  ? 'bg-slate-800 text-rose-400 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              Compiler Diagnostic Logs
            </button>
          )}
        </div>

        {/* Status Badge */}
        {executionResult && !loading && getStatusBadge(executionResult)}
      </div>

      {/* Metadata Bar if executed */}
      {executionResult && !loading && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-900 bg-slate-900/40 px-4 py-1.5 text-[11px] text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-slate-300">
              <ShieldCheck className="h-3.5 w-3.5 text-teal-400" />
              {executionResult.sandbox_provider}
            </span>
            {executionResult.execution_time_ms !== null && executionResult.execution_time_ms !== undefined && (
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-cyan-400" />
                {executionResult.execution_time_ms} ms
              </span>
            )}
            {executionResult.memory_kb !== null && executionResult.memory_kb !== undefined && (
              <span className="flex items-center gap-1">
                <Cpu className="h-3.5 w-3.5 text-indigo-400" />
                {executionResult.memory_kb} KB
              </span>
            )}
          </div>
          {executionResult.exit_code !== null && executionResult.exit_code !== undefined && (
            <span className="font-mono text-slate-400">
              Exit Code: {executionResult.exit_code}
            </span>
          )}
        </div>
      )}

      {/* Tab Contents */}
      <div className="flex-1 overflow-y-auto p-4 font-mono text-xs">
        {loading ? (
          <div className="flex h-32 flex-col items-center justify-center space-y-2 text-slate-400">
            <Loader2 className="h-6 w-6 animate-spin text-teal-400" />
            <p className="text-xs">Executing inside isolated sandbox container...</p>
          </div>
        ) : activeTab === 'input' ? (
          <div className="h-full flex flex-col">
            <label className="text-[11px] text-slate-400 mb-2 font-sans">
              Provide input passed into standard input (<code className="text-teal-400">stdin</code>):
            </label>
            <textarea
              value={stdin}
              onChange={(e) => onStdinChange(e.target.value)}
              placeholder="e.g. 5\n10 20 30"
              className="flex-1 w-full resize-none rounded-lg border border-slate-800 bg-[#0d1117] p-3 text-slate-200 outline-none focus:border-teal-500 font-mono text-xs"
            />
          </div>
        ) : activeTab === 'compile' ? (
          <div className="space-y-2">
            <div className="text-[11px] font-semibold text-rose-400 font-sans">
              Compiler / Preflight Verification Stream:
            </div>
            <pre className="whitespace-pre-wrap rounded-lg bg-rose-950/20 p-3 text-rose-300 border border-rose-900/30">
              {executionResult?.compile_output || 'No compilation output recorded.'}
            </pre>
          </div>
        ) : (
          <div>
            {!executionResult ? (
              <div className="flex h-32 items-center justify-center text-slate-400 font-sans text-xs">
                Press "Run Code" or use Ctrl+Enter to execute. Output will appear here.
              </div>
            ) : (
              <div className="space-y-4">
                {/* Standard Output Card */}
                {executionResult.stdout && (
                  <div>
                    <div className="text-[11px] font-sans font-semibold text-emerald-400 mb-1 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Standard Output:
                    </div>
                    <pre className="whitespace-pre-wrap rounded-lg bg-[#0d1117] p-3 text-slate-100 border border-slate-800 shadow-inner">
                      {executionResult.stdout}
                    </pre>
                  </div>
                )}

                {/* Standard Error / Exception Card */}
                {executionResult.stderr && (
                  <div>
                    <div className="text-[11px] font-sans font-semibold text-rose-400 mb-1 flex items-center gap-1.5">
                      <XCircle className="h-3.5 w-3.5" />
                      Runtime Exception / Error Stream:
                    </div>
                    <pre className="whitespace-pre-wrap rounded-lg bg-rose-950/20 p-3 text-rose-300 border border-rose-900/30 font-mono">
                      {executionResult.stderr}
                    </pre>
                  </div>
                )}

                {/* Blocked or Compile Error Action Fix Card */}
                {(executionResult.status === 'blocked' || executionResult.status === 'compile_error') && (
                  <div className="rounded-xl border border-rose-500/40 bg-rose-950/20 p-4 space-y-3 shadow-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertOctagon className="h-4 w-4 text-rose-400 shrink-0" />
                        <span className="font-sans text-xs font-bold text-rose-200">
                          {executionResult.status === 'blocked' 
                            ? 'Execution Blocked by Preflight Syntax Gatekeeper' 
                            : 'Compilation Failed'}
                        </span>
                      </div>
                      <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-rose-300 border border-rose-500/30">
                        Syntax Error
                      </span>
                    </div>

                    <pre className="whitespace-pre-wrap rounded-lg bg-slate-950/90 p-3 text-xs text-rose-300 border border-rose-900/40 font-mono leading-relaxed">
                      {executionResult.compile_output || 'Code execution halted due to confirmed syntax or parsing errors.'}
                    </pre>

                    {/* Quick Fix Resolution Actions */}
                    <div className="rounded-lg bg-slate-900/80 p-3 border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-sans font-semibold text-slate-300">
                          Resolve Issue to Run Code:
                        </span>
                        {targetDiagnostic && (
                          <span className="font-mono text-[11px] text-teal-400">
                            Line {targetDiagnostic.line}:{targetDiagnostic.column}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-2 pt-1 font-sans">
                        {onApplyFixAndRun && (
                          <button
                            onClick={() => onApplyFixAndRun(targetDiagnostic)}
                            className="flex items-center gap-1.5 rounded-lg bg-teal-500 px-3.5 py-1.5 text-xs font-bold text-slate-950 shadow-glow-cyan hover:bg-teal-400 transition-all cursor-pointer"
                            title="Automatically apply the fix to source code and execute immediately"
                          >
                            <Wrench className="h-3.5 w-3.5" />
                            Auto-Fix Code & Re-Execute
                          </button>
                        )}

                        {executionResult.status === 'blocked' && onBypassPreflight && (
                          <button
                            onClick={onBypassPreflight}
                            className="flex items-center gap-1.5 rounded-lg border border-slate-700 bg-slate-800/80 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-amber-500/50 hover:text-amber-300 transition-all cursor-pointer"
                            title="Bypass preflight error checking and execute directly in sandbox"
                          >
                            <Play className="h-3.5 w-3.5 text-amber-400" />
                            Force Run Anyway
                          </button>
                        )}

                        {onViewBlueprint && targetDiagnostic && (
                          <button
                            onClick={() => onViewBlueprint(targetDiagnostic)}
                            className="flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1.5 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition-all cursor-pointer"
                          >
                            <Compass className="h-3.5 w-3.5" />
                            View Error Blueprint
                          </button>
                        )}

                        {onExplainError && targetDiagnostic && (
                          <button
                            onClick={() => onExplainError(targetDiagnostic)}
                            className="flex items-center gap-1.5 rounded-lg border border-teal-500/30 bg-teal-500/10 px-2.5 py-1.5 text-xs font-semibold text-teal-300 hover:bg-teal-500/20 transition-all cursor-pointer"
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                            Explain with AI
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Empty Output Message */}
                {!executionResult.stdout && !executionResult.stderr && executionResult.status !== 'blocked' && executionResult.status !== 'compile_error' && (
                  <div className="text-slate-400 text-xs italic font-sans p-3 bg-slate-900/30 rounded-lg border border-slate-800">
                    Program execution completed successfully with exit code 0, but no text was output to stdout.
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
