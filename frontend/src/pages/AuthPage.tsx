import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Code2, ArrowRight, Lock, Mail, User, ShieldCheck, Sparkles, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const AuthPage: React.FC = () => {
  const { login, signup, loading } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    try {
      if (mode === 'signin') {
        await login(email, password);
      } else {
        await signup(email, username || email.split('@')[0], password);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setErrorMsg(err.message || 'Authentication failed. Please verify credentials.');
    }
  };

  const handleQuickDemoAccess = async () => {
    await login('learner@codemaster.ai');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex items-center justify-center p-4">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-teal-500/10 blur-[120px] pointer-events-none"></div>

      <div className="w-full max-w-md space-y-6 relative z-10">
        
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-teal-500 to-indigo-600 shadow-glow-cyan">
              <Code2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              CodeMaster <span className="text-teal-400">AI</span>
            </span>
          </Link>
          <p className="text-xs text-slate-400">
            {mode === 'signin' ? 'Sign in to your learning dashboard' : 'Create your developer account'}
          </p>
        </div>

        {/* Card Box */}
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-8 shadow-2xl space-y-6">
          
          {/* Tabs */}
          <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800/80 text-xs font-semibold">
            <button
              onClick={() => {
                setMode('signin');
                setErrorMsg(null);
              }}
              className={`flex-1 rounded-lg py-2 transition-all ${
                mode === 'signin'
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => {
                setMode('signup');
                setErrorMsg(null);
              }}
              className={`flex-1 rounded-lg py-2 transition-all ${
                mode === 'signup'
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Create Account
            </button>
          </div>

          {errorMsg && (
            <div className="rounded-xl border border-rose-900/50 bg-rose-950/30 p-3 text-xs text-rose-300">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {mode === 'signup' && (
              <div>
                <label className="text-slate-300 font-medium block mb-1">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. dev_coder"
                    className="w-full rounded-xl border border-slate-800 bg-[#0d1117] py-2.5 pl-9 pr-3 text-slate-200 outline-none focus:border-teal-500"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-slate-300 font-medium block mb-1">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="learner@example.com"
                  className="w-full rounded-xl border border-slate-800 bg-[#0d1117] py-2.5 pl-9 pr-3 text-slate-200 outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div>
              <label className="text-slate-300 font-medium block mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full rounded-xl border border-slate-800 bg-[#0d1117] py-2.5 pl-9 pr-3 text-slate-200 outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-teal-500 py-3 font-semibold text-slate-950 shadow-glow-cyan hover:bg-teal-400 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {mode === 'signin' ? 'Sign In to Dashboard' : 'Register & Start Learning'}
            </button>
          </form>

          {/* Quick Demo Access Button */}
          <div className="relative pt-2">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-slate-800"></span>
            </div>
            <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
              <span className="bg-slate-900 px-2 text-slate-500">Or instant access</span>
            </div>
          </div>

          <button
            onClick={handleQuickDemoAccess}
            className="w-full flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-950/80 py-2.5 text-xs font-semibold text-slate-300 hover:bg-slate-900 hover:text-white transition-all"
          >
            <Sparkles className="h-3.5 w-3.5 text-teal-400" />
            Continue as Guest Learner (Demo Session)
          </button>

        </div>

      </div>
    </div>
  );
};
