import React from 'react';
import { Link } from 'react-router-dom';
import { Code2, ShieldCheck, Cpu, Sparkles, Terminal } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-900 bg-slate-950/90 py-10 text-xs text-slate-400">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30">
                <Code2 className="h-4 w-4" />
              </div>
              <span className="text-sm font-bold text-slate-100">CodeMaster AI</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Industrial-grade programming education with real-time AST static analysis, AI diagnostic coaching, and isolated sandbox execution.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 text-[11px]">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              All systems operational (Judge0 Sandbox & AI Active)
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] mb-3">Platform</h4>
            <ul className="space-y-2">
              <li><Link to="/compiler" className="hover:text-teal-400 transition-colors">Monaco Online IDE</Link></li>
              <li><Link to="/courses" className="hover:text-teal-400 transition-colors">Curriculum Tracks</Link></li>
              <li><Link to="/challenges" className="hover:text-teal-400 transition-colors">Algorithmic Challenges</Link></li>
              <li><Link to="/tutor" className="hover:text-teal-400 transition-colors">AI Diagnostic Tutor</Link></li>
              <li><Link to="/languages" className="hover:text-teal-400 transition-colors">Language Explorer</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] mb-3">Core Technologies</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-1.5"><Terminal className="h-3.5 w-3.5 text-cyan-400" /> Monaco Editor Studio</li>
              <li className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-teal-400" /> AST & Pyflakes Analyzer</li>
              <li className="flex items-center gap-1.5"><Cpu className="h-3.5 w-3.5 text-indigo-400" /> Judge0 Isolated Sandbox</li>
              <li className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-amber-400" /> LLM Diagnostic Tutor</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-200 uppercase tracking-wider text-[11px] mb-3">Security & Compliance</h4>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              Untrusted code runs strictly in isolated micro-containers with zero host access and disabled external networking. RLS protects student workspaces.
            </p>
            <div className="mt-3 text-[11px] text-slate-400">
              © {new Date().getFullYear()} CodeMaster AI. Built for serious learners.
            </div>
          </div>

        </div>
      </div>
    </footer>
  );
};
