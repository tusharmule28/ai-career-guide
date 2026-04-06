import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  LogOut, 
  Menu, 
  X, 
  User as UserIcon,
  Sparkles,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import Button from './ui/Button';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Job Matches', href: '/jobs', icon: Briefcase },
    { name: 'Application Hub', href: '/applications', icon: CheckCircle2 },
    { name: 'Profile Settings', href: '/profile', icon: UserIcon },
    { name: 'Resume Analysis', href: '/resume-upload', icon: FileText },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 w-full glass border-b border-slate-200/50 shadow-sm backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="premium-gradient p-2.5 rounded-2xl text-white group-hover:rotate-6 transition-smooth shadow-lg shadow-accent-500/20">
                <ShieldCheck size={26} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-extrabold tracking-tight text-slate-900 leading-none">
                  Yogya<span className="text-accent-600">Setu</span>
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1.5 pt-0.5 border-t border-slate-100">Future-Proof Careers</span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1.5">
            {user && navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold transition-smooth
                  ${isActive(item.href) 
                    ? 'bg-accent-50 text-accent-700 shadow-sm border border-accent-100/50' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 border border-transparent hover:border-slate-100'}
                `}
              >
                <item.icon size={18} strokeWidth={2} />
                {item.name}
              </Link>
            ))}

            <div className="ml-6 pl-6 border-l border-slate-200 flex items-center gap-5">
              {user ? (
                <div className="flex items-center gap-5">
                  <div className="flex items-center gap-2.5 text-sm font-bold text-slate-700 group cursor-pointer">
                    <div className="w-10 h-10 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center text-accent-600 group-hover:bg-accent-50 group-hover:text-accent-700 transition-smooth">
                      <UserIcon size={20} />
                    </div>
                    <div className="flex flex-col">
                      <span className="hidden lg:inline text-xs text-slate-400 font-medium">Welcome back</span>
                      <span className="hidden lg:inline">{user.name || user.email.split('@')[0]}</span>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={logout}
                    className="w-10 h-10 p-0 text-slate-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100 border border-transparent"
                  >
                    <LogOut size={20} />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link to="/login">
                    <Button variant="ghost" size="sm" className="font-bold text-slate-600">Log In</Button>
                  </Link>
                  <Link to="/signup">
                    <Button variant="accent" size="sm" className="font-bold shadow-md shadow-accent-500/10">Get Started</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden glass border-b border-gray-100 animate-in slide-in-from-top duration-300">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {user && navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium
                  ${isActive(item.href) 
                    ? 'bg-primary/5 text-primary' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}
                `}
              >
                <item.icon size={20} />
                {item.name}
              </Link>
            ))}
            {!user && (
              <div className="grid grid-cols-2 gap-2 p-2">
                <Link to="/login" onClick={() => setIsOpen(false)}>
                  <Button variant="secondary" className="w-full">Log In</Button>
                </Link>
                <Link to="/signup" onClick={() => setIsOpen(false)}>
                  <Button className="w-full">Get Started</Button>
                </Link>
              </div>
            )}
            {user && (
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-3 px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut size={20} />
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
