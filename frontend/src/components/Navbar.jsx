import React, { useState, useEffect } from 'react';
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
  CheckCircle2,
  Bell,
  Clock
} from 'lucide-react';
import Button from './ui/Button';
import { api } from '../utils/api';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();

  useEffect(() => {
    if (user) {
      fetchNotifications();
      // Poll for new notifications every 2 minutes
      const interval = setInterval(fetchNotifications, 120000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const data = await api.get('/notifications');
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.is_read).length);
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

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
                  CareerGuide<span className="text-accent-600"> AI</span>
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1.5 pt-0.5 border-t border-slate-100">AI Job Matcher</span>
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
                  {/* Notification Bell */}
                  <div className="relative">
                    <button 
                      onClick={() => setIsNotifOpen(!isNotifOpen)}
                      className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-smooth relative"
                    >
                      <Bell size={20} />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse border-2 border-white">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>

                    {/* Notification Dropdown */}
                    {isNotifOpen && (
                      <div className="absolute right-0 mt-3 w-80 glass border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                          <h4 className="font-bold text-slate-800 flex items-center gap-2">
                            Notifications
                            {unreadCount > 0 && <span className="bg-primary text-white text-[10px] px-2 py-0.5 rounded-full">{unreadCount} New</span>}
                          </h4>
                          {unreadCount > 0 && (
                            <button onClick={markAllRead} className="text-xs font-bold text-accent-600 hover:text-accent-700">Mark all read</button>
                          )}
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                          {notifications.length > 0 ? (
                            notifications.map(n => (
                              <div 
                                key={n.id} 
                                className={`p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer group relative ${!n.is_read ? 'bg-accent-50/30' : ''}`}
                                onClick={() => {
                                  markAsRead(n.id);
                                  if (n.link) window.location.href = n.link;
                                }}
                              >
                                {!n.is_read && <div className="absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-accent-600 rounded-full"></div>}
                                <p className="text-xs font-bold text-slate-900 pr-4">{n.title}</p>
                                <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{n.message}</p>
                                <div className="flex items-center gap-1.5 mt-2 text-[9px] font-medium text-slate-400">
                                  <Clock size={10} />
                                  {new Date(n.created_at).toLocaleDateString()}
                                </div>
                              </div>
                            ))
                          ) : (
                            <div className="p-8 text-center">
                              <Bell size={32} className="mx-auto text-slate-200 mb-2" />
                              <p className="text-xs text-slate-400 font-medium">All caught up!</p>
                            </div>
                          )}
                        </div>
                        <Link to="/notifications" onClick={() => setIsNotifOpen(false)} className="block p-3 text-center text-xs font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                          View all notifications
                        </Link>
                      </div>
                    )}
                  </div>

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
              className="p-2 rounded-md text-slate-400 hover:text-slate-500 hover:bg-slate-100"
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
