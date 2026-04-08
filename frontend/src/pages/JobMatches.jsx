import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Sparkles, Search } from 'lucide-react';
import { useJobStore } from '../store/jobStore';
import JobCard from '../components/JobCard';
import { JobCardSkeleton } from '../components/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import JobDetailModal from '../components/JobDetailModal';
import JobFilterBar from '../components/JobFilterBar';

const JobMatches = () => {
  const { matchedJobs, loading, error, fetchMatchedJobs } = useJobStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
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
    fetchMatchedJobs({ top_n: 20 });
  }, [fetchMatchedJobs]);

  useEffect(() => {
    if (jobIdFromQuery && matchedJobs.length > 0) {
      const job = matchedJobs.find(j => String(j.id) === String(jobIdFromQuery));
      if (job) {
        setSelectedJob(job);
        setIsModalOpen(true);
      }
    }
  }, [jobIdFromQuery, matchedJobs]);

  const filteredJobs = matchedJobs.filter(job => {
    const searchLower = searchTerm.toLowerCase().trim();
    const matchesSearch = !searchLower || 
                          (job.title?.toLowerCase().includes(searchLower) ||
                          job.company?.toLowerCase().includes(searchLower));
    
    const matchesLocation = filters.location === 'All' || 
                            job.location?.toLowerCase().includes(filters.location.toLowerCase());

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
  }).sort((a, b) => {
    if ((b.score || 0) !== (a.score || 0)) return (b.score || 0) - (a.score || 0);
    return (b.id || 0) - (a.id || 0);
  });

  const handleViewDetails = (job) => {
    setSelectedJob(job);
    setIsModalOpen(true);
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
             <Sparkles size={12} /> AI Prioritized
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            AI Curated Roles
          </h1>
          <p className="text-slate-500 font-medium mt-2 leading-relaxed">
            Roles where your skills and experience align perfectly with market demands.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[280px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text"
              placeholder="Search matches..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-4 focus:ring-accent-500/10 focus:border-accent-500 outline-none transition-smooth shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <JobFilterBar 
        filters={filters} 
        setFilters={setFilters} 
        onReset={() => {
          setSearchTerm('');
          setFilters({ location: 'All', experience: 'All', jobType: 'All' });
        }} 
      />

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
                highlight={true}
              />
            ))}
          </div>
        ) : (
          <EmptyState 
            title="No matches found" 
            description="Ensure your resume is updated to get personalized matches."
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

export default JobMatches;
