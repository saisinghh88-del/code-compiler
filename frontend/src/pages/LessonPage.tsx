import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  BookOpen, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  Play, 
  ShieldCheck, 
  HelpCircle, 
  Award, 
  Check, 
  X,
  Loader2,
  Terminal,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

import { api } from '../services/api';
import { CourseItem, LessonItem, QuizItem, QuizAnswerResult } from '../types';
import { useAuth } from '../context/AuthContext';

export const LessonPage: React.FC = () => {
  const { courseSlug, lessonSlug } = useParams<{ courseSlug: string; lessonSlug: string }>();
  const navigate = useNavigate();
  const { addXP } = useAuth();

  const [course, setCourse] = useState<CourseItem | null>(null);
  const [currentLesson, setCurrentLesson] = useState<LessonItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Lesson Code Sandbox State
  const [lessonCode, setLessonCode] = useState<string>('');
  const [lessonDiagnostics, setLessonDiagnostics] = useState<any[]>([]);
  const [analyzingLessonCode, setAnalyzingLessonCode] = useState(false);
  const [executingCode, setExecutingCode] = useState(false);
  const [runOutput, setRunOutput] = useState<string | null>(null);

  // Quiz State
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [quizResults, setQuizResults] = useState<Record<string, QuizAnswerResult>>({});
  const [submittingQuiz, setSubmittingQuiz] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!courseSlug) return;
    setLoading(true);

    api.getCourse(courseSlug)
      .then((cData) => {
        setCourse(cData);
        const lesson = cData.lessons?.find(l => l.slug === lessonSlug) || cData.lessons?.[0];
        if (lesson) {
          setCurrentLesson(lesson);
          setLessonCode(lesson.initial_code || lesson.code_snippet || '');
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [courseSlug, lessonSlug]);

  // Real-time debounced pre-execution error spotting in lesson sandbox
  useEffect(() => {
    if (!course || !lessonCode.trim()) {
      setLessonDiagnostics([]);
      return;
    }

    const timer = setTimeout(() => {
      setAnalyzingLessonCode(true);
      api.analyzeCode(course.language_slug, lessonCode)
        .then((res) => {
          setLessonDiagnostics(res.diagnostics);
        })
        .catch((err) => console.error(err))
        .finally(() => setAnalyzingLessonCode(false));
    }, 450);

    return () => clearTimeout(timer);
  }, [lessonCode, course]);

  const handleRunLessonCode = async () => {
    if (!currentLesson || !course) return;
    setExecutingCode(true);
    try {
      const res = await api.executeCode(course.language_slug, lessonCode);
      if (res.status === 'blocked') {
        setRunOutput(`[Preflight Blocked]:\n${res.compile_output}`);
      } else {
        setRunOutput(res.stdout || res.stderr || 'Code executed with no stdout output.');
      }
    } catch (err: any) {
      setRunOutput(`Error: ${err.message}`);
    } finally {
      setExecutingCode(false);
    }
  };

  const handleSelectQuizOption = (quizId: string, optIndex: number) => {
    setSelectedAnswers(prev => ({ ...prev, [quizId]: optIndex }));
  };

  const handleSubmitQuiz = async (quizId: string) => {
    if (!courseSlug || selectedAnswers[quizId] === undefined) return;
    setSubmittingQuiz(prev => ({ ...prev, [quizId]: true }));
    try {
      const res = await api.submitQuiz(courseSlug, quizId, selectedAnswers[quizId]);
      setQuizResults(prev => ({ ...prev, [quizId]: res }));
      if (res.is_correct) {
        addXP(res.points_awarded);
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.8 }
          });
        } catch (e) {}
      }
    } catch (err) {
      console.error('Quiz submit failed:', err);
    } finally {
      setSubmittingQuiz(prev => ({ ...prev, [quizId]: false }));
    }
  };

  const handleCompleteLesson = async () => {
    if (!currentLesson) return;
    await api.updateProgress(currentLesson.id, 'completed', lessonCode);
    addXP(20);

    // Find next lesson
    if (course && course.lessons) {
      const currentIndex = course.lessons.findIndex(l => l.id === currentLesson.id);
      if (currentIndex !== -1 && currentIndex + 1 < course.lessons.length) {
        const next = course.lessons[currentIndex + 1];
        navigate(`/courses/${course.slug}/lessons/${next.slug}`);
        return;
      }
    }
    navigate('/courses');
  };

  if (loading || !course || !currentLesson) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0b0f17]">
        <Loader2 className="h-8 w-8 animate-spin text-teal-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col">
      
      {/* Top Breadcrumb Nav */}
      <div className="border-b border-slate-800 bg-slate-950 px-4 py-2.5 text-xs">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <Link to="/courses" className="flex items-center gap-1.5 text-slate-400 hover:text-teal-400 transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to Curriculum Tracks
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">{course.title}</span>
            <span className="text-slate-600">/</span>
            <span className="font-semibold text-teal-400">{currentLesson.title}</span>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="mx-auto max-w-7xl w-full flex-1 p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Lesson Navigation Sidebar (3 Cols) */}
        <div className="lg:col-span-3 space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-4 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-teal-400">
              Module Directory
            </h3>
            <div className="space-y-1">
              {course.lessons?.map((l, i) => {
                const isCurrent = l.id === currentLesson.id;
                return (
                  <Link
                    key={l.id}
                    to={`/courses/${course.slug}/lessons/${l.slug}`}
                    className={`flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-medium transition-all ${
                      isCurrent
                        ? 'bg-teal-500/10 text-teal-300 border border-teal-500/30'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-slate-800 text-[10px] font-bold">
                      {i + 1}
                    </span>
                    <span className="line-clamp-1">{l.title}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Content & Interactive Sandbox (9 Cols) */}
        <div className="lg:col-span-9 space-y-8">
          
          {/* Lesson Header */}
          <div className="space-y-2 border-b border-slate-800 pb-5">
            <div className="flex items-center gap-2">
              <span className="rounded bg-teal-500/10 border border-teal-500/20 px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-teal-400">
                Lesson {currentLesson.order_index}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              {currentLesson.title}
            </h1>
          </div>

          {/* Lesson Body Markdown / Content */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-6 text-sm text-slate-300 leading-relaxed whitespace-pre-line space-y-4 font-sans">
            {currentLesson.content_markdown}
          </div>

          {/* Embedded Interactive Code Exercise Sandbox */}
          <div className="rounded-2xl border border-slate-800 bg-[#0d1117] shadow-xl overflow-hidden space-y-0">
            <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950 px-4 py-2.5">
              <div className="flex items-center gap-3 text-xs font-semibold text-slate-300">
                <div className="flex items-center gap-1.5">
                  <Terminal className="h-4 w-4 text-teal-400" />
                  Interactive Lesson Sandbox
                </div>
                {analyzingLessonCode ? (
                  <span className="flex items-center gap-1 text-[11px] text-cyan-400 font-mono">
                    <Loader2 className="h-3 w-3 animate-spin" /> Checking...
                  </span>
                ) : lessonDiagnostics.length > 0 ? (
                  <span className="flex items-center gap-1 text-[11px] text-rose-400 font-bold bg-rose-950/40 border border-rose-900/50 px-2 py-0.5 rounded-full">
                    {lessonDiagnostics.length} Issue(s) Spotted
                  </span>
                ) : (
                  <span className="text-[11px] text-emerald-400 font-medium bg-emerald-950/30 px-2 py-0.5 rounded-full border border-emerald-900/40">
                    Preflight Clean
                  </span>
                )}
              </div>
              <button
                onClick={handleRunLessonCode}
                disabled={executingCode}
                className="flex items-center gap-1.5 rounded-lg bg-teal-500 px-3 py-1 text-xs font-semibold text-slate-950 shadow hover:bg-teal-400 transition-all disabled:opacity-50"
              >
                {executingCode ? <Loader2 className="h-3 w-3 animate-spin" /> : <Play className="h-3 w-3 fill-slate-950" />}
                Run Snippet
              </button>
            </div>

            {lessonDiagnostics.length > 0 && (
              <div className="bg-rose-950/40 border-b border-rose-900/60 px-4 py-2 text-xs text-rose-300 font-mono">
                <span className="font-bold text-rose-200">Line {lessonDiagnostics[0].line}:{lessonDiagnostics[0].column}: </span>
                {lessonDiagnostics[0].message}
              </div>
            )}

            <div className="p-3">
              <textarea
                value={lessonCode}
                onChange={(e) => setLessonCode(e.target.value)}
                rows={6}
                className="w-full resize-y rounded-lg border border-slate-800 bg-slate-950 p-3 font-mono text-xs text-slate-200 outline-none focus:border-teal-500 leading-relaxed"
              />
            </div>

            {runOutput && (
              <div className="border-t border-slate-800 bg-slate-950/80 p-3 font-mono text-xs">
                <div className="text-[10px] text-teal-400 uppercase tracking-wider font-semibold mb-1">
                  Output:
                </div>
                <pre className="whitespace-pre-wrap text-slate-200">{runOutput}</pre>
              </div>
            )}
          </div>

          {/* Embedded Interactive Quizzes */}
          {currentLesson.quizzes && currentLesson.quizzes.length > 0 && (
            <div className="space-y-6 pt-4">
              <div className="flex items-center gap-2 text-base font-bold text-white">
                <Award className="h-5 w-5 text-amber-400" />
                Concept Checkpoint Quiz
              </div>

              {currentLesson.quizzes.map((quiz) => {
                const selected = selectedAnswers[quiz.id];
                const result = quizResults[quiz.id];
                const isSubmitting = submittingQuiz[quiz.id];

                return (
                  <div key={quiz.id} className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
                    <h4 className="text-sm font-semibold text-slate-100 leading-snug">
                      {quiz.question}
                    </h4>

                    <div className="space-y-2">
                      {quiz.options.map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSelectQuizOption(quiz.id, idx)}
                          disabled={Boolean(result)}
                          className={`w-full text-left rounded-xl p-3 text-xs font-medium border transition-all flex items-center justify-between ${
                            selected === idx
                              ? 'border-teal-500 bg-teal-500/10 text-teal-200'
                              : 'border-slate-800 bg-slate-950/60 text-slate-300 hover:border-slate-700'
                          }`}
                        >
                          <span>{option}</span>
                          {selected === idx && <Check className="h-4 w-4 text-teal-400" />}
                        </button>
                      ))}
                    </div>

                    {!result ? (
                      <button
                        onClick={() => handleSubmitQuiz(quiz.id)}
                        disabled={selected === undefined || isSubmitting}
                        className="rounded-xl bg-teal-500 px-4 py-2 text-xs font-semibold text-slate-950 shadow-glow-cyan hover:bg-teal-400 transition-all disabled:opacity-40"
                      >
                        {isSubmitting ? 'Verifying...' : 'Submit Answer'}
                      </button>
                    ) : (
                      <div className={`rounded-xl p-4 border text-xs space-y-1.5 ${
                        result.is_correct
                          ? 'border-emerald-500/40 bg-emerald-950/20 text-emerald-300'
                          : 'border-rose-500/40 bg-rose-950/20 text-rose-300'
                      }`}>
                        <div className="flex items-center gap-1.5 font-bold">
                          {result.is_correct ? <CheckCircle2 className="h-4 w-4" /> : <X className="h-4 w-4" />}
                          {result.is_correct ? 'Correct! (+10 XP awarded)' : 'Incorrect.'}
                        </div>
                        <p className="text-slate-300 leading-relaxed text-[11px]">
                          {result.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Bottom Complete & Continue Action */}
          <div className="flex items-center justify-between border-t border-slate-800 pt-6">
            <Link
              to="/courses"
              className="rounded-xl border border-slate-800 bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              Back to Catalog
            </Link>

            <button
              onClick={handleCompleteLesson}
              className="flex items-center gap-2 rounded-xl bg-teal-500 px-5 py-2.5 text-xs font-semibold text-slate-950 shadow-glow-cyan hover:bg-teal-400 transition-all"
            >
              Complete & Next Lesson
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
