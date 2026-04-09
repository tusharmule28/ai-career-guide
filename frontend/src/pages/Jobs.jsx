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
  const { jobs, matchedJobs, loading, fetchJobs, fetchMatchedJobs } = useJobStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const jobIdFromQuery = queryParams.get('id');

  const [filters, setFilters] = useState({
    location: 'All',
    experience: 'All',
    jobType: 'All'
  });

  useEffect(() => {
    const initJobs = async () => {
      // Fetch both in parallel
      await Promise.all([
        fetchMatchedJobs({ top_n: 6 }), // Top 6 recommended
        fetchJobs()
      ]);
    };
    initJobs();
  }, [fetchJobs, fetchMatchedJobs]);

  // Handle auto-open for specific job ID from query params
  useEffect(() => {
    if (jobIdFromQuery) {
      const allAvailable = [...jobs, ...matchedJobs.map(m => ({ ...m, id: m.job_id }))];
      const job = allAvailable.find(j => String(j.id || j.job_id) === String(jobIdFromQuery));
      if (job) {
        setSelectedJob(job);
        setIsModalOpen(true);
      }
    }
  }, [jobIdFromQuery, jobs, matchedJobs]);

  const applyFilters = (jobList, isMatch = false) => {
    return jobList.filter(job => {
      const searchLower = searchTerm.toLowerCase().trim();
      const matchesSearch = !searchLower || 
                            (job.title?.toLowerCase().includes(searchLower) ||
                            job.company?.toLowerCase().includes(searchLower));
      
      const matchesLocation = filters.location === 'All' || 
                              job.location?.toLowerCase().includes(filters.location.toLowerCase());

      // Determine derived experience
      let derivedExp = job.experience_level;
      if (!derivedExp) {
         const titleLower = (job.title || '').toLowerCase();
         if (titleLower.includes('lead') || titleLower.includes('manager') || titleLower.includes('director') || job.experience_min >= 8) derivedExp = 'Lead';
         else if (titleLower.includes('senior') || titleLower.includes('sr') || titleLower.includes('staff') || job.experience_min >= 4) derivedExp = 'Senior';
         else if (titleLower.includes('mid') || (job.experience_min >= 2 && job.experience_min < 4)) derivedExp = 'Mid';
         else derivedExp = 'Entry';
      }

      const matchesExperience = filters.experience === 'All' || 
                                derivedExp.toLowerCase() === filters.experience.toLowerCase();

      // Determine derived job type
      let derivedWorkType = job.work_type;
      if (!derivedWorkType) {
         const titleLower = (job.title || '').toLowerCase();
         const descLower = (job.description || '').toLowerCase();
         if (titleLower.includes('intern') || descLower.includes('internship')) derivedWorkType = 'Internship';
         else if (titleLower.includes('contract') || titleLower.includes('freelance')) derivedWorkType = 'Contract';
         else if (titleLower.includes('part-time') || titleLower.includes('part time')) derivedWorkType = 'Part-time';
         else derivedWorkType = 'Full-time';
      }

      const matchesJobType = filters.jobType === 'All' || 
                             derivedWorkType.toLowerCase() === filters.jobType.toLowerCase();

      return matchesSearch && matchesLocation && matchesExperience && matchesJobType;
    });
  };

  const filteredMatches = applyFilters(matchedJobs, true);
  
  // Exclude jobs that are already in matchedJobs to avoid duplicates
  const matchedIds = new Set(matchedJobs.map(m => m.job_id));
  const otherJobs = jobs.filter(j => !matchedIds.has(j.id));
  const filteredOther = applyFilters(otherJobs);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await api.post('/jobs/sync');
      toast.success('Analyzing new roles... This may take a moment.');
      setTimeout(() => {
        fetchJobs();
        fetchMatchedJobs({ top_n: 6 });
      }, 3000);
    } catch (err) {
      toast.error('Sync failed: ' + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleViewDetails = (job) => {
    // Standardize job object for modal (ensure id is job_id if from matches)
    const standardizedJob = job.job_id ? { ...job, id: job.job_id } : job;
    setSelectedJob(standardizedJob);
    setIsModalOpen(true);
    
    const newParams = new URLSearchParams(location.search);
    newParams.set('id', standardizedJob.id);
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
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-12 gap-6">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-accent-50 rounded-full text-[10px] font-bold uppercase tracking-widest text-accent-700 mb-4 border border-accent-100">
             <Sparkles size={12} /> Personalized Opportunities
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Job Market Explorer
          </h1>
          <p className="text-slate-500 font-medium mt-2 leading-relaxed">
            AI-curated matches followed by the latest global remote opportunities.
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
          <option value="United States">United States</option>
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
          }}
        >
          Reset All
        </Button>
      </div>

      {/* Main Content */}
      <div className="space-y-16">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => <JobCardSkeleton key={i} />)}
          </div>
        ) : (
          <>
            {/* Recommended Section */}
            {filteredMatches.length > 0 && (
              <section className="animate-slide-up">
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2 bg-accent-100 text-accent-600 rounded-lg">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">AI Recommended for You</h2>
                    <p className="text-sm text-slate-500">Highest matching score based on your profile.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredMatches.map((job) => (
                    <JobCard 
                      key={`match-${job.job_id}`} 
                      job={job} 
                      onSelect={(j) => handleViewDetails(j)} 
                      highlight={true}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* General Jobs Section */}
            <section className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
              <div className="flex items-center gap-3 mb-8">
                <div className="p-2 bg-slate-100 text-slate-600 rounded-lg">
                  <Filter size={20} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">All Latest Roles</h2>
                  <p className="text-sm text-slate-500">Explore global remote opportunities.</p>
                </div>
              </div>
              
              {filteredOther.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredOther.map((job) => (
                    <JobCard 
                      key={`job-${job.id}`} 
                      job={job} 
                      onSelect={(j) => handleViewDetails(j)} 
                    />
                  ))}
                </div>
              ) : filteredMatches.length === 0 && (
                <EmptyState 
                  title="No roles found" 
                  description="Try adjusting your filters or search terms to see more results."
                  actionText="Clear Search"
                  onAction={() => setSearchTerm('')}
                />
              )}
            </section>
          </>
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
