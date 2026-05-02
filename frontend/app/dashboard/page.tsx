'use client';

import React, { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
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
import { JobCardSkeleton, StatCardSkeleton } from '@/components/ui/Skeleton';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import Link from 'next/link';
import MatchPotencyMeter from '@/components/ui/MatchPotencyMeter';

// Dynamic imports for heavy components
const GapAnalysisModal = dynamic(() => import('@/components/GapAnalysisModal'), { ssr: false });
const AutoApplyAgent   = dynamic(() => import('@/components/AutoApplyAgent'),   { ssr: false });
const SkillGapInsights = dynamic(() => import('@/components/SkillGapInsights'), { ssr: false });
const OnboardingTour   = dynamic(() => import('@/components/OnboardingTour'),   { ssr: false });
const ResumeUpload      = dynamic(() => import('@/components/ResumeUpload'),      { ssr: false });

export default function DashboardPage() {
  const { user } = useAuth();
  const { matchedJobs, loading, fetchMatchedJobs, fetchSavedJobs } = useJobStore();
  const [isGapModalOpen, setIsGapModalOpen] = useState(false);
  const [summary, setSummary] = useState<any>({ 
    match_count: 0, 
    skill_score: 0, 
    application_count: 0, 
    activities: [], 
    recommendations: [],
    has_resume: false,
    resume_name: ''
  });
  const [summaryLoading, setSummaryLoading] = useState(true);
  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [recentlyViewed, setRecentlyViewed] = useState<any[]>([]);

  const loadData = React.useCallback(async () => {
    setSummaryLoading(true);
    setSummaryError(null);
    
    try {
      await Promise.all([
        fetchMatchedJobs(),
        fetchSavedJobs(),
        api.get('/dashboard/summary').then(data => {
          if (data) {
            setSummary({
              ...data,
              has_resume: !!data.has_resume,
              resume_name: data.resume_name || '',
            });
          }
        })
      ]);
    } catch (err: any) {
      console.error("[Dashboard] Error loading data:", err);
      setSummaryError(err.message || "Failed to load dashboard summary");
    } finally {
      setSummaryLoading(false);
    }
  }, [fetchMatchedJobs, fetchSavedJobs]);

  useEffect(() => {
    loadData();

    // Load recently viewed from localStorage if on client
    if (typeof window !== 'undefined') {
      const recent = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
      setRecentlyViewed(recent.slice(0, 3));
    }
  }, [loadData]);

  const stats = [
    { label: 'Strategic Matches', value: summary.match_count || matchedJobs.length, icon: Briefcase, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { label: 'Synergy Score', value: summary.skill_score > 0 ? `${summary.skill_score}%` : (matchedJobs.length > 0 ? `${Math.round(matchedJobs[0].score)}%` : '0%'), icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    { label: 'Active Missions', value: summary.application_count, icon: Zap, color: 'text-amber-400', bg: 'bg-amber-500/10' },
  ];

  const freshMatches = matchedJobs.slice(0, 3);

  if (summaryError && !loading) {
     return (
       <div className="section-container min-h-[60vh] flex flex-col items-center justify-center">
         <Card className="p-12 text-center max-w-md bg-surface/40 border-danger/20">
           <div className="w-16 h-16 bg-danger/10 text-danger rounded-full flex items-center justify-center mx-auto mb-6">
             <Zap size={32} />
           </div>
           <h2 className="text-2xl font-black text-white mb-4">Command Center Offline</h2>
           <p className="text-text-secondary font-medium mb-8">
             {summaryError.includes('unreachable') 
               ? "Synchronicity lost. The neural backend is currently unreachable. Please check your connection."
               : "An error occurred while fetching your trajectory data."}
           </p>
           <Button onClick={() => loadData()} variant="primary" className="w-full h-14 rounded-xl">
             Re-initialize Uplink
           </Button>
         </Card>
       </div>
     );
  }

  return (
    <div className="section-container safe-bottom">
      <OnboardingTour />
      
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-[2.5rem] bg-slate-950 px-8 py-12 md:px-14 md:py-20 mb-12 shadow-2xl border border-white/5 isolate"
      >
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="max-w-2xl text-center lg:text-left">
            <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-3 py-1 bg-primary-500/10 backdrop-blur-xl rounded-full text-[10px] font-bold uppercase tracking-wider text-primary-400 mb-6 border border-primary-500/20"
            >
              <Sparkles size={14} className="animate-pulse" /> Profile Active
            </motion.div>
            <h1 className="text-3xl md:text-6xl font-bold text-white tracking-tight leading-tight mb-4">
              Welcome, <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">{user?.name?.split(' ')[0] || 'Member'}</span>
            </h1>
            <p className="text-text-secondary text-base md:text-lg leading-relaxed mb-8 max-w-xl">
              Our matching engine has found <span className="text-white font-semibold underline decoration-primary-500/30 underline-offset-4">{matchedJobs.length} matches</span> tailored to your profile.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
              <Link href="/jobs" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:min-w-[200px] h-16 px-10 font-extrabold rounded-2xl shadow-glow-indigo bg-indigo-600 hover:bg-indigo-500 transition-all">
                  View Recommendations
                </Button>
              </Link>
              <Link href="/profile" className="w-full sm:w-auto">
                <Button
                  id="profile-settings-nav"
                  variant="ghost"
                  size="lg"
                  className="w-full h-16 px-8 font-extrabold rounded-2xl text-text hover:bg-white/5 transition-all border border-border/50"
                >
                  Refine Strategy <ChevronRight size={20} className="ml-1" />
                </Button>
              </Link>
            </div>
          </div>

          <div className="hidden lg:block relative group shrink-0">
            <div className="absolute inset-0 bg-indigo-500/20 blur-[100px] rounded-full scale-90 group-hover:scale-110 transition-transform duration-1000" />
            <motion.div 
                initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ delay: 0.4, type: 'spring' }}
                className="relative bg-surface/40 backdrop-blur-3xl border border-white/10 p-12 rounded-[3.5rem] shadow-2xl text-center w-80"
            >
              <div className="mb-10 relative flex justify-center mt-4">
                <MatchPotencyMeter score={matchedJobs.length > 0 ? (summary.skill_score || 84) : 0} size={140} strokeWidth={10} />
              </div>
              <h3 className="text-white font-bold text-xl mb-2 tracking-tight">Match Potency</h3>
              <p className="text-text-muted text-xs leading-relaxed">
                {matchedJobs.length > 0 && user?.is_premium ? "AI matching engine fully optimized." : "Upload more data to improve accuracy."}
              </p>
            </motion.div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute -right-24 -bottom-24 w-[30rem] h-[30rem] bg-indigo-500/10 rounded-full blur-[120px] -z-10" />
        <div className="absolute -left-24 -top-24 w-[30rem] h-[30rem] bg-violet-500/10 rounded-full blur-[120px] -z-10" />
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-10 sm:mb-20">
        {summaryLoading
          ? [...Array(3)].map((_, i) => <StatCardSkeleton key={i} />)
          : stats.map((stat, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i }}
            key={i}
            className="h-full"
          >
            <Card className="p-6 flex items-center gap-4 border border-border/50 bg-surface/30 hover:bg-surface/50 transition-all duration-300 group h-full rounded-2xl shadow-sm">
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-white/5 transition-transform group-hover:scale-105", stat.bg, stat.color)}>
                  <stat.icon size={20} strokeWidth={2} />
              </div>
              <div>
                <p className="text-[10px] font-bold text-text-muted uppercase tracking-wider mb-0.5">{stat.label}</p>
                <p className="text-xl md:text-2xl font-bold text-white tracking-tight">
                  {stat.value}
                </p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-16">
          
          {/* Dedicated Resume Section */}
          <section id="resume-upload-section">
            <div className="flex items-center justify-between mb-6">
               <h2 className="text-2xl font-bold text-white tracking-tight">Resume Analysis</h2>
               {summary.has_resume && (
                 <div className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">
                   Resume Synced
                 </div>
               )}
            </div>
            <ResumeUpload 
              onUploadSuccess={() => loadData()} 
              hasExistingResume={summary.has_resume}
              existingResumeName={summary.resume_name}
            />
          </section>

          {/* Fresh Matches */}
          <section id="job-matches-section">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-white tracking-tight">Recommended Jobs</h2>
                <p className="text-sm text-text-secondary mt-1">AI-curated roles for your profile</p>
              </div>
              <Link href="/jobs" className="text-xs font-bold text-primary-400 hover:text-primary-300 transition-all uppercase tracking-wider flex items-center gap-1 group">
                View All <ChevronRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => <JobCardSkeleton key={i} />)}
              </div>
            ) : freshMatches.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {freshMatches.map((item) => (
                  <JobCard key={item.job?.id} job={item} onSelect={(j) => window.location.href = `/jobs/${j.id}`} />
                ))}
              </div>
            ) : (
              <Card className="py-20 border border-border flex flex-col items-center justify-center text-center bg-surface/20 rounded-[2.5rem] shadow-inner">
                <div className="w-20 h-20 bg-surface shadow-2xl text-text-muted rounded-full flex items-center justify-center mb-8 border border-white/5">
                  <Rocket size={40} />
                </div>
                <h3 className="text-xl font-black text-white mb-3 tracking-tight">No active matching protocols</h3>
                <p className="max-w-xs text-text-secondary font-bold text-sm leading-relaxed mb-10">Upload your latest professional footprint to unlock premium AI matching and strategic trajectory analysis.</p>
                <Link href="/profile" className="w-full sm:w-auto flex justify-center">
                  <Button variant="accent" className="rounded-2xl px-12 h-16 font-black text-xs uppercase tracking-widest shadow-glow">
                    Upload Resume <ChevronRight size={16} className="ml-2" />
                  </Button>
                </Link>
              </Card>
            )}
          </section>

          {/* Activities / Tips */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-6 bg-surface/30 border-border/50 rounded-3xl">
               <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3 tracking-tight">
                  <Clock size={18} className="text-primary-400" /> Activity Log
               </h3>
               {summaryLoading ? (
                 <div className="space-y-6">
                    {[1,2,3].map(i => <div key={i} className="h-10 bg-white/5 rounded-xl animate-pulse" />)}
                 </div>
               ) : summary.activities?.length > 0 ? (
                 <div className="space-y-6">
                    {summary.activities.map((activity: any) => (
                      <div key={activity.id} className="flex gap-4 group">
                        <div className="w-10 h-10 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center shrink-0 shadow-sm border border-emerald-500/20">
                           <CheckCircle2 size={18} />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-white leading-tight mb-1">{activity.title}</p>
                          <p className="text-[10px] text-text-muted font-medium uppercase tracking-wider">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                 </div>
               ) : (
                 <p className="text-xs font-bold text-text-muted italic">No recent protocols registered.</p>
               )}
            </Card>

            <Card className="p-6 bg-surface/30 border-border/50 rounded-3xl">
               <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-3 tracking-tight">
                  <Sparkles size={18} className="text-accent-400" /> AI Recommendations
               </h3>
               {summaryLoading ? (
                 <div className="space-y-4">
                    {[1,2].map(i => <div key={i} className="h-16 bg-white/5 rounded-2xl animate-pulse" />)}
                 </div>
               ) : summary.recommendations?.length > 0 ? (
                 <div className="space-y-4">
                     {summary.recommendations.map((rec: any, i: number) => (
                      <div key={i} className="p-4 bg-primary-500/5 rounded-xl border border-primary-500/10 hover:border-primary-500/20 transition-all duration-300">
                        <p className="text-[10px] font-bold text-primary-400 uppercase tracking-wider mb-1.5">{rec.category}</p>
                        <p className="text-xs text-text-secondary leading-relaxed">{rec.text}</p>
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
        <div className="space-y-6">
          <AutoApplyAgent />

          {/* Skill Gap Insights */}
          <section id="skill-gap-section">
            <SkillGapInsights />
          </section>

          <Card className="p-6 bg-surface border-border/50 rounded-3xl group relative overflow-hidden">
            <div className="relative z-10">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-400 rounded-xl flex items-center justify-center mb-6 shadow-sm border border-emerald-500/20 group-hover:rotate-3 transition-transform">
                <ShieldCheck size={24} />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 tracking-tight leading-tight">Skill Gap Analysis</h3>
              <p className="text-text-secondary text-sm mb-6 leading-relaxed">
                Compare your profile with market requirements to find areas for growth.
              </p>
              <Button
                variant="dark"
                className="w-full h-14 rounded-xl font-black text-xs uppercase tracking-widest shadow-soft hover:bg-slate-800"
                onClick={() => setIsGapModalOpen(true)}
              >
                Execute Analysis
              </Button>
            </div>
            <div className="absolute -right-24 -bottom-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/20 transition-all duration-1000" />
          </Card>

          {recentlyViewed.length > 0 && (
            <Card className="p-8 bg-surface/50 border-border/50 rounded-[2.5rem]">
              <h3 className="text-lg font-black text-white mb-8 flex items-center gap-3 tracking-tight">
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
                      <p className="text-sm font-black text-white group-hover:text-indigo-400 transition-colors truncate tracking-tight">{job.title}</p>
                      <p className="text-[10px] text-text-muted font-bold mt-1 uppercase tracking-widest">{job.company}</p>
                    </div>
                    <ChevronRight size={18} className="text-text-muted group-hover:text-indigo-400 group-hover:translate-x-2 transition-all shrink-0 ml-4" />
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
