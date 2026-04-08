import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Search, Filter, Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { api } from '../utils/api';
import { useJobStore } from '../store/jobStore';
import SkillGap from '../components/SkillGap';
import ExplanationPanel from '../components/ExplanationPanel';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import JobCard from '../components/JobCard';
import { JobCardSkeleton } from '../components/Skeleton';
import EmptyState from '../components/ui/EmptyState';

const Jobs = () => {
  const { jobs, loading, error, fetchJobs } = useJobStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const isMatchFilter = queryParams.get('filter') === 'matches';

  const [filters, setFilters] = useState({
    location: 'All',
    experience: 'All'
  });

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = (job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.company?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesLocation = filters.location === 'All' || 
                            job.location?.toLowerCase().includes(filters.location.toLowerCase());

    if (isMatchFilter && (job.score || 0) < 70) return false;

    return matchesSearch && matchesLocation;
  });

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await api.post('/jobs/sync');
      toast.success('Analyzing new roles... This may take a moment.');
      setTimeout(() => fetchJobs(), 3000);
    } catch (err) {
      toast.error('Sync failed: ' + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="section-container animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-50 rounded-full text-[10px] font-bold uppercase tracking-widest text-accent-700 mb-4 border border-accent-100">
             <Sparkles size={12} /> {isMatchFilter ? 'AI Prioritized' : 'Explore All'}
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {isMatchFilter ? 'Your AI Matches' : 'Discover Opportunities'}
          </h1>
          <p className="text-slate-500 font-medium mt-2 leading-relaxed">
            {isMatchFilter 
              ? "Roles where your skills and experience align perfectly with market demands."
              : "Discover a wide range of roles tailored to your professional interests."}
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search roles, companies, or keywords..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-accent-500/10 focus:border-accent-500 outline-none transition-smooth shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            variant="ghost" 
            disabled={isSyncing}
            onClick={handleSync}
            className="h-11 px-5 border-slate-200 text-slate-600 bg-white shadow-sm font-bold rounded-xl"
          >
            {isSyncing ? <Loader2 size={18} className="animate-spin mr-2" /> : <RefreshCw size={18} className="mr-2" />}
            Sync
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-4 mb-10 pb-6 border-b border-slate-100">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mr-2">
          <Filter size={14} />
          Filters
        </div>
        
        <select 
          className="bg-slate-50 border-none text-[11px] font-bold rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-accent-500/20 text-slate-600 cursor-pointer"
          value={filters.location}
          onChange={(e) => setFilters({...filters, location: e.target.value})}
        >
          <option value="All">All Locations</option>
          <option value="Remote">Remote Only</option>
          <option value="San Francisco">San Francisco</option>
          <option value="New York">New York</option>
          <option value="London">London</option>
        </select>

        <Button 
          variant="ghost" 
          size="sm" 
          className="text-[11px] font-bold text-slate-400 hover:text-accent-600 ml-auto"
          onClick={() => {
            setSearchTerm('');
            setFilters({ location: 'All', experience: 'All' });
            if (isMatchFilter) navigate('/jobs');
          }}
        >
          Reset All
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[...Array(6)].map((_, i) => <JobCardSkeleton key={i} />)}
            </div>
          ) : filteredJobs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredJobs.map((job) => (
                <JobCard 
                  key={job.id} 
                  job={job} 
                  onSelect={(j) => {
                    setSelectedJob(j);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }} 
                />
              ))}
            </div>
          ) : (
            <EmptyState 
              title="No roles found" 
              description="Try adjusting your filters or search terms to see more results."
              actionText="Clear Search"
              onAction={() => setSearchTerm('')}
            />
          )}
        </div>

        <div className="space-y-8 h-fit lg:sticky lg:top-24">
          {selectedJob ? (
            <div className="animate-fade-in bg-white p-2 rounded-[2.5rem] shadow-premium border border-slate-100">
              <ExplanationPanel 
                jobId={selectedJob.id} 
                jobTitle={selectedJob.title}
              />
              <div className="p-6 pt-0">
                <SkillGap 
                  jobId={selectedJob.id} 
                  jobTitle={selectedJob.title}
                />
                <Button 
                  className="w-full mt-8 bg-accent-600 hover:bg-accent-700 text-white shadow-xl shadow-accent-500/20 h-14 rounded-2xl font-bold transition-smooth"
                  onClick={() => window.open(selectedJob.apply_url, '_blank')}
                >
                  Apply Directly
                </Button>
              </div>
            </div>
          ) : (
            <Card className="flex flex-col items-center justify-center py-20 px-8 text-center bg-white/50 border-dashed border-2 rounded-[2.5rem]">
              <div className="w-16 h-16 bg-slate-100 p-4 rounded-3xl text-slate-300 mb-6 animate-float">
                <Sparkles size={32} />
              </div>
              <h4 className="font-bold text-slate-900 text-lg mb-2 leading-tight">Match Insights</h4>
              <p className="text-sm text-slate-400 font-medium leading-relaxed">
                Select a job card to unlock AI-powered match analysis and skill gap reports.
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default Jobs;
