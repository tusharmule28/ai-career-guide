'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getUser, logout as authLogout, setUser, setToken } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: any | null;
  loading: boolean;
  login: (userData: any, token: string) => void;
  logout: () => void;
  updateUser: (updatedData: any) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUserState] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check for existing user in localStorage on mount
    const savedUser = getUser();
    if (savedUser) {
      setUserState(savedUser);
    }
    setLoading(false);
  }, []);

  const login = (userData: any, token: string) => {
    setUserState(userData);
    setUser(userData);
    setToken(token);
    router.push('/dashboard');
  };

  const logout = () => {
    setUserState(null);
    authLogout();
    router.push('/login');
  };

  const updateUser = (updatedData: any) => {
    setUserState((prevUser: any) => {
      const newUser = { ...prevUser, ...updatedData };
      setUser(newUser); // Update localStorage
      return newUser;
    });
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
