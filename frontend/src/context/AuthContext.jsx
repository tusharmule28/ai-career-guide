import React, { createContext, useContext, useState, useEffect } from 'react';
import { getUser, logout, setUser, setToken } from '../utils/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUserState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check for existing user in localStorage on mount
    const savedUser = getUser();
    if (savedUser) {
      setUserState(savedUser);
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    setUserState(userData);
    setUser(userData);
    setToken(token);
  };

  const logoutUser = () => {
    setUserState(null);
    logout();
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout: logoutUser }}>
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
