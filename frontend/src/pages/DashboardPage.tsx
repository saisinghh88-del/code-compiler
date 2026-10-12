import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Zap, 
  Flame, 
  BookOpen, 
  Terminal, 
  Trophy, 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  Clock, 
  Code2, 
  Play
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { CourseItem, ProblemItem } from '../types';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [problems, setProblems] = useState<ProblemItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.getCourses(), api.getProblems()])
      .then(([cData, pData]) => {
        setCourses(cData);
        setProblems(pData);
      })
      .finally(() => setLoading(false));
  }, []);

  const featuredCourse = courses[0];

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Welcome Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome back, <span className="text-teal-400">{user?.username || 'Developer'}</span>!
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Track your learning momentum, analyze code diagnostics, and advance your engineering skills.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/compiler"
              className="flex items-center gap-1.5 rounded-xl bg-teal-500 px-4 py-2.5 text-xs font-semibold text-slate-950 shadow-glow-cyan hover:bg-teal-400 transition-all"
            >
              <Terminal className="h-4 w-4" />
              Quick Open IDE
            </Link>
          </div>
        </div>

        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Experience Points</span>
              <Zap className="h-4 w-4 text-teal-400" />
            </div>
            <div className="text-2xl font-bold text-white">{user?.xp_points || 340} XP</div>
            <div className="text-[11px] text-teal-400 font-medium">+45 XP gained this week</div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Daily Streak</span>
              <Flame className="h-4 w-4 text-amber-500 fill-amber-500" />
            </div>
            <div className="text-2xl font-bold text-white">3 Days</div>
            <div className="text-[11px] text-amber-400 font-medium">Keep it going tomorrow!</div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Active Curriculum</span>
              <BookOpen className="h-4 w-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold text-white">Python Track</div>
            <div className="text-[11px] text-slate-400">Lesson 2 of 4 in progress</div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Challenges Solved</span>
              <Trophy className="h-4 w-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-white">2 Problems</div>
            <div className="text-[11px] text-indigo-400 font-medium">Rank: Top 15%</div>
          </div>

        </div>

        {/* Continue Learning Featured Card */}
        {featuredCourse && (
          <div className="rounded-2xl border border-teal-900/50 bg-gradient-to-r from-teal-950/30 via-slate-900/40 to-indigo-950/30 p-6 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/10 px-2.5 py-0.5 text-[11px] font-semibold text-teal-300 border border-teal-500/20">
                  <Play className="h-3 w-3 fill-teal-400" />
                  Continue Learning
                </div>
                <h3 className="text-xl font-bold text-white">{featuredCourse.title}</h3>
                <p className="text-xs text-slate-300 max-w-2xl leading-relaxed">
                  {featuredCourse.description}
                </p>
              </div>

              <Link
                to={`/courses/${featuredCourse.slug}/lessons/${featuredCourse.lessons?.[0]?.slug || 'python-variables-types'}`}
                className="flex items-center gap-2 rounded-xl bg-teal-500 px-5 py-3 text-xs font-semibold text-slate-950 shadow-glow-cyan hover:bg-teal-400 transition-all shrink-0"
              >
                Resume Lesson
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1.5 pt-2">
              <div className="flex justify-between text-[11px] text-slate-400 font-medium">
                <span>Course Completion</span>
                <span className="text-teal-400">50% Completed</span>
              </div>
              <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 w-1/2 rounded-full"></div>
              </div>
            </div>
          </div>
        )}

        {/* Two Columns: Available Curriculum & Recommended Coding Challenges */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Available Tracks */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Curriculum Tracks</h3>
              <Link to="/courses" className="text-xs text-teal-400 hover:text-teal-300 font-semibold">
                View All
              </Link>
            </div>

            <div className="space-y-3">
              {courses.map((course) => (
                <Link
                  key={course.id}
                  to={`/courses/${course.slug}/lessons/${course.lessons?.[0]?.slug || 'lesson-1'}`}
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/30 p-4 hover:border-slate-700 hover:bg-slate-900/60 transition-all group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white group-hover:text-teal-300 transition-colors">
                        {course.title}
                      </span>
                      <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] uppercase font-bold text-slate-400">
                        {course.level}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1">
                      {course.description}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-teal-400 transition-colors ml-4 shrink-0" />
                </Link>
              ))}
            </div>
          </div>

          {/* Recommended Challenges */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white">Algorithmic Challenges</h3>
              <Link to="/challenges" className="text-xs text-teal-400 hover:text-teal-300 font-semibold">
                Browse All
              </Link>
            </div>

            <div className="space-y-3">
              {problems.map((problem) => (
                <Link
                  key={problem.id}
                  to={`/challenges/${problem.slug}`}
                  className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/30 p-4 hover:border-slate-700 hover:bg-slate-900/60 transition-all group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white group-hover:text-cyan-300 transition-colors">
                        {problem.title}
                      </span>
                      <span className="rounded bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 text-[10px] uppercase font-bold text-emerald-400">
                        {problem.difficulty}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1">
                      {problem.description}
                    </p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-slate-500 group-hover:text-cyan-400 transition-colors ml-4 shrink-0" />
                </Link>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
