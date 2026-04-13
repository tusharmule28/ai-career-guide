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

const Jobs = ({ onlyMatched = false }) => {
  const { jobs, matchedJobs, loading, fetchJobs, fetchMatchedJobs } = useJobStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const [filters, setFilters] = useState({
    location: 'All',
    experience: 'All',
    jobType: 'All'
  });

  useEffect(() => {
    const initJobs = async () => {
      if (onlyMatched) {
        await fetchMatchedJobs({ top_n: 20 });
      } else {
        await Promise.all([
          fetchMatchedJobs({ top_n: 6 }),
          fetchJobs()
        ]);
      }
    };
    initJobs();
  }, [fetchJobs, fetchMatchedJobs, onlyMatched]);

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

  const filteredMatches = applyFilters(matchedJobs);
  
  // Exclude jobs that are already in matchedJobs to avoid duplicates
  const matchedIds = new Set(matchedJobs.map(m => m.job_id || m.id));
  const otherJobs = jobs.filter(j => !matchedIds.has(j.id));
  const filteredOther = applyFilters(otherJobs);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await api.post('/jobs/sync');
      toast.success('Analyzing new roles... This may take a moment.');
      setTimeout(() => {
        if (onlyMatched) {
          fetchMatchedJobs({ top_n: 20 });
        } else {
          fetchJobs();
          fetchMatchedJobs({ top_n: 6 });
        }
      }, 3000);
    } catch (err) {
      toast.error('Sync failed: ' + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleViewDetails = (job) => {
    const id = job.id || job.job_id;
    navigate(`/job/${id}`);
  };


  return (
    <div className="section-container animate-fade-in">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-8 md:mb-12 gap-6 text-center lg:text-left">
        <div className="max-w-2xl mx-auto lg:mx-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 rounded-full text-[10px] font-black uppercase tracking-widest text-primary-700 mb-6 border border-primary-100/50 shadow-sm">
             <Sparkles size={12} /> Curated for You
          </div>
          <h1 className="text-3xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
            {onlyMatched ? 'Curated Opportunities' : 'Global Market'}
          </h1>
          <p className="text-slate-500 text-base md:text-lg font-medium leading-relaxed">
            {onlyMatched 
              ? 'Our AI has selected these roles specifically for your career trajectory.' 
              : 'Discover the latest remote opportunities across the globe.'}
          </p>
        </div>

        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full lg:w-auto">
          <div className="relative w-full sm:min-w-[400px] group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary-500 transition-colors" size={20} />
            <input 
              type="text"
              placeholder="Search roles, companies or skills..."
              className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-medium focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 outline-none transition-all shadow-soft group-hover:border-slate-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            variant="secondary" 
            disabled={isSyncing}
            onClick={handleSync}
            className="w-full sm:w-auto h-14 px-8 font-black rounded-2xl whitespace-nowrap shadow-soft group"
          >
            {isSyncing ? <Loader2 size={20} className="animate-spin mr-2" /> : <RefreshCw size={20} className="mr-2 group-hover:rotate-180 transition-transform duration-700" />}
            Refresh
          </Button>
        </div>

      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-12 p-2 bg-slate-100/50 rounded-2xl border border-slate-200/50">
        <div className="flex flex-wrap items-center gap-2">
          <div className="px-4 py-2 flex items-center gap-2 text-[11px] font-black text-slate-500 uppercase tracking-widest bg-white rounded-xl shadow-soft border border-slate-100">
            <Filter size={14} className="text-primary-500" />
            Filters
          </div>
          
          <select 
            className="bg-white border border-slate-200 text-xs font-bold rounded-xl px-4 py-2 outline-none focus:ring-4 focus:ring-primary-500/10 text-slate-600 cursor-pointer transition-all hover:border-primary-400 shadow-soft"
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
            className="bg-white border border-slate-200 text-xs font-bold rounded-xl px-4 py-2 outline-none focus:ring-4 focus:ring-primary-500/10 text-slate-600 cursor-pointer transition-all hover:border-primary-400 shadow-soft"
            value={filters.experience}
            onChange={(e) => setFilters({...filters, experience: e.target.value})}
          >
            <option value="All">Experience</option>
            <option value="Entry">Entry Level</option>
            <option value="Mid">Mid-Level</option>
            <option value="Senior">Senior Level</option>
            <option value="Lead">Lead/Director</option>
          </select>

          <select 
            className="bg-white border border-slate-200 text-xs font-bold rounded-xl px-4 py-2 outline-none focus:ring-4 focus:ring-primary-500/10 text-slate-600 cursor-pointer transition-all hover:border-primary-400 shadow-soft"
            value={filters.jobType}
            onChange={(e) => setFilters({...filters, jobType: e.target.value})}
          >
            <option value="All">Type</option>
            <option value="Full-time">Full-time</option>
            <option value="Contract">Contract</option>
            <option value="Part-time">Part-time</option>
            <option value="Internship">Internship</option>
          </select>
        </div>

        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs font-black text-slate-400 hover:text-primary-600"
          onClick={() => {
            setSearchTerm('');
            setFilters({ location: 'All', experience: 'All', jobType: 'All' });
          }}
        >
          Reset Filters
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
            {filteredMatches.length > 0 ? (
              <section className="animate-slide-up">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-12 h-12 bg-primary-100 text-primary-600 rounded-2xl flex items-center justify-center shadow-soft">
                    <Sparkles size={24} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                      {onlyMatched ? 'Recommended Roles' : 'Perfect Matches'}
                    </h2>
                    <p className="text-sm font-medium text-slate-500">Curated based on your expertise and preferences.</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredMatches.map((job) => (
                    <JobCard 
                      key={`match-${job.job_id || job.id}`} 
                      job={job} 
                      onSelect={(j) => handleViewDetails(j)} 
                      highlight={true}
                    />
                  ))}
                </div>
              </section>
            ) : onlyMatched && (
               <EmptyState 
                  title="No matched roles found" 
                  description="Try uploading a fresh resume or updating your profile skills to get better results."
                  actionText="Update Profile"
                  onAction={() => navigate('/profile')}
               />
            )}

            {/* General Jobs Section */}
            {!onlyMatched && (
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
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Jobs;
