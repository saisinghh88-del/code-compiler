import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Terminal, Globe, Code2, Cpu, Check, Layers, ArrowRight } from 'lucide-react';
import { LanguageSlug } from '../types';

export const LanguageExplorerPage: React.FC = () => {
  const [selectedLang, setSelectedLang] = useState<LanguageSlug>('python');

  const languageDetails = {
    python: {
      name: 'Python 3',
      version: 'Python 3.10+',
      paradigm: 'Multi-paradigm (Dynamic, Object-Oriented, Functional)',
      speed: 'Interpreted bytecode (CPython)',
      memory: 'Automatic Reference Counting + Garbage Collector',
      bestFor: 'AI/ML, Data Engineering, Automation, Web APIs',
      syntaxPeculiarities: [
        'Significant whitespace indentation instead of curly braces {}',
        'Compound statements (if, for, def, class) require terminating colons :',
        'Dynamic typing with optional static type hints (PEP 484)',
        'Powerful list comprehensions and generator expressions'
      ],
      sampleCode: `# Python 3.10 Pattern Matching & Type Annotations
def process_message(data: dict) -> str:
    match data:
        case {"status": "ok", "code": 200}:
            return "Request succeeded perfectly"
        case {"status": "error", "message": msg}:
            return f"Encountered error: {msg}"
        case _:
            return "Unknown response payload"

print(process_message({"status": "ok", "code": 200}))`
    },
    javascript: {
      name: 'JavaScript (Node.js)',
      version: 'ECMAScript 2023 / Node 20+',
      paradigm: 'Event-driven, Prototypal OOP, First-class Functional',
      speed: 'JIT Compiled (Google V8 Engine)',
      memory: 'Automatic Garbage Collection (Mark and Sweep)',
      bestFor: 'Full-stack Web Apps, Microservices, Interactive UIs',
      syntaxPeculiarities: [
        'Single-threaded asynchronous non-blocking event loop',
        'Strict equality (===) vs Loose equality (==) with type coercion',
        'Lexical scoping with closures and arrow functions (=>)',
        'Destructuring assignment, spread/rest operators (...)'
      ],
      sampleCode: `// Modern Async JavaScript with Promises
async function fetchUserData(userId) {
    const simulateFetch = (id) => new Promise((resolve) => {
        setTimeout(() => resolve({ id, name: "Coder", role: "Dev" }), 50);
    });

    const user = await simulateFetch(userId);
    const { name, role } = user;
    return \`User \${name} has role: \${role}\`;
}

fetchUserData(101).then(console.log);`
    },
    cpp: {
      name: 'Modern C++ (GCC/Clang)',
      version: 'ISO C++20 Standard',
      paradigm: 'Systems, Multi-paradigm (Procedural, OOP, Generic, RAII)',
      speed: 'Ahead-Of-Time (AOT) Machine Code Execution',
      memory: 'Manual Allocation, RAII & Smart Pointers (std::unique_ptr)',
      bestFor: 'Game Engines, High-Frequency Trading, Systems OS, Embedded',
      syntaxPeculiarities: [
        'Deterministic resource management via RAII destructor guarantees',
        'Explicit distinction between values, pointers (*), and references (&)',
        'Compile-time metaprogramming via C++20 Concepts and Templates',
        'Zero-overhead abstractions for STL containers'
      ],
      sampleCode: `// Modern C++20 Concepts & Standard Algorithms
#include <iostream>
#include <vector>
#include <concepts>
#include <numeric>

template<std::integral T>
T compute_sum(const std::vector<T>& vec) {
    return std::accumulate(vec.begin(), vec.end(), T{0});
}

int main() {
    std::vector<int> numbers = {10, 20, 30, 40};
    std::cout << "Sum: " << compute_sum(numbers) << std::endl;
    return 0;
}`
    }
  };

  const current = languageDetails[selectedLang];

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Title */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-400 border border-teal-500/20">
            <Globe className="h-3.5 w-3.5" />
            Language Architecture Explorer
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Understand Syntax, Runtimes & Paradigms
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Every language on CodeMaster AI is backed by dedicated preflight parser engines and sandbox runners. Compare semantics across our supported languages.
          </p>
        </div>

        {/* Language Tabs */}
        <div className="flex justify-center">
          <div className="flex items-center gap-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-1.5">
            {(['python', 'javascript', 'cpp'] as LanguageSlug[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setSelectedLang(lang)}
                className={`rounded-xl px-5 py-2.5 text-xs font-bold transition-all ${
                  selectedLang === lang
                    ? 'bg-teal-500 text-slate-950 shadow-glow-cyan'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                {lang === 'cpp' ? 'C++20' : lang.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Language Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Metadata & Architecture Specifications (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                <h3 className="text-xl font-bold text-white">{current.name}</h3>
                <span className="rounded bg-teal-500/10 border border-teal-500/30 px-2 py-0.5 text-xs font-semibold text-teal-400">
                  {current.version}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider block mb-0.5">
                    Core Paradigm:
                  </span>
                  <span className="text-slate-200">{current.paradigm}</span>
                </div>

                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider block mb-0.5">
                    Execution Model & Engine:
                  </span>
                  <span className="text-slate-200">{current.speed}</span>
                </div>

                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider block mb-0.5">
                    Memory Model:
                  </span>
                  <span className="text-slate-200">{current.memory}</span>
                </div>

                <div>
                  <span className="text-slate-400 font-semibold uppercase text-[10px] tracking-wider block mb-0.5">
                    Primary Domain:
                  </span>
                  <span className="text-slate-200">{current.bestFor}</span>
                </div>
              </div>

              <div className="pt-2">
                <Link
                  to="/compiler"
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-500 px-4 py-2.5 text-xs font-semibold text-slate-950 shadow-glow-cyan hover:bg-teal-400 transition-all"
                >
                  <Terminal className="h-4 w-4" />
                  Launch {current.name} in Online IDE
                </Link>
              </div>
            </div>

            {/* Syntax Peculiarities */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400">
                Key Syntax Characteristics
              </h4>
              <ul className="space-y-2 text-xs text-slate-300">
                {current.syntaxPeculiarities.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-teal-400 shrink-0 mt-0.5" />
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>

          {/* Right Live Sample Code Window (7 Cols) */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-slate-800 bg-[#0d1117] shadow-xl overflow-hidden">
              <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-4 py-2.5 text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-rose-500/80"></span>
                  <span className="h-3 w-3 rounded-full bg-amber-500/80"></span>
                  <span className="h-3 w-3 rounded-full bg-emerald-500/80"></span>
                  <span className="ml-2 font-mono text-slate-300 font-medium">sample.{selectedLang === 'python' ? 'py' : selectedLang === 'javascript' ? 'js' : 'cpp'}</span>
                </div>
                <span className="font-mono text-teal-400 text-[11px] font-semibold">
                  Preflight Verified
                </span>
              </div>

              <div className="p-4 font-mono text-xs leading-relaxed overflow-x-auto text-slate-200">
                <pre>{current.sampleCode}</pre>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
