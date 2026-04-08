import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import JobExplore from './pages/JobExplore';
import JobMatches from './pages/JobMatches';
import ResumeUploadPage from './components/ResumeUpload';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Applications from './pages/Applications';
import NotificationsPage from './pages/Notifications';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
  
  if (!user) return <Navigate to="/login" replace />;
  
  return children;
};

const AppContent = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
          <Route path="/signup" element={user ? <Navigate to="/dashboard" /> : <Signup />} />
          
          <Route path="/" element={<Home />} />

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/jobs" element={<Navigate to="/jobs/explore" replace />} />
          <Route path="/jobs/explore" element={
            <ProtectedRoute>
              <JobExplore />
            </ProtectedRoute>
          } />
          <Route path="/jobs/matches" element={
            <ProtectedRoute>
              <JobMatches />
            </ProtectedRoute>
          } />
          
          <Route path="/resume-upload" element={
            <ProtectedRoute>
              <ResumeUploadPage />
            </ProtectedRoute>
          } />

          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />

          <Route path="/applications" element={
            <ProtectedRoute>
              <Applications />
            </ProtectedRoute>
          } />

          <Route path="/notifications" element={
            <ProtectedRoute>
              <NotificationsPage />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      
      <footer className="py-12 border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center text-sm text-gray-500">
          © 2026 AI Career Guide. All rights reserved. Built with precision and care.
        </div>
      </footer>
    </div>
  );
};

import { Toaster } from 'react-hot-toast';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#363636',
              boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
              borderRadius: '16px',
              padding: '16px',
              fontWeight: '500',
            },
          }}
        />
        <AppContent />
      </Router>
    </AuthProvider>
  );
};

export default App;
