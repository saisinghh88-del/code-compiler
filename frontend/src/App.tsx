import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';

// Pages
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { CompilerPage } from './pages/CompilerPage';
import { AITutorPage } from './pages/AITutorPage';
import { LanguageExplorerPage } from './pages/LanguageExplorerPage';
import { CoursesPage } from './pages/CoursesPage';
import { LessonPage } from './pages/LessonPage';
import { ChallengesPage } from './pages/ChallengesPage';
import { ChallengeDetailPage } from './pages/ChallengeDetailPage';
import { ProfilePage } from './pages/ProfilePage';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isCompiler = location.pathname.startsWith('/compiler');
  const isAuth = location.pathname.startsWith('/auth');

  return (
    <div className="flex min-h-screen flex-col bg-[#0b0f17] text-slate-100 selection:bg-teal-500 selection:text-slate-950">
      {!isAuth && <Navbar />}
      <main className="flex-1">
        {children}
      </main>
      {!isCompiler && !isAuth && <Footer />}
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/auth" element={<AuthPage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/compiler" element={<CompilerPage />} />
              <Route path="/tutor" element={<AITutorPage />} />
              <Route path="/languages" element={<LanguageExplorerPage />} />
              <Route path="/courses" element={<CoursesPage />} />
              <Route path="/courses/:courseSlug/lessons/:lessonSlug" element={<LessonPage />} />
              <Route path="/challenges" element={<ChallengesPage />} />
              <Route path="/challenges/:slug" element={<ChallengeDetailPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
