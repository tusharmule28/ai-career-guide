import React from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const Layout = ({ children }) => {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center">
            <div className="h-10 w-10 bg-primary/20 rounded-full animate-bounce mb-4 flex items-center justify-center">
                <div className="h-4 w-4 bg-primary rounded-full"></div>
            </div>
          <p className="text-gray-400 font-bold text-sm uppercase tracking-widest">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <footer className="py-12 border-t border-gray-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs font-bold text-gray-400 uppercase tracking-widest">
          © 2026 AI Career Guide • Intelligent Recruitment
        </div>
      </footer>
    </div>
  );
};

export default Layout;
