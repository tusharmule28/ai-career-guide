'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { 
  ClipboardList, 
  Clock, 
  CheckCircle2, 
  ExternalLink, 
  Search, 
  Filter,
  ChevronRight,
  AlertCircle,
  MoreVertical,
  Edit2,
  Trash2,
  ArrowUpRight
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button, { cn } from '@/components/ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';

interface Application {
  id: number;
  job_id: number;
  status: string;
  applied_at: string;
  job_title: string;
  company: string;
  apply_url: string;
  notes?: string;
}

export default function HistoryPage() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const data = await api.get('/applications/');
      setApplications(data || []);
    } catch (err: any) {
      toast.error('Failed to load application history');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    try {
      await api.patch(`/applications/${id}?status=${newStatus}`, {});
      setApplications(prev => prev.map(app => app.id === id ? { ...app, status: newStatus } : app));
      toast.success(`Status updated to ${newStatus}`);
    } catch (err: any) {
      toast.error('Failed to update status');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to remove this application from history?')) return;
    try {
      await api.delete(`/applications/${id}`);
      setApplications(prev => prev.filter(app => app.id !== id));
      toast.success('Application removed');
    } catch (err: any) {
      toast.error('Failed to remove application');
    }
  };

  const filteredApps = applications.filter(app => {
    const matchesSearch = app.job_title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          app.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'All' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'APPLIED': return 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20';
      case 'OFFERED': return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
      case 'REJECTED': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'INTERVIEW': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default: return 'text-text-secondary bg-surface border-border/50';
    }
  };

  return (
    <div className="section-container pb-24">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-8">
        <div>
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-6 border border-indigo-500/20 shadow-sm"
          >
             <ClipboardList size={12} className="fill-current" /> Active Trajectory
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none mb-4">
            Mission <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Archive</span>
          </h1>
          <p className="text-text-secondary text-lg font-medium leading-relaxed max-w-xl">
            Track and manage your professional deployments and status transitions across all neural matchings.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:min-w-[300px] group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-indigo-400 transition-colors" size={18} />
            <input 
              type="text"
              placeholder="Search companies..."
              className="w-full pl-12 pr-5 py-4 bg-surface/50 border border-border/50 rounded-2xl text-sm font-bold placeholder:text-text-muted focus:ring-4 focus:ring-indigo-400/10 focus:border-indigo-400 outline-none transition-all shadow-soft"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select 
            className="w-full sm:w-auto bg-background border border-border/50 text-[10px] font-black uppercase tracking-widest rounded-xl px-5 py-4 outline-none focus:ring-4 focus:ring-indigo-400/10 text-text-secondary cursor-pointer hover:border-indigo-400 shadow-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="All">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="APPLIED">Applied</option>
            <option value="INTERVIEW">Interview</option>
            <option value="OFFERED">Offered</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      <div className="space-y-6">
        {loading ? (
          [...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-surface/30 rounded-[2rem] border border-border/50 animate-pulse" />
          ))
        ) : filteredApps.length > 0 ? (
          <AnimatePresence>
            {filteredApps.map((app, index) => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-8 border-border/50 hover:bg-surface/50 transition-all duration-300 group rounded-[2.5rem] relative overflow-hidden">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-indigo-400 border border-white/5 shadow-inner">
                        <ArrowUpRight size={28} />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-white tracking-tight mb-2 group-hover:text-indigo-400 transition-colors">
                          {app.job_title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4">
                          <span className="text-xs font-bold text-text-muted uppercase tracking-widest">{app.company}</span>
                          <div className="flex items-center gap-2 text-text-muted">
                            <Clock size={14} />
                            <span className="text-[10px] font-bold uppercase tracking-widest">
                              {new Date(app.applied_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className={cn(
                        "px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.2em] border shadow-sm transition-all",
                        getStatusColor(app.status)
                      )}>
                        {app.status}
                      </div>

                      <div className="flex items-center gap-2">
                        <a href={app.apply_url} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl">
                            <ExternalLink size={16} />
                          </Button>
                        </a>
                        <div className="relative group/menu">
                          <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl">
                            <MoreVertical size={16} />
                          </Button>
                          <div className="absolute right-0 top-full mt-2 w-48 bg-slate-950 border border-border/50 rounded-2xl shadow-2xl invisible group-hover/menu:visible opacity-0 group-hover/menu:opacity-100 transition-all z-20 overflow-hidden">
                            <div className="p-2 space-y-1">
                              {['APPLIED', 'INTERVIEW', 'OFFERED', 'REJECTED'].map((s) => (
                                <button
                                  key={s}
                                  onClick={() => handleUpdateStatus(app.id, s)}
                                  className="w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                                >
                                  Mark as {s}
                                </button>
                              ))}
                              <div className="h-px bg-border/50 my-1" />
                              <button
                                onClick={() => handleDelete(app.id)}
                                className="w-full text-left px-4 py-2 text-[10px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                              >
                                Delete Entry
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="absolute -right-24 -bottom-24 w-48 h-48 bg-indigo-500/5 rounded-full blur-[80px] -z-10" />
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        ) : (
          <Card className="py-24 flex flex-col items-center justify-center text-center bg-surface/20 border-dashed border-2 border-border/50 rounded-[3rem]">
            <div className="w-24 h-24 bg-surface text-text-muted rounded-full flex items-center justify-center mb-8 border border-white/5 shadow-2xl transform hover:scale-110 transition-transform">
              <ClipboardList size={48} className="opacity-20" />
            </div>
            <h3 className="text-2xl font-black text-white mb-4 tracking-tight">No deployments registered</h3>
            <p className="max-w-sm text-text-secondary font-bold text-sm leading-relaxed mb-10">
              You haven't initiated any application protocols yet. Synced matches will appear here once applied.
            </p>
            <Button onClick={() => window.location.href = '/jobs'} variant="primary" className="rounded-2xl px-12 h-16 font-black uppercase tracking-widest shadow-glow">
              Explore Market
            </Button>
          </Card>
        )}
      </div>
    </div>
  );
}
