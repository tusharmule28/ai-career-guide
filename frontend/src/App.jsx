import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Jobs from './pages/Jobs';
import ResumeUploadPage from './components/ResumeUpload';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Applications from './pages/Applications';
import NotificationsPage from './pages/Notifications';
import JobDetail from './pages/JobDetail';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
};

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
          
          <Route path="/jobs" element={
            <ProtectedRoute>
              <Jobs />
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

          <Route path="/job/:id" element={
            <ProtectedRoute>
              <JobDetail />
            </ProtectedRoute>
          } />

          <Route path="/jobs/matched" element={
            <ProtectedRoute>
              <Jobs onlyMatched={true} />
            </ProtectedRoute>
          } />
        </Routes>
      </main>
      
      <footer className="py-16 bg-white/50 border-t border-slate-200/50 mt-auto">
        <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-col items-center justify-center gap-6">
                <div className="flex items-center gap-2 group cursor-default">
                    <div className="w-10 h-10 premium-gradient rounded-xl flex items-center justify-center text-white shadow-soft group-hover:rotate-3 transition-transform duration-500">
                        <ShieldCheck size={20} />
                    </div>
                    <span className="text-xl font-black text-slate-900 tracking-tighter">CareerGuide<span className="text-primary-600">AI</span></span>
                </div>
                <div className="text-center text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                    © 2026 AI Career Guide • Curating excellence for your future
                </div>
            </div>
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
        <ScrollToTop />
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
