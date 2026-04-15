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
  const { jobs, matchedJobs, savedJobs, loading, fetchJobs, fetchMatchedJobs, fetchSavedJobs } = useJobStore();
  const [activeTab, setActiveTab] = useState<TabType>('recommended');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  
  const [filters, setFilters] = useState({
    location: 'All',
    experience: 'All',
    jobType: 'All'
  });

  useEffect(() => {
    const init = async () => {
      await Promise.all([
        fetchMatchedJobs({ top_n: 20 }),
        fetchJobs(),
        fetchSavedJobs()
      ]);
    };
    init();
  }, [fetchJobs, fetchMatchedJobs, fetchSavedJobs]);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await api.post('/jobs/sync');
      toast.success('Analyzing new roles... This may take a moment.');
      setTimeout(() => {
        fetchJobs();
        fetchMatchedJobs({ top_n: 20 });
      }, 3000);
    } catch (err: any) {
      toast.error('Sync failed: ' + err.message);
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

  return (
    <div className="section-container pb-24">
      {/* Header Area */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-8">
        <div className="max-w-2xl">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1 bg-primary-500/10 rounded-full text-[10px] font-black uppercase tracking-[0.2em] text-primary-400 mb-6 border border-primary-500/20 shadow-sm"
          >
             <Zap size={12} className="fill-current" /> Operational Dashboard
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none mb-4">
            Trajectory <span className="premium-gradient bg-clip-text text-transparent">Control</span>
          </h1>
          <p className="text-text-secondary text-lg font-medium leading-relaxed max-w-xl">
            Filter through multi-dimensional job markets and execute strategic applications with AI synergy.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:min-w-[350px] group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-text-muted group-focus-within:text-primary-400 transition-colors" size={20} />
            <input 
              type="text"
              placeholder="Search across sectors..."
              className="w-full pl-14 pr-5 py-5 bg-surface/50 border border-border/50 rounded-2xl text-sm font-bold placeholder:text-text-muted focus:ring-4 focus:ring-primary-400/10 focus:border-primary-400 outline-none transition-all shadow-soft"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            variant="secondary" 
            disabled={isSyncing}
            onClick={handleSync}
            className="w-full sm:w-auto h-16 px-8 font-black rounded-2xl shadow-soft group"
          >
            {isSyncing ? <Loader2 size={20} className="animate-spin mr-2" /> : <RefreshCw size={20} className="mr-2 group-hover:rotate-180 transition-transform duration-700" />}
            Resync
          </Button>
        </div>
      </div>

      {/* Tabs System */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 p-2 bg-surface/30 rounded-3xl border border-border/50 backdrop-blur-sm sticky top-24 z-30">
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
                    className="absolute inset-0 bg-surface border border-white/10 rounded-xl shadow-lg shadow-black/20"
                />
              )}
              <tab.icon size={16} className={cn("relative z-10 transition-colors", activeTab === tab.id ? "text-primary-400" : "")} />
              <span className="relative z-10">{tab.label}</span>
              {tab.count > 0 && (
                  <span className={cn(
                      "relative z-10 ml-1 px-1.5 py-0.5 rounded-md text-[10px] font-black border",
                      activeTab === tab.id ? "bg-primary-500/20 border-primary-500/30 text-primary-400" : "bg-surface/50 border-border/50 text-text-muted"
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
             className="bg-background border border-border/50 text-[10px] font-black uppercase tracking-widest rounded-xl px-4 py-3 outline-none focus:ring-4 focus:ring-primary-400/10 text-text-secondary cursor-pointer hover:border-primary-400 shadow-sm min-w-[140px]"
             value={filters.location}
             onChange={(e) => setFilters({...filters, location: e.target.value})}
           >
             <option value="All">All Locations</option>
             <option value="Remote">Remote Only</option>
             <option value="United States">United States</option>
             <option value="Europe">Europe</option>
             <option value="India">India</option>
           </select>

           <Button 
                variant="ghost" 
                size="sm" 
                className="text-[10px] font-black text-text-muted hover:text-rose-500 uppercase tracking-widest px-3"
                onClick={() => {
                  setSearchTerm('');
                  setFilters({ location: 'All', experience: 'All', jobType: 'All' });
                }}
            >
                Reset
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
                        description="Synchronize your latest resume to discover untapped professional synergies."
                        actionText="Initialize Sync"
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
                        title="Global Sector Empty" 
                        description="No roles matching your protocols were found in the current feed."
                        actionText="Clear Logic"
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
                        description="Bookmark potential mission targets to review them in this strategic command layer."
                        actionText="Browse Markets"
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
