import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Code2, 
  Terminal, 
  BookOpen, 
  Sparkles, 
  Trophy, 
  Globe, 
  Moon, 
  Sun, 
  User, 
  LogOut, 
  Menu, 
  X,
  Flame,
  Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: 'Dashboard', path: '/dashboard', icon: Zap },
    { label: 'Courses', path: '/courses', icon: BookOpen },
    { label: 'Compiler', path: '/compiler', icon: Terminal },
    { label: 'AI Tutor', path: '/tutor', icon: Sparkles },
    { label: 'Challenges', path: '/challenges', icon: Trophy },
    { label: 'Languages', path: '/languages', icon: Globe },
  ];

  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        {/* Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 transition-transform hover:scale-[1.02]">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-teal-500 via-cyan-500 to-indigo-600 shadow-glow-cyan">
            <Code2 className="h-5 w-5 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-white">
              CodeMaster<span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent"> AI</span>
            </span>
            <span className="block text-[10px] font-medium uppercase tracking-wider text-teal-400/80">
              Dev Platform
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-1 md:flex">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                  active
                    ? 'bg-teal-500/10 text-teal-400 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]'
                    : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${active ? 'text-teal-400' : 'text-slate-500'}`} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* XP & Streak Indicator */}
          {user && (
            <div className="hidden items-center gap-2 rounded-full border border-slate-800 bg-slate-900/60 px-2.5 py-1 text-xs sm:flex">
              <span className="flex items-center gap-1 font-semibold text-amber-400">
                <Flame className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                3d streak
              </span>
              <span className="h-3 w-px bg-slate-700"></span>
              <span className="flex items-center gap-1 font-semibold text-teal-400">
                <Zap className="h-3.5 w-3.5 text-teal-400 fill-teal-400" />
                {user.xp_points} XP
              </span>
            </div>
          )}

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/60 text-slate-400 transition-colors hover:border-slate-700 hover:text-slate-200"
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-indigo-400" />}
          </button>

          {/* User Account / Login */}
          {user ? (
            <div className="flex items-center gap-2">
              <Link
                to="/profile"
                className="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/80 p-1.5 transition-colors hover:border-teal-500/50"
              >
                <img
                  src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&auto=format&fit=crop&q=80'}
                  alt={user.username}
                  className="h-6 w-6 rounded-md object-cover"
                />
                <span className="hidden text-xs font-semibold text-slate-200 lg:inline">
                  {user.username}
                </span>
              </Link>
              <button
                onClick={logout}
                title="Log out"
                className="hidden rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-900 hover:text-rose-400 sm:block"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/auth"
                className="rounded-lg bg-teal-500 px-3 py-1.5 text-xs font-semibold text-slate-950 transition-all hover:bg-teal-400 shadow-glow-cyan"
              >
                Sign In
              </Link>
            </div>
          )}

          {/* Mobile hamburger menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-800 bg-slate-900 text-slate-400 md:hidden"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-800 bg-slate-950 px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-1.5">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium ${
                    isActive(item.path)
                      ? 'bg-teal-500/10 text-teal-400'
                      : 'text-slate-400 hover:bg-slate-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
            {user ? (
              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-rose-400 hover:bg-slate-900"
              >
                <LogOut className="h-4 w-4" />
                Sign Out ({user.username})
              </button>
            ) : (
              <Link
                to="/auth"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center rounded-lg bg-teal-500 px-3 py-2 text-sm font-semibold text-slate-950"
              >
                Sign In / Register
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};
