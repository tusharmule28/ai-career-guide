import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Home,
  Briefcase, 
  Sparkles,
  LogOut, 
  Menu, 
  X, 
  User as UserIcon,
  ShieldCheck,
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
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'Jobs', href: '/jobs', icon: Briefcase },
    { name: 'Matches', href: '/jobs?filter=matches', icon: Sparkles },
  ];

  const isActive = (path) => (location.pathname + location.search) === path;
  const userName = user?.name || user?.email?.split('@')[0] || 'User';

  return (
    <nav className="sticky top-0 z-50 w-full glass border-b border-slate-200/50 shadow-sm backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-18">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="premium-gradient p-2 rounded-xl text-white group-hover:rotate-6 transition-smooth shadow-lg shadow-accent-500/20">
                <ShieldCheck size={22} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold tracking-tight text-slate-900 leading-none">
                  CareerGuide<span className="text-accent-600">AI</span>
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {user && navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`
                  flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all duration-200
                  ${isActive(item.href) 
                    ? 'bg-accent-50 text-accent-700' 
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
                `}
              >
                <item.icon size={16} strokeWidth={2} />
                {item.name}
              </Link>
            ))}

            <div className="ml-4 pl-4 border-l border-slate-100 flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  {/* Notifications */}
                  <div className="relative">
                    <button 
                      onClick={() => setIsNotifOpen(!isNotifOpen)}
                      className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-smooth relative"
                    >
                      <Bell size={18} />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>

                    {isNotifOpen && (
                      <div className="absolute right-0 mt-3 w-80 glass border border-slate-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-in">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                          <h4 className="font-bold text-slate-800 text-sm">Notifications</h4>
                          {unreadCount > 0 && (
                            <button onClick={markAllRead} className="text-[10px] font-bold text-accent-600 hover:text-accent-700">Mark all read</button>
                          )}
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                          {notifications.length > 0 ? (
                            notifications.map(n => (
                              <div 
                                key={n.id} 
                                className={`p-3 border-b border-slate-50 hover:bg-slate-50 transition-colors cursor-pointer relative ${!n.is_read ? 'bg-accent-50/30' : ''}`}
                                onClick={() => {
                                  markAsRead(n.id);
                                  if (n.link) window.location.href = n.link;
                                }}
                              >
                                <p className="text-xs font-bold text-slate-900">{n.title}</p>
                                <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-2">{n.message}</p>
                              </div>
                            ))
                          ) : (
                            <div className="p-8 text-center">
                              <Bell size={24} className="mx-auto text-slate-200 mb-2" />
                              <p className="text-[10px] text-slate-400 font-medium">All caught up!</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Profile Link */}
                  <Link to="/profile" className="flex items-center gap-2.5 group">
                    <div className="w-9 h-9 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center text-accent-600 group-hover:bg-accent-50 transition-smooth">
                      <UserIcon size={18} />
                    </div>
                    <span className="text-sm font-bold text-slate-700 transition-colors group-hover:text-accent-700">Hi, {userName}</span>
                  </Link>

                  <button 
                    onClick={logout}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-smooth border border-transparent hover:border-red-100"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Link to="/login">
                    <Button variant="ghost" size="sm" className="font-bold text-slate-600 text-xs">Log In</Button>
                  </Link>
                  <Link to="/signup">
                    <Button size="sm" className="font-bold text-xs shadow-sm">Get Started</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-xl text-slate-400 hover:bg-slate-100"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden glass border-b border-gray-100 animate-slide-up">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {user && navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold
                  ${isActive(item.href) 
                    ? 'bg-accent-50 text-accent-700' 
                    : 'text-slate-600 hover:bg-gray-50'}
                `}
              >
                <item.icon size={18} />
                {item.name}
              </Link>
            ))}
            {user && (
              <button
                onClick={() => {
                  logout();
                  setIsOpen(false);
                }}
                className="flex w-full items-center gap-3 px-3 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50"
              >
                <LogOut size={18} />
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
