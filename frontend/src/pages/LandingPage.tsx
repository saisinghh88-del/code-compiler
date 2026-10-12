import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Terminal, 
  Sparkles, 
  ShieldCheck, 
  Cpu, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  BookOpen, 
  Trophy, 
  Code2, 
  Layers,
  Zap,
  Globe
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'syntax' | 'analyzer' | 'ai'>('analyzer');

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100">
      
      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-teal-500/10 blur-[120px] pointer-events-none"></div>
        <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none"></div>

        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:items-center">
            
            {/* Left Hero Text */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 rounded-full border border-teal-500/30 bg-teal-500/10 px-3.5 py-1 text-xs font-semibold text-teal-300">
                <Sparkles className="h-3.5 w-3.5 text-teal-400" />
                <span>Next-Gen Coding Education Platform</span>
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl leading-[1.15]">
                Master Code Faster with{' '}
                <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-indigo-400 bg-clip-text text-transparent">
                  Real Preflight Static Analysis
                </span>{' '}
                & AI Coaching
              </h1>

              <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                CodeMaster AI detects syntax flaws and structural bugs <span className="text-teal-300 font-semibold">before execution</span>. 
                Receive pedagogical hints without spoilers, run programs in isolated sandboxes, and level up from beginner to senior engineer.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <Link
                  to="/compiler"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-glow-cyan hover:from-teal-400 hover:to-cyan-400 transition-all"
                >
                  <Terminal className="h-4 w-4" />
                  Launch Online Compiler
                </Link>
                <Link
                  to="/courses"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-6 py-3.5 text-sm font-semibold text-slate-200 hover:bg-slate-800 hover:border-slate-700 transition-all"
                >
                  <BookOpen className="h-4 w-4 text-teal-400" />
                  Explore Curriculum Tracks
                </Link>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 pt-4 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-teal-400" />
                  AST-Powered Static Analysis
                </div>
                <div className="flex items-center gap-1.5">
                  <Cpu className="h-4 w-4 text-cyan-400" />
                  Isolated Sandbox Execution
                </div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-indigo-400" />
                  Progressive AI Hints
                </div>
              </div>
            </div>

            {/* Right Interactive Hero Teaser Card */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-slate-800 bg-[#0d1117] shadow-2xl overflow-hidden">
                {/* Window Bar */}
                <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/70 px-4 py-2.5">
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-rose-500/80"></span>
                    <span className="h-3 w-3 rounded-full bg-amber-500/80"></span>
                    <span className="h-3 w-3 rounded-full bg-emerald-500/80"></span>
                    <span className="ml-2 font-mono text-xs text-slate-400">solution.py</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-teal-400">
                    Python 3.10
                  </div>
                </div>

                {/* Code Window */}
                <div className="p-4 font-mono text-xs leading-relaxed space-y-1">
                  <div className="text-slate-400">1  <span className="text-teal-400 font-semibold">def</span> <span className="text-cyan-300">calculate_discount</span>(price, rate)</div>
                  <div className="text-rose-400 bg-rose-950/30 px-1 rounded flex items-center justify-between">
                    <span>2      <span className="text-teal-400">return</span> price * (1 - rate)</span>
                    <span className="text-[10px] text-rose-400 font-sans">← Missing colon ':'</span>
                  </div>
                  <div className="text-slate-400">3  </div>
                  <div className="text-slate-400">4  final_price = calculate_discount(100, 0.2)</div>
                  <div className="text-slate-400">5  <span className="text-cyan-300">print</span>(<span className="text-amber-300">f"Total: ${'{final_price}'}"</span>)</div>
                </div>

                {/* Interactive Preflight Interceptor Card */}
                <div className="border-t border-slate-800 bg-slate-950 p-4 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-rose-400">
                      <AlertCircle className="h-4 w-4" />
                      Preflight Analysis Intercepted (Line 1)
                    </div>
                    <span className="text-[10px] rounded bg-rose-950 px-1.5 py-0.5 text-rose-300 border border-rose-800/40">
                      MISSING_COLON
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-normal">
                    Execution blocked automatically. Compound statements must terminate with a colon.
                  </p>

                  <div className="rounded-lg bg-teal-950/30 p-2.5 text-[11px] border border-teal-800/30 space-y-1">
                    <div className="flex items-center gap-1 text-teal-400 font-semibold">
                      <Sparkles className="h-3 w-3" />
                      AI Tutor Progressive Hint:
                    </div>
                    <p className="text-slate-300 text-[10px]">
                      Add a colon <code className="text-teal-300 bg-slate-900 px-1 rounded">:</code> at the end of line 1 right after <code className="text-teal-300 bg-slate-900 px-1 rounded">(price, rate)</code>.
                    </p>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 2. Feature Architecture Grid */}
      <section className="border-t border-slate-900 bg-slate-950/60 py-16 md:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-teal-400">
              Why CodeMaster AI
            </h2>
            <h3 className="text-3xl font-extrabold text-white sm:text-4xl">
              Engineered for Real Engineering Skill
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              We reject black-box shortcuts. Our architecture marries industrial AST parsers, container isolation, and pedagogical LLM prompting.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 space-y-4 hover:border-teal-500/40 transition-all group">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 group-hover:bg-teal-500/20 transition-all">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-bold text-white">Pre-Execution Static Analysis</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Before your program runs, AST and semantic linters analyze syntax, scope, and indentation. Catch errors in milliseconds without waiting for server timeouts.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-300 pt-1">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-teal-400" /> Python AST & Pyflakes</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-teal-400" /> Node.js V8 Syntax Check</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-teal-400" /> C++ Syntax-Only Compiler Mode</li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 space-y-4 hover:border-cyan-500/40 transition-all group">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:bg-cyan-500/20 transition-all">
                <Sparkles className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-bold text-white">Progressive AI Tutor</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Rather than dumping full solutions that rob you of the learning experience, our AI tutor delivers 3-tier progressive hints, root-cause explanations, and minimal patches.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-300 pt-1">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" /> Level 1: Conceptual Pointer</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" /> Level 2: Location Highlight</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-cyan-400" /> Level 3: Minimal Surgical Fix</li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="rounded-2xl border border-slate-800/80 bg-slate-900/40 p-6 space-y-4 hover:border-indigo-500/40 transition-all group">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-all">
                <Cpu className="h-6 w-6" />
              </div>
              <h4 className="text-lg font-bold text-white">Isolated Sandbox Execution</h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Remote code runs inside hardened Judge0 execution sandboxes. Enforced CPU limits, memory constraints, and zero network access ensure maximum security.
              </p>
              <ul className="space-y-1.5 text-xs text-slate-300 pt-1">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" /> Max 5.0s CPU Time Bound</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" /> 128 MB Memory Cap</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-3.5 w-3.5 text-indigo-400" /> Zero Direct Host Execution</li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* 3. Supported Languages */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-teal-400">
                Language Support
              </h2>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                Initial Supported Stacks
              </h3>
            </div>
            <Link to="/languages" className="flex items-center gap-1.5 text-xs font-semibold text-teal-400 hover:text-teal-300 transition-colors">
              Explore Language Explorer <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-bold text-white">Python 3</h4>
                <span className="rounded bg-teal-500/10 px-2 py-0.5 text-xs font-semibold text-teal-400 border border-teal-500/20">
                  Beginner to Adv
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Full AST parsing, pyflakes variable tracing, type annotation support, and algorithmic data structures.
              </p>
              <div className="text-[11px] font-mono text-slate-400">
                Version: 3.10+ | Extension: .py
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-bold text-white">JavaScript (Node.js)</h4>
                <span className="rounded bg-cyan-500/10 px-2 py-0.5 text-xs font-semibold text-cyan-400 border border-cyan-500/20">
                  Intermediate
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                ES2023 syntax validation, closure scopes, higher-order functions, event loop understanding, and Node execution.
              </p>
              <div className="text-[11px] font-mono text-slate-400">
                Version: ES2023 / Node 20+ | Extension: .js
              </div>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-900/30 p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-bold text-white">C++ (GCC/Clang)</h4>
                <span className="rounded bg-indigo-500/10 px-2 py-0.5 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
                  Advanced
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Pointers, references, memory management, STL containers, compile-only syntax validation, and modern C++20 idioms.
              </p>
              <div className="text-[11px] font-mono text-slate-400">
                Standard: C++20 | Extension: .cpp
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. Bottom CTA Section */}
      <section className="border-t border-slate-900 bg-gradient-to-b from-slate-950 to-[#0d131f] py-16 text-center">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
            Ready to Experience Serious Programming Education?
          </h2>
          <p className="text-slate-400 text-sm max-w-xl mx-auto leading-relaxed">
            Jump directly into the full-screen Monaco Editor or follow one of our curated curriculum tracks with automated quizzes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link
              to="/compiler"
              className="flex items-center gap-2 rounded-xl bg-teal-500 px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-glow-cyan hover:bg-teal-400 transition-all"
            >
              Open Online IDE Now
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/auth"
              className="flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900 px-6 py-3.5 text-sm font-semibold text-slate-200 hover:bg-slate-800 transition-all"
            >
              Create Learner Profile
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};
