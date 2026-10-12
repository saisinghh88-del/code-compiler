import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, CheckCircle2, ArrowRight, Loader2, Sparkles, Filter } from 'lucide-react';
import { api } from '../services/api';
import { ProblemItem } from '../types';

export const ChallengesPage: React.FC = () => {
  const [problems, setProblems] = useState<ProblemItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');

  useEffect(() => {
    api.getProblems()
      .then((data) => setProblems(data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = difficultyFilter === 'all'
    ? problems
    : problems.filter(p => p.difficulty === difficultyFilter);

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-400 border border-teal-500/20">
            <Trophy className="h-3.5 w-3.5" />
            Coding Challenges & Problem Sets
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Algorithmic Problem Solving
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Solve problems against public and hidden unit test suites. Run tests in isolated execution sandboxes and view detailed runtime metrics.
          </p>
        </div>

        {/* Filter bar */}
        <div className="flex justify-center">
          <div className="flex items-center gap-1.5 rounded-2xl border border-slate-800 bg-slate-900/60 p-1.5 text-xs font-semibold">
            {['all', 'easy', 'medium', 'hard'].map((diff) => (
              <button
                key={diff}
                onClick={() => setDifficultyFilter(diff)}
                className={`rounded-xl px-4 py-2 capitalize transition-all ${
                  difficultyFilter === diff
                    ? 'bg-teal-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {diff}
              </button>
            ))}
          </div>
        </div>

        {/* Problems List */}
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
          </div>
        ) : (
          <div className="space-y-4 max-w-4xl mx-auto">
            {filtered.map((problem) => (
              <div
                key={problem.id}
                className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-slate-700 transition-all group"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <h3 className="text-lg font-bold text-white group-hover:text-teal-300 transition-colors">
                      {problem.title}
                    </h3>
                    <span className={`rounded px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider border ${
                      problem.difficulty === 'easy'
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                        : problem.difficulty === 'medium'
                        ? 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                        : 'border-rose-500/30 bg-rose-500/10 text-rose-400'
                    }`}>
                      {problem.difficulty}
                    </span>
                    <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-mono text-slate-400 uppercase">
                      {problem.language}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                    {problem.description}
                  </p>
                </div>

                <Link
                  to={`/challenges/${problem.slug}`}
                  className="flex items-center justify-center gap-2 rounded-xl bg-teal-500 px-5 py-2.5 text-xs font-semibold text-slate-950 shadow-glow-cyan hover:bg-teal-400 transition-all shrink-0"
                >
                  Solve Challenge
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};
