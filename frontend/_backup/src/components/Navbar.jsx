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
    { name: 'Matches', href: '/jobs/matched', icon: Sparkles },
  ];

  const isActive = (path) => (location.pathname + location.search) === path;
  const userName = user?.name || user?.email?.split('@')[0] || 'User';

  return (
    <nav className="sticky top-0 z-50 w-full bg-background/70 backdrop-blur-xl border-b border-border/50 shadow-soft">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-18 py-3 items-center">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="premium-gradient p-2 rounded-xl text-white group-hover:rotate-3 transition-all duration-500 shadow-soft hover:shadow-glow">
                <ShieldCheck size={22} strokeWidth={2.5} />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-black tracking-tight text-text leading-none">
                  CareerGuide<span className="text-primary-400">AI</span>
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
                    ? 'bg-primary/20 text-primary-300 shadow-sm' 
                    : 'text-text-secondary hover:bg-surface hover:text-text'}
                `}
              >
                <item.icon size={16} strokeWidth={2} />
                {item.name}
              </Link>
            ))}

            <div className="ml-4 pl-4 border-l border-border/50 flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  {/* Notifications */}
                  <div className="relative">
                    <button 
                      onClick={() => setIsNotifOpen(!isNotifOpen)}
                      className="w-10 h-10 rounded-xl bg-surface border border-border/50 flex items-center justify-center text-text-secondary hover:bg-slate-800 hover:text-text transition-all duration-300 relative group/notif"
                    >
                      <Bell size={18} className="group-hover/notif:rotate-12 transition-transform" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">
                          {unreadCount > 9 ? '9+' : unreadCount}
                        </span>
                      )}
                    </button>

                    {isNotifOpen && (
                      <div className="absolute right-0 mt-3 w-80 glass border border-border rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-in">
                        <div className="p-4 border-b border-border flex justify-between items-center bg-surface/50">
                          <h4 className="font-bold text-text text-sm">Notifications</h4>
                          {unreadCount > 0 && (
                            <button onClick={markAllRead} className="text-[10px] font-bold text-primary-400 hover:text-primary-300">Mark all read</button>
                          )}
                        </div>
                        <div className="max-h-80 overflow-y-auto">
                          {notifications.length > 0 ? (
                            notifications.map(n => (
                              <div 
                                key={n.id} 
                                className={`p-3 border-b border-border/50 hover:bg-surface transition-colors cursor-pointer relative ${!n.is_read ? 'bg-primary/10' : ''}`}
                                onClick={() => {
                                  markAsRead(n.id);
                                  if (n.link) window.location.href = n.link;
                                }}
                              >
                                <p className="text-xs font-bold text-text">{n.title}</p>
                                <p className="text-[10px] text-text-secondary mt-0.5 line-clamp-2">{n.message}</p>
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

                  <Link to="/profile" className="flex items-center gap-3 group">
                    <div className="w-9 h-9 rounded-full bg-surface border-2 border-border shadow-sm flex items-center justify-center text-primary-400 group-hover:bg-primary/20 transition-smooth relative">
                      <UserIcon size={18} />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-text transition-colors group-hover:text-primary-300 flex items-center gap-1.5 leading-none">
                        {userName}
                        {user?.is_premium && <span className="text-[8px] text-primary-400 font-black">PRO</span>}
                      </span>
                    </div>
                  </Link>

                  <button 
                    onClick={logout}
                    className="w-9 h-9 border border-transparent hover:bg-red-50 hover:text-red-600 rounded-xl flex items-center justify-center text-slate-400 transition-smooth"
                  >
                    <LogOut size={16} />
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

          {/* Mobile UI (Cleaned Up as requested) */}
          <div className="md:hidden flex items-center gap-3">
            {user && (
              <Link to="/profile" className="w-9 h-9 rounded-full bg-surface border-2 border-border flex items-center justify-center text-primary-400 shadow-sm">
                <UserIcon size={18} />
              </Link>
            )}
            
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-10 h-10 flex items-center justify-center rounded-xl bg-surface text-text border border-border"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="md:hidden glass border-b border-border animate-slide-up">
          <div className="px-4 pt-2 pb-6 space-y-1">
            {user && navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold
                  ${isActive(item.href) 
                    ? 'bg-primary/20 text-primary-300' 
                    : 'text-text-secondary hover:bg-surface'}
                `}
              >
                <item.icon size={18} />
                {item.name}
              </Link>
            ))}

            {user && (
              <>
                <div className="h-px bg-border my-4 mx-4" />
                <button
                  onClick={() => { logout(); setIsOpen(false); }}
                  className="flex w-full items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50"
                >
                  <LogOut size={18} />
                  Sign Out
                </button>
              </>
            )}
            
            {!user && (
               <div className="flex flex-col gap-2 p-2">
                 <Link to="/login" onClick={() => setIsOpen(false)}>
                   <Button variant="ghost" className="w-full font-bold">Log In</Button>
                 </Link>
                 <Link to="/signup" onClick={() => setIsOpen(false)}>
                   <Button className="w-full font-bold">Get Started</Button>
                 </Link>
               </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
