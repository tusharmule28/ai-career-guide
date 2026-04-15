'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { Search, Filter, Sparkles, Loader2, RefreshCw, Bookmark, LayoutGrid, Zap } from 'lucide-react';
import { api } from '@/lib/api';
import { useJobStore } from '@/lib/store/jobStore';
import { useAuth } from '@/lib/auth-context';
import Button, { cn } from '@/components/ui/Button';
import JobCard from '@/components/JobCard';
import { JobCardSkeleton } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import { motion, AnimatePresence } from 'framer-motion';

type TabType = 'recommended' | 'all' | 'saved';

export default function JobsPage() {
  const { user } = useAuth();
  const { jobs, matchedJobs, savedJobs, loading, error, fetchJobs, fetchMatchedJobs, fetchSavedJobs } = useJobStore();
  const [activeTab, setActiveTab] = useState<TabType>('recommended');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [filters, setFilters] = useState({
    location: 'All',
    experience: 'All',
    jobType: 'All'
  });

  const loadAllData = React.useCallback(async () => {
    try {
      await Promise.all([
        fetchMatchedJobs({ top_n: 20 }),
        fetchJobs(),
        fetchSavedJobs()
      ]);
    } catch (err: any) {
      console.error("[Jobs] Initial load failed:", err);
      toast.error("Telemetry failed. Some data might be missing.");
    }
  }, [fetchJobs, fetchMatchedJobs, fetchSavedJobs]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await api.post('/jobs/sync');
      toast.success('Analyzing new sectors... Match engine re-initializing.');
      setTimeout(() => {
        loadAllData();
      }, 3000);
    } catch (err: any) {
      toast.error('Sync failed: ' + (err.message || 'Server unreachable'));
    } finally {
      setIsSyncing(false);
    }
  };

  const applyFilters = (jobList: any[]) => {
    return jobList.filter(item => {
      const job = item.job || item;
      const searchLower = searchTerm.toLowerCase().trim();
      const matchesSearch = !searchLower || 
                            (job.title?.toLowerCase().includes(searchLower) ||
                            job.company?.toLowerCase().includes(searchLower) ||
                            job.required_skills?.toString().toLowerCase().includes(searchLower));
      
      const matchesLocation = filters.location === 'All' || 
                               job.location?.toLowerCase().includes(filters.location.toLowerCase());

      return matchesSearch && matchesLocation;
    });
  };

  const filteredRecommended = useMemo(() => applyFilters(matchedJobs), [matchedJobs, searchTerm, filters]);
  
  const otherJobs = useMemo(() => {
    const matchedIds = new Set(matchedJobs.map(m => m.job?.id));
    return jobs.filter(j => !matchedIds.has(j.id));
  }, [jobs, matchedJobs]);
  
  const filteredAll = useMemo(() => applyFilters(otherJobs), [otherJobs, searchTerm, filters]);
  const filteredSaved = useMemo(() => applyFilters(savedJobs), [savedJobs, searchTerm, filters]);

  const tabs = [
    { id: 'recommended', label: 'AI Strategy', icon: Sparkles, count: matchedJobs.length },
    { id: 'all', label: 'Global Feed', icon: LayoutGrid, count: otherJobs.length },
    { id: 'saved', label: 'Bookmarks', icon: Bookmark, count: savedJobs.length }
  ];

  if (error && matchedJobs.length === 0 && jobs.length === 0 && !loading) {
    return (
      <div className="section-container min-h-[60vh] flex flex-col items-center justify-center">
        <EmptyState 
            icon={Zap}
            title="System Integity Compromised" 
            description={error.includes('unreachable') ? "Connection to the matching engine was lost." : error}
            actionText="Try Re-connect"
            onAction={() => loadAllData()}
        />
      </div>
    );
  }

  return (
    <div className="section-container pb-24">
      {/* Header Area */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-8">
        <div className="max-w-2xl">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-6 border border-indigo-500/20 shadow-sm"
          >
             <Zap size={12} className="fill-current" /> Operational Command
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none mb-4">
            Trajectory <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Control</span>
          </h1>
          <p className="text-text-secondary text-lg font-medium leading-relaxed max-w-xl">
            Execute strategic searches across multi-dimensional markets with precision AI synergy.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:min-w-[400px] group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-indigo-400 transition-colors" size={20} />
            <input 
              type="text"
              placeholder="Search by role, company, or protocol..."
              className="w-full pl-14 pr-5 py-5 bg-surface/50 border border-border/50 rounded-2xl text-sm font-bold placeholder:text-text-muted focus:ring-4 focus:ring-indigo-400/10 focus:border-indigo-400 outline-none transition-all shadow-soft"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            variant="dark" 
            loading={isSyncing}
            onClick={handleSync}
            className="w-full sm:w-auto h-16 px-8 font-black rounded-2xl shadow-soft group bg-slate-900 border border-white/5 hover:bg-slate-800"
          >
            {!isSyncing && <RefreshCw size={20} className="mr-2 group-hover:rotate-180 transition-transform duration-700" />}
            Sync Intel
          </Button>
        </div>
      </div>

      {/* Tabs System */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 p-2 bg-surface/30 rounded-3xl border border-border/50 backdrop-blur-sm sticky top-24 z-30 shadow-xl">
        <div className="flex p-1 bg-background/50 rounded-2xl border border-white/5 shadow-inner grow md:grow-0">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as TabType)}
              className={cn(
                "flex items-center gap-2.5 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all duration-300 relative grow md:grow-0",
                activeTab === tab.id ? "text-white" : "text-text-muted hover:text-text-secondary"
              )}
            >
              {activeTab === tab.id && (
                <motion.div 
                    layoutId="activeTab"
                    className="absolute inset-0 bg-surface border border-white/10 rounded-xl shadow-lg"
                />
              )}
              <tab.icon size={16} className={cn("relative z-10 transition-colors", activeTab === tab.id ? "text-indigo-400" : "")} />
              <span className="relative z-10">{tab.label}</span>
              {tab.count > 0 && (
                  <span className={cn(
                      "relative z-10 ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-black border",
                      activeTab === tab.id ? "bg-indigo-500/20 border-indigo-500/30 text-indigo-400" : "bg-surface/50 border-border/50 text-text-muted"
                  )}>
                      {tab.count}
                  </span>
              )}
            </button>
          ))}
        </div>

        {/* Inline Filters */}
        <div className="flex items-center gap-3 overflow-x-auto pb-2 md:pb-0 custom-scrollbar">
           <div className="w-px h-8 bg-border/50 mx-2 hidden md:block" />
           <select 
             className="bg-background border border-border/50 text-[10px] font-black uppercase tracking-widest rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-indigo-400/10 text-text-secondary cursor-pointer hover:border-indigo-400 shadow-sm min-w-[150px]"
             value={filters.location}
             onChange={(e) => setFilters({...filters, location: e.target.value})}
           >
             <option value="All">All Regions</option>
             <option value="Remote">Remote Protocol</option>
             <option value="United States">USA Sector</option>
             <option value="Europe">European Hub</option>
             <option value="India">India Hub</option>
           </select>

           <Button 
                variant="ghost" 
                size="sm" 
                className="text-[10px] font-black text-rose-400/60 hover:text-rose-400 uppercase tracking-widest px-3 ml-2"
                onClick={() => {
                  setSearchTerm('');
                  setFilters({ location: 'All', experience: 'All', jobType: 'All' });
                }}
            >
                Reset Engine
            </Button>
        </div>
      </div>

      {/* Grid Content */}
      <div className="min-h-[400px]">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <JobCardSkeleton key={i} />)}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {activeTab === 'recommended' && (
                filteredRecommended.length > 0 ? (
                  filteredRecommended.map((job) => (
                    <JobCard key={job.job?.id} job={job} onSelect={(j) => window.location.href = `/jobs/${j.id}`} highlight />
                  ))
                ) : (
                  <div className="col-span-full">
                    <EmptyState 
                        icon={Sparkles}
                        title="Neural Engine Idle" 
                        description="Synchronize your professional telemetry to discover untapped career synergies."
                        actionText="Initialize Baseline"
                        onAction={handleSync}
                    />
                  </div>
                )
              )}

              {activeTab === 'all' && (
                filteredAll.length > 0 ? (
                  filteredAll.map((job) => (
                    <JobCard key={job.id} job={job} onSelect={(j) => window.location.href = `/jobs/${j.id}`} />
                  ))
                ) : (
                  <div className="col-span-full">
                    <EmptyState 
                        title="Sector Data Missing" 
                        description="No roles matching your criteria were scanned in the current market sweep."
                        actionText="De-activate Filters"
                        onAction={() => setSearchTerm('')}
                    />
                  </div>
                )
              )}

              {activeTab === 'saved' && (
                filteredSaved.length > 0 ? (
                  filteredSaved.map((job) => (
                    <JobCard key={job.id} job={job} onSelect={(j) => window.location.href = `/jobs/${j.id}`} />
                  ))
                ) : (
                  <div className="col-span-full">
                    <EmptyState 
                        icon={Bookmark}
                        title="Archive Empty" 
                        description="Bookmark potential mission targets to track them in this strategic command layer."
                        actionText="Scan Market"
                        onAction={() => setActiveTab('all')}
                    />
                  </div>
                )
              )}
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
