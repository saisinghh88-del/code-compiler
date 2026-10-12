import React, { useEffect, useState } from 'react';
import { 
  User, 
  Settings, 
  Trophy, 
  Code2, 
  Flame, 
  Zap, 
  FolderGit2, 
  Calendar, 
  ExternalLink,
  ShieldCheck,
  Check
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { ProjectItem } from '../types';

export const ProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Profile edit state
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    api.getProjects()
      .then((data) => setProjects(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ full_name: fullName, bio });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const achievements = [
    {
      id: 'a1',
      title: 'First AST Analysis',
      desc: 'Caught a syntax error before running code using the preflight parser engine.',
      unlocked: true,
      icon: ShieldCheck
    },
    {
      id: 'a2',
      title: 'Algorithmic Problem Solver',
      desc: 'Submitted code that passed all public and hidden test cases.',
      unlocked: true,
      icon: Trophy
    },
    {
      id: 'a3',
      title: 'Polyglot Explorer',
      desc: 'Executed code across Python, JavaScript, and C++.',
      unlocked: true,
      icon: Code2
    },
    {
      id: 'a4',
      title: '7-Day Code Streak',
      desc: 'Maintained consecutive daily practice.',
      unlocked: false,
      icon: Flame
    }
  ];

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
        
        {/* Profile Header Banner */}
        <div className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900/80 via-slate-900/40 to-slate-950 p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6 shadow-xl">
          <img
            src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt="Avatar"
            className="h-24 w-24 rounded-2xl object-cover border-2 border-teal-500/50 shadow-glow-cyan"
          />

          <div className="flex-1 text-center sm:text-left space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2">
              <h1 className="text-2xl font-extrabold text-white">{user?.full_name || 'CodeMaster Learner'}</h1>
              <span className="text-xs font-mono text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-full border border-teal-500/20 w-fit mx-auto sm:mx-0">
                @{user?.username || 'learner'}
              </span>
            </div>
            <p className="text-xs text-slate-400 max-w-xl leading-relaxed">
              {user?.bio || 'Full-stack software developer focusing on modern systems programming & AI integration.'}
            </p>
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-4 pt-1 text-xs text-slate-400">
              <span className="flex items-center gap-1 text-teal-400 font-semibold">
                <Zap className="h-3.5 w-3.5" /> {user?.xp_points || 340} Total XP
              </span>
              <span className="flex items-center gap-1 text-amber-400 font-semibold">
                <Flame className="h-3.5 w-3.5" /> 3-Day Active Streak
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="h-3.5 w-3.5 text-slate-500" /> Member since 2026
              </span>
            </div>
          </div>
        </div>

        {/* Tabbed / Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Saved Projects & Achievements (8 Cols) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Saved Workspaces / Projects */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FolderGit2 className="h-5 w-5 text-teal-400" />
                  <h3 className="text-lg font-bold text-white">Saved Projects & Workspaces</h3>
                </div>
              </div>

              {projects.length === 0 ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-900/20 p-6 text-center text-xs text-slate-400">
                  No projects saved yet. Create a script in the Online Compiler and click "Save".
                </div>
              ) : (
                <div className="space-y-3">
                  {projects.map((proj) => (
                    <div
                      key={proj.id}
                      className="rounded-2xl border border-slate-800 bg-slate-900/40 p-5 flex items-center justify-between hover:border-slate-700 transition-all"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{proj.title}</h4>
                          <span className="rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-teal-400 uppercase">
                            {proj.language}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400">
                          {proj.description || 'Saved editor workspace snippet.'}
                        </p>
                      </div>

                      <div className="text-[11px] text-slate-400 font-mono">
                        {new Date(proj.updated_at).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Platform Achievements */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">Learner Milestones & Badges</h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {achievements.map((ach) => {
                  const Icon = ach.icon;
                  return (
                    <div
                      key={ach.id}
                      className={`rounded-2xl border p-4 space-y-2 transition-all ${
                        ach.unlocked
                          ? 'border-teal-900/40 bg-teal-950/10'
                          : 'border-slate-800/60 bg-slate-900/20 opacity-60'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                          ach.unlocked ? 'bg-teal-500/20 text-teal-400' : 'bg-slate-800 text-slate-500'
                        }`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <h4 className="text-xs font-bold text-white">{ach.title}</h4>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {ach.desc}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* Right Column: Profile Settings (4 Cols) */}
          <div className="lg:col-span-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/40 p-6 space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-white border-b border-slate-800/80 pb-3">
                <Settings className="h-4 w-4 text-teal-400" />
                Profile Settings
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-3 text-xs">
                <div>
                  <label className="text-slate-400 font-medium block mb-1">Full Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-[#0d1117] p-2.5 text-slate-200 outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="text-slate-400 font-medium block mb-1">Bio / Headline</label>
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full rounded-lg border border-slate-800 bg-[#0d1117] p-2.5 text-slate-200 outline-none focus:border-teal-500 resize-none leading-relaxed"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-1.5 rounded-xl bg-teal-500 py-2.5 font-semibold text-slate-950 shadow-glow-cyan hover:bg-teal-400 transition-all"
                  >
                    {savedSuccess ? <Check className="h-4 w-4" /> : null}
                    {savedSuccess ? 'Changes Saved!' : 'Save Settings'}
                  </button>
                </div>
              </form>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
