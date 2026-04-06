import React, { useEffect, useState } from 'react';
import { Bell, Clock, CheckCircle2, Trash2, ExternalLink, ShieldCheck, Mail, Sparkles, Sidebar } from 'lucide-react';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import { api } from '../utils/api';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const data = await api.get('/notifications');
      setNotifications(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-50 rounded-full text-accent-700 text-[10px] font-bold uppercase tracking-widest mb-4">
             <Sparkles size={14} />
             Smart Alert System
          </div>
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-4">
            <Bell className="text-primary" size={36} />
            Notifications
          </h1>
          <p className="text-slate-500 mt-3 text-lg">
            Stay updated with the latest AI-matched jobs and career insights.
          </p>
        </div>
        
        {notifications.some(n => !n.is_read) && (
          <Button variant="outline" size="sm" onClick={markAllRead} className="font-bold border-slate-200">
             Mark all as read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-24 skeleton-pulse rounded-2xl"></div>
          ))}
        </div>
      ) : notifications.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-24 text-center glass-card border-dashed border-2">
          <div className="bg-slate-50 p-6 rounded-full text-slate-200 mb-6 group-hover:scale-110 transition-smooth">
            <Bell size={64} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Your inbox is empty</h2>
          <p className="text-slate-500 max-w-sm mb-10">
            When our AI finds a high-quality job match for your resume, we'll notify you here.
          </p>
          <Button onClick={() => window.location.href = '/jobs'} className="px-8 h-12 rounded-xl">Find Jobs Now</Button>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((n) => (
            <div 
              key={n.id} 
              className={`group relative glass-card p-6 border transition-smooth hover:shadow-md cursor-pointer ${!n.is_read ? 'border-accent-200 bg-accent-50/20' : 'border-slate-100'}`}
              onClick={() => markAsRead(n.id)}
            >
              <div className="flex gap-5">
                <div className={`mt-1 w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${n.type === 'match' ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-400'}`}>
                   {n.type === 'match' ? <ShieldCheck size={24} /> : <Mail size={24} />}
                </div>
                
                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-slate-900 text-lg leading-tight group-hover:text-primary transition-colors">
                      {n.title}
                    </h3>
                    {!n.is_read && (
                      <span className="shrink-0 w-2.5 h-2.5 bg-accent-600 rounded-full animate-pulse shadow-[0_0_8px_rgba(99,102,241,0.6)]"></span>
                    )}
                  </div>
                  <p className="text-slate-600 text-sm mb-4 leading-relaxed">{n.message}</p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest">
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} />
                        {new Date(n.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    {n.link && (
                      <a 
                        href={n.link} 
                        className="flex items-center gap-2 px-4 py-2 bg-white text-primary text-xs font-bold rounded-lg border border-primary/20 hover:bg-primary hover:text-white transition-smooth shadow-sm"
                      >
                        View Details <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Promotion banner */}
      <div className="mt-16 bg-gradient-to-br from-slate-900 to-indigo-900 rounded-[2.5rem] p-12 text-white relative overflow-hidden shadow-2xl">
         <div className="relative z-10 max-w-lg">
            <h2 className="text-3xl font-extrabold mb-4 leading-tight">Want to get these alerts on your phone?</h2>
            <p className="text-indigo-100 text-lg mb-8 opacity-80">
              We're building mobile notifications and email alerts to help you land your dream role even faster.
            </p>
            <Button variant="accent" className="h-14 px-8 font-bold text-lg rounded-2xl shadow-xl shadow-accent-500/30">
               Coming Soon
            </Button>
         </div>
         <div className="absolute right-0 bottom-0 opacity-10 -mr-16 -mb-16 transform rotate-12">
            <Bell size={300} />
         </div>
      </div>
    </div>
  );
};

export default NotificationsPage;
