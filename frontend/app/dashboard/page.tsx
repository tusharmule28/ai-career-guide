'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { useJobStore } from '@/lib/store/jobStore';
import {
  Sparkles,
  Briefcase,
  TrendingUp,
  Zap,
  ChevronRight,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Rocket
} from 'lucide-react';
import Card from '@/components/ui/Card';
import Button, { cn } from '@/components/ui/Button';
import JobCard from '@/components/JobCard';
import { JobCardSkeleton } from '@/components/ui/Skeleton';
import GapAnalysisModal from '@/components/GapAnalysisModal';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const { matchedJobs, loading, fetchMatchedJobs, fetchSavedJobs } = useJobStore();
  const [isGapModalOpen, setIsGapModalOpen] = useState(false);
  const [summary, setSummary] = useState<any>({ 
    match_count: 0, 
    skill_score: 0, 
    application_count: 0, 
    activities: [], 
    recommendations: [] 
  });

  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);

  useEffect(() => {
    fetchMatchedJobs();
    fetchSavedJobs();

    // Load recently viewed from localStorage if on client
    if (typeof window !== 'undefined') {
      const recent = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      setRecentlyViewed(recent.slice(0, 3));
    }

    // Fetch real dashboard summary stats
    api.get('/dashboard/summary').then(data => {
      if (data) setSummary(data);
    }).catch(() => { });
  }, [fetchMatchedJobs, fetchSavedJobs]);

  const stats = [
    { label: 'Strategic Matches', value: summary.match_count || matchedJobs.length, icon: Briefcase, color: 'text-primary-400', bg: 'bg-primary-500/10' },
    { label: 'Synergy Score', value: summary.skill_score > 0 ? `${summary.skill_score}%` : matchedJobs.length > 0 ? `${Math.round(matchedJobs[0].score)}%` : '0%', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Active Missions', value: summary.application_count, icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  const freshMatches = matchedJobs.slice(0, 4);

  return (
    <div className="section-container pb-24">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[3rem] bg-slate-950 px-8 py-12 md:px-14 md:py-20 mb-12 shadow-2xl border border-white/5 isolate"
      >
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="max-w-2xl text-center lg:text-left">
            <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-xl rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-primary-300 mb-8 border border-white/10 shadow-inner"
            >
              <Sparkles size={14} className="animate-pulse" /> Neural Profile Synced
            </motion.div>
            <h1 className="text-4xl md:text-7xl font-black text-white tracking-tighter leading-none mb-6">
              Welcome, <span className="premium-gradient bg-clip-text text-transparent">{user?.name?.split(' ')[0] || 'Member'}</span>
            </h1>
            <p className="text-text-secondary text-lg md:text-xl font-medium leading-relaxed mb-10 max-w-xl">
              Our matching engine has flagged <span className="text-white font-black underline decoration-primary-500/50 underline-offset-8">{matchedJobs.length} high-synergy roles</span> active in your trajectory.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link href="/jobs" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:min-w-[200px] h-16 px-10 font-black rounded-2xl shadow-glow">
                  Execute Matches
                </Button>
              </Link>
              <Link href="/profile" className="w-full sm:w-auto">
                <Button
                  variant="ghost"
                  size="lg"
                  className="w-full h-16 px-8 font-black rounded-2xl text-text hover:bg-white/5 transition-all border border-border/50"
                >
                  Refine Strategy <ChevronRight size={20} className="ml-1" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="hidden lg:block relative group shrink-0">
            <div className="absolute inset-0 bg-primary-500/20 blur-[100px] rounded-full scale-90 group-hover:scale-110 transition-transform duration-1000" />
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: 0.4, type: 'spring' }}
                className="relative bg-surface/40 backdrop-blur-3xl border border-white/10 p-12 rounded-[4rem] shadow-2xl text-center w-80"
            >
              <div className="mb-8 relative">
                <div className="w-32 h-32 rounded-full border-4 border-white/10 flex items-center justify-center mx-auto shadow-2xl bg-background/50">
                  <span className="text-5xl font-black text-white">{user?.is_premium ? '98%' : '84%'}</span>
                </div>
                <div className="absolute -bottom-3 right-1/2 translate-x-1/2 px-5 py-2 bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-glow ring-4 ring-slate-950">
                  {user?.is_premium ? 'Elite Tier' : 'High Potency'}
                </div>
              </div>
              <h3 className="text-white font-black text-2xl mb-3 tracking-tight">Potency Index</h3>
              <p className="text-text-muted text-xs font-bold max-w-[200px] mx-auto leading-relaxed">
                {user?.is_premium ? "Maximum matching protocols enabled." : "Profile is currently competing at 84% effectiveness."}
              </p>
            </motion.div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -right-24 -bottom-24 w-[30rem] h-[30rem] bg-accent-500/10 rounded-full blur-[120px] -z-10" />
        <div className="absolute -left-24 -top-24 w-[30rem] h-[30rem] bg-primary-500/10 rounded-full blur-[120px] -z-10" />
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
        {stats.map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            key={i}
          >
            <Card className="p-8 flex items-center gap-6 border border-border/50 bg-surface/30 hover:bg-surface/50 transition-smooth group h-full">
              <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shrink-0 shadow-lg border border-white/5 transition-transform group-hover:scale-110", stat.bg, stat.color)}>
                  <stat.icon size={28} strokeWidth={2.5} />
              </div>
              <div>
                <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1">{stat.label}</p>
                <p className="text-3xl font-black text-white tracking-tighter">{stat.value}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-16">
          {/* Fresh Matches */}
          <section>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-black text-white tracking-tight">Strategic Matches</h2>
                <p className="text-sm text-text-secondary font-bold mt-1">Refined from the latest market shifts</p>
              </div>
              <Link href="/jobs" className="text-xs font-black text-primary-400 hover:text-primary-300 transition-all uppercase tracking-widest flex items-center gap-2 group">
                All Roles <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[...Array(4)].map((_, i) => <JobCardSkeleton key={i} />)}
              </div>
            ) : freshMatches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {freshMatches.map((item) => (
                  <JobCard key={item.job?.id} job={item} onSelect={(j) => window.location.href = `/jobs/${j.id}`} />
                ))}
              </div>
            ) : (
              <Card className="py-20 border-2 border-dashed border-border flex flex-col items-center justify-center text-center bg-surface/20 rounded-[3rem]">
                <div className="w-20 h-20 bg-surface shadow-2xl text-text-muted rounded-full flex items-center justify-center mb-8 border border-white/5">
                  <Rocket size={40} />
                </div>
                <h3 className="text-xl font-black text-white mb-3">No active matches found</h3>
                <p className="max-w-xs text-text-secondary font-bold text-sm leading-relaxed mb-10">Sync your latest professional experience to re-initialize the matching engine.</p>
                <Button variant="secondary" onClick={() => fetchMatchedJobs()} className="rounded-2xl px-10 h-14 font-black text-xs uppercase tracking-widest">
                  Sync Infrastructure
                </Button>
              </Card>
            )}
          </section>

          {/* Activities / Tips (Alternative layout for dashboard) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-8 bg-surface/30 border-border/50 rounded-[2.5rem]">
               <h3 className="text-lg font-black text-white mb-8 flex items-center gap-3">
                  <Clock size={20} className="text-primary-400" /> Operational Log
               </h3>
               {summary.activities?.length > 0 ? (
                 <div className="space-y-6">
                    {summary.activities.map((activity: any) => (
                      <div key={activity.id} className="flex gap-4 group">
                        <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-emerald-500/20">
                           <CheckCircle2 size={18} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-black text-white leading-tight mb-1">{activity.title}</p>
                          <p className="text-[10px] text-text-muted font-bold uppercase tracking-wider">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                 </div>
               ) : (
                 <p className="text-xs font-bold text-text-muted italic">No recent protocols registered.</p>
               )}
            </Card>

            <Card className="p-8 bg-surface/30 border-border/50 rounded-[2.5rem]">
               <h3 className="text-lg font-black text-white mb-8 flex items-center gap-3">
                  <Sparkles size={20} className="text-accent-400" /> AI Insights
               </h3>
               {summary.recommendations?.length > 0 ? (
                 <div className="space-y-4">
                    {summary.recommendations.map((rec: any, i: number) => (
                      <div key={i} className="p-5 bg-accent-500/5 rounded-2xl border border-accent-500/10 hover:border-accent-500/30 transition-smooth">
                        <p className="text-[10px] font-black text-accent-400 uppercase tracking-[0.2em] mb-2">{rec.category}</p>
                        <p className="text-xs text-text-secondary font-bold leading-relaxed">{rec.text}</p>
                      </div>
                    ))}
                 </div>
               ) : (
                 <p className="text-xs font-bold text-text-muted italic">Neural engine generating tips...</p>
               )}
            </Card>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          <Card className="p-10 border-none bg-gradient-to-br from-primary-600 via-indigo-600 to-primary-900 text-white rounded-[3.5rem] shadow-2xl relative overflow-hidden group isolate">
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner border border-white/20">
                  <Sparkles size={24} className="text-white" />
                </div>
                <span className="text-xs font-black uppercase tracking-[0.2em] text-primary-100">Elite Strategy</span>
              </div>
              <h3 className="text-3xl font-black mb-6 leading-tight tracking-tight">Maximize Your Career ROI</h3>
              <p className="text-primary-100/80 text-sm font-bold mb-12 leading-relaxed">
                Elite members get priority access to ghost-writing AI and direct recruiter referrals.
              </p>
              <Link href="/premium">
                <Button className="w-full bg-white text-primary-950 hover:bg-slate-100 font-black h-16 rounded-[2rem] transition-all shadow-2xl">
                  GO ELITE NOW
                </Button>
              </Link>
            </div>
            {/* Shapes */}
            <div className="absolute -top-32 -right-32 w-64 h-64 bg-white/10 rounded-full blur-[80px] -z-10" />
            <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-black/20 rounded-full blur-[80px] -z-10" />
          </Card>

          <Card className="p-8 bg-surface border-border/50 rounded-[2.5rem] group relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-14 h-14 bg-accent-500/10 text-accent-400 rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-accent-500/20 group-hover:rotate-6 transition-transform">
                <ShieldCheck size={28} />
              </div>
              <h3 className="text-xl font-black text-white mb-4 tracking-tight leading-tight">Career Architecture Gap</h3>
              <p className="text-text-secondary text-sm font-bold mb-8 leading-relaxed italic opacity-80">
                Synchronize your resume with current market potency metrics to discover untapped synergies.
              </p>
              <Button
                variant="accent"
                className="w-full h-14 rounded-2xl font-black text-xs uppercase tracking-widest shadow-glow"
                onClick={() => setIsGapModalOpen(true)}
              >
                Execute Analysis
              </Button>
            </div>
            <div className="absolute -right-24 -bottom-24 w-48 h-48 bg-accent-500/10 rounded-full blur-3xl group-hover:bg-accent-500/20 transition-all duration-1000" />
          </Card>

          {recentlyViewed.length > 0 && (
            <Card className="p-8 bg-surface/50 border-border/50 rounded-[2.5rem]">
              <h3 className="text-lg font-black text-white mb-8 flex items-center gap-3">
                <Clock size={20} className="text-text-muted" /> Trajectory History
              </h3>
              <div className="space-y-8">
                {recentlyViewed.map((job: any) => (
                  <Link
                    href={`/jobs/${job.id}`}
                    key={job.id}
                    className="flex justify-between items-center group"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-white group-hover:text-primary-400 transition-colors truncate tracking-tight">{job.title}</p>
                      <p className="text-[10px] text-text-muted font-bold mt-1 uppercase tracking-widest">{job.company}</p>
                    </div>
                    <ChevronRight size={18} className="text-text-muted group-hover:text-primary-400 group-hover:translate-x-2 transition-all shrink-0 ml-4" />
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      <GapAnalysisModal
        isOpen={isGapModalOpen}
        onClose={() => setIsGapModalOpen(false)}
      />
    </div>
  );
}
