import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Layers, CheckCircle2, ArrowRight, Loader2, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import { CourseItem } from '../types';

export const CoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLevel, setFilterLevel] = useState<string>('all');

  useEffect(() => {
    api.getCourses()
      .then((data) => setCourses(data))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filterLevel === 'all'
    ? courses
    : courses.filter(c => c.level === filterLevel);

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/10 px-3 py-1 text-xs font-semibold text-teal-400 border border-teal-500/20">
            <BookOpen className="h-3.5 w-3.5" />
            Curated Curriculum
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
            Structured Programming Pathways
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            Progressive lessons with embedded code snippets, syntax checks, and interactive concept validation quizzes.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex justify-center">
          <div className="flex items-center gap-1.5 rounded-2xl border border-slate-800 bg-slate-900/60 p-1.5 text-xs font-semibold">
            {['all', 'beginner', 'intermediate', 'advanced'].map((lvl) => (
              <button
                key={lvl}
                onClick={() => setFilterLevel(lvl)}
                className={`rounded-xl px-4 py-2 capitalize transition-all ${
                  filterLevel === lvl
                    ? 'bg-teal-500 text-slate-950 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Courses Grid */}
        {loading ? (
          <div className="flex h-48 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filtered.map((course) => {
              const firstLessonSlug = course.lessons?.[0]?.slug || 'lesson-1';
              return (
                <div
                  key={course.id}
                  className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 flex flex-col justify-between hover:border-slate-700 transition-all space-y-6"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="rounded bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-teal-400">
                        {course.language_slug}
                      </span>
                      <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                        {course.level}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white leading-snug">
                      {course.title}
                    </h3>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {course.description}
                    </p>

                    <div className="space-y-2 pt-2 border-t border-slate-800/80">
                      <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Included Modules:
                      </div>
                      <div className="space-y-1.5">
                        {course.lessons?.map((l, i) => (
                          <div key={l.id} className="flex items-center gap-2 text-xs text-slate-300">
                            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-slate-800 text-[10px] font-bold text-teal-400">
                              {i + 1}
                            </span>
                            <span className="line-clamp-1">{l.title}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <Link
                    to={`/courses/${course.slug}/lessons/${firstLessonSlug}`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-teal-500 px-4 py-2.5 text-xs font-semibold text-slate-950 shadow-glow-cyan hover:bg-teal-400 transition-all"
                  >
                    Start Course
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
};
