import React, { createContext, useContext, useEffect, useState } from 'react';
import { UserProfile } from '../types';
import { supabase, isSupabaseConfigured } from '../services/supabase';
import { api } from '../services/api';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password?: string) => Promise<void>;
  signup: (email: string, username: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => void;
  addXP: (amount: number) => void;
}

const DEFAULT_DEMO_USER: UserProfile = {
  id: 'learner-usr-101',
  email: 'learner@codemaster.ai',
  username: 'AlexDev',
  full_name: 'Alex Mercer',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  bio: 'Full-stack software developer focusing on modern systems programming & AI integration.',
  xp_points: 340,
  role: 'learner'
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('codemaster-user');
    return saved ? JSON.parse(saved) : DEFAULT_DEMO_USER;
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('codemaster-user', JSON.stringify(user));
    } else {
      localStorage.removeItem('codemaster-user');
    }
  }, [user]);

  // Sync with Supabase session if configured
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          api.setAuthToken(session.access_token);
          setUser(prev => ({
            id: session.user.id,
            email: session.user.email || 'user@example.com',
            username: session.user.user_metadata?.username || 'Learner',
            full_name: session.user.user_metadata?.full_name || 'CodeMaster Learner',
            xp_points: prev?.xp_points || 100,
            role: 'learner'
          }));
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          api.setAuthToken(session.access_token);
        } else {
          api.setAuthToken(null);
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const login = async (email: string, password?: string) => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase && password) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.session) {
          api.setAuthToken(data.session.access_token);
          setUser({
            id: data.user.id,
            email: data.user.email || email,
            username: data.user.user_metadata?.username || email.split('@')[0],
            full_name: data.user.user_metadata?.full_name || 'CodeMaster Learner',
            xp_points: 250,
            role: 'learner'
          });
        }
      } else {
        // Instant simulated session login
        setUser({
          id: 'user-' + Math.random().toString(36).substring(2, 9),
          email,
          username: email.split('@')[0],
          full_name: email.split('@')[0].toUpperCase(),
          xp_points: 150,
          role: 'learner'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, username: string, password?: string) => {
    setLoading(true);
    try {
      if (isSupabaseConfigured && supabase && password) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { username, full_name: username } }
        });
        if (error) throw error;
        if (data.user) {
          setUser({
            id: data.user.id,
            email,
            username,
            full_name: username,
            xp_points: 50,
            role: 'learner'
          });
        }
      } else {
        setUser({
          id: 'user-' + Math.random().toString(36).substring(2, 9),
          email,
          username,
          full_name: username,
          xp_points: 50,
          role: 'learner'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    api.setAuthToken(null);
    setUser(null);
  };

  const updateProfile = (data: Partial<UserProfile>) => {
    setUser(prev => prev ? { ...prev, ...data } : null);
  };

  const addXP = (amount: number) => {
    setUser(prev => prev ? { ...prev, xp_points: prev.xp_points + amount } : null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, logout, updateProfile, addXP }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
