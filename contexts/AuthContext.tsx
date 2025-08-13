'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthService, AuthState, User } from '@/lib/auth';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (email: string, password: string, displayName: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateDisplayName: (displayName: string) => Promise<{ success: boolean; error?: string }>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authState, setAuthState] = useState<AuthState>({ user: null, isAuthenticated: false });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load session on mount
    const session = AuthService.getSession();
    setAuthState(session);
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const result = AuthService.login(email, password);
    if (result.success && result.user) {
      setAuthState({ user: result.user, isAuthenticated: true });
    }
    return result;
  };

  const signup = async (email: string, password: string, displayName: string) => {
    const result = AuthService.signup(email, password, displayName);
    if (result.success && result.user) {
      setAuthState({ user: result.user, isAuthenticated: true });
    }
    return result;
  };

  const logout = () => {
    AuthService.logout();
    setAuthState({ user: null, isAuthenticated: false });
  };

  const updateDisplayName = async (displayName: string) => {
    const result = AuthService.updateDisplayName(displayName);
    if (result.success && result.user) {
      setAuthState({ user: result.user, isAuthenticated: true });
    }
    return result;
  };

  const value: AuthContextType = {
    ...authState,
    login,
    signup,
    logout,
    updateDisplayName,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}