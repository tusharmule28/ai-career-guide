import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { Search, Filter, Sparkles, Loader2, RefreshCw } from 'lucide-react';
import { api } from '../utils/api';
import { useJobStore } from '../store/jobStore';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import JobCard from '../components/JobCard';
import { JobCardSkeleton } from '../components/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import JobDetailModal from '../components/JobDetailModal';

const Jobs = () => {
  const { jobs, matchedJobs, loading, error, fetchJobs, fetchMatchedJobs } = useJobStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const isMatchFilter = queryParams.get('filter') === 'matches';
  const jobIdFromQuery = queryParams.get('id');

  const [filters, setFilters] = useState({
    location: 'All',
    experience: 'All',
    jobType: 'All'
  });

  useEffect(() => {
    const initJobs = async () => {
      if (isMatchFilter) {
        await fetchMatchedJobs({ top_n: 20 });
      } else {
        await fetchJobs();
      }
    };
    initJobs();
  }, [fetchJobs, fetchMatchedJobs, isMatchFilter]);

  // Handle auto-open for specific job ID from query params
  useEffect(() => {
    if (jobIdFromQuery && jobs.length > 0) {
      const job = jobs.find(j => String(j.id) === String(jobIdFromQuery));
      if (job) {
        setSelectedJob(job);
        setIsModalOpen(true);
      }
    }
  }, [jobIdFromQuery, jobs]);

  const dataSource = isMatchFilter ? matchedJobs : jobs;

  const filteredJobs = dataSource.filter(job => {
    const matchesSearch = (job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          job.company?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Use stored location/experience/type from filters state
    const matchesLocation = filters.location === 'All' || 
                            job.location?.toLowerCase().includes(filters.location.toLowerCase());

    const matchesExperience = filters.experience === 'All' || 
                              job.experience_level?.toLowerCase() === filters.experience.toLowerCase();

    const matchesJobType = filters.jobType === 'All' || 
                           job.work_type?.toLowerCase() === filters.jobType.toLowerCase();

    return matchesSearch && matchesLocation && matchesExperience && matchesJobType;
  }).sort((a, b) => {
    // For matches, high score first, then newest
    if (isMatchFilter) {
      if ((b.score || 0) !== (a.score || 0)) return (b.score || 0) - (a.score || 0);
      return (b.id || 0) - (a.id || 0);
    }
    // For general jobs, newest first
    return (b.id || 0) - (a.id || 0);
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

  const handleViewDetails = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
    // Optional: update URL with job ID without full navigation reload
    const newParams = new URLSearchParams(location.search);
    newParams.set('id', job.id);
    navigate({ search: newParams.toString() }, { replace: true });
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    const newParams = new URLSearchParams(location.search);
    newParams.delete('id');
    navigate({ search: newParams.toString() }, { replace: true });
  };

  return (
    <div className="section-container animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-50 rounded-full text-[10px] font-bold uppercase tracking-widest text-accent-700 mb-4 border border-accent-100">
             <Sparkles size={12} /> {isMatchFilter ? 'AI Prioritized' : 'Explore All'}
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {isMatchFilter ? 'AI Curated Roles' : 'Discover Opportunities'}
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
          className="bg-slate-50 border-none text-[11px] font-bold rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-accent-500/20 text-slate-600 cursor-pointer transition-all hover:bg-slate-100"
          value={filters.location}
          onChange={(e) => setFilters({...filters, location: e.target.value})}
        >
          <option value="All">All Locations</option>
          <option value="Remote">Remote Only</option>
          <option value="India">India</option>
          <option value="San Francisco">San Francisco</option>
          <option value="New York">New York</option>
          <option value="London">London</option>
        </select>

        <select 
          className="bg-slate-50 border-none text-[11px] font-bold rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-accent-500/20 text-slate-600 cursor-pointer transition-all hover:bg-slate-100"
          value={filters.experience}
          onChange={(e) => setFilters({...filters, experience: e.target.value})}
        >
          <option value="All">Experience Level</option>
          <option value="Entry">Entry Level</option>
          <option value="Mid">Mid-Level</option>
          <option value="Senior">Senior Level</option>
          <option value="Lead">Lead/Director</option>
        </select>

        <select 
          className="bg-slate-50 border-none text-[11px] font-bold rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-accent-500/20 text-slate-600 cursor-pointer transition-all hover:bg-slate-100"
          value={filters.jobType}
          onChange={(e) => setFilters({...filters, jobType: e.target.value})}
        >
          <option value="All">Job Type</option>
          <option value="Full-time">Full-time</option>
          <option value="Contract">Contract</option>
          <option value="Part-time">Part-time</option>
          <option value="Internship">Internship</option>
        </select>

        <Button 
          variant="ghost" 
          size="sm" 
          className="text-[11px] font-bold text-slate-400 hover:text-accent-600 ml-auto"
          onClick={() => {
            setSearchTerm('');
            setFilters({ location: 'All', experience: 'All', jobType: 'All' });
            if (isMatchFilter) navigate('/jobs');
          }}
        >
          Reset All
        </Button>
      </div>

      <div>
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <JobCardSkeleton key={i} />)}
          </div>
        ) : filteredJobs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map((job) => (
              <JobCard 
                key={job.id} 
                job={job} 
                onSelect={(j) => handleViewDetails(j)} 
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

      <JobDetailModal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        job={selectedJob} 
      />
    </div>
  );
};

export default Jobs;
