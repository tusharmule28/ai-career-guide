import React, { useEffect, useState } from 'react';
import { Search, Filter, SlidersHorizontal, Sparkles, Loader2, AlertCircle, MapPin, Briefcase, Bookmark, CheckCircle, ExternalLink, RefreshCw } from 'lucide-react';
import { api } from '../utils/api';
import useJobStore from '../store/jobStore';
import SkillGap from '../components/SkillGap';
import ExplanationPanel from '../components/ExplanationPanel';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Jobs = () => {
  const { jobs, loading, error, fetchJobs, saveJob, savedJobs } = useJobStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
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
                            
    const matchesExperience = filters.experience === 'All' || 
                              (job.experience_min <= parseInt(filters.experience.split('-')[1] || 100) && 
                               job.experience_max >= parseInt(filters.experience.split('-')[0] || 0));

    return matchesSearch && matchesLocation && matchesExperience;
  });

  const isSaved = (jobId) => savedJobs.some(s => s.id === jobId);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await api.post('/jobs/sync');
      alert('Job synchronization started in the background. Please wait a few seconds and refresh.');
      setTimeout(() => fetchJobs(), 5000);
    } catch (err) {
      alert('Failed to start sync: ' + err.message);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight flex items-center gap-3">
            <Sparkles className="text-primary" size={28} />
            AI Matched Roles
          </h1>
          <p className="text-gray-500 mt-1">
            Discover roles tailored specifically to your unique skill set and experience.
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text"
              placeholder="Search roles or companies..."
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none transition-smooth w-full md:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            disabled={isSyncing}
            onClick={handleSync}
            className="flex border-primary/20 text-primary"
          >
            {isSyncing ? <Loader2 size={18} className="animate-spin mr-2" /> : <RefreshCw size={18} className="mr-2" />}
            Sync Jobs
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center gap-4 mb-8 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
          <Filter size={16} className="text-primary" />
          Quick Filters:
        </div>
        
        <select 
          className="bg-gray-50 border-none text-xs font-bold rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20"
          value={filters.location}
          onChange={(e) => setFilters({...filters, location: e.target.value})}
        >
          <option value="All">All Locations</option>
          <option value="Remote">Remote</option>
          <option value="India">India</option>
          <option value="Bangalore">Bangalore</option>
          <option value="Mumbai">Mumbai</option>
        </select>

        <select 
          className="bg-gray-50 border-none text-xs font-bold rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-primary/20"
          value={filters.experience}
          onChange={(e) => setFilters({...filters, experience: e.target.value})}
        >
          <option value="All">All Experience</option>
          <option value="0-2">0-2 years</option>
          <option value="2-5">2-5 years</option>
          <option value="5-10">5-10 years</option>
        </select>

        <Button 
          variant="ghost" 
          size="sm" 
          className="ml-auto text-gray-400 hover:text-primary"
          onClick={() => {
            setSearchTerm('');
            setFilters({ location: 'All', experience: 'All' });
          }}
        >
          Reset Filters
        </Button>
      </div>

      {loading && jobs.length === 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => (
             <div key={i} className="h-64 skeleton-pulse rounded-3xl"></div>
          ))}
        </div>
      ) : error ? (
        <Card className="flex flex-col items-center justify-center py-12 text-red-500 bg-red-50/50 border-red-100">
          <AlertCircle size={48} className="mb-4" />
          <p className="font-bold text-lg mb-2">Oops! Something went wrong.</p>
          <p className="text-sm mb-6">{error}</p>
          <Button variant="secondary" onClick={fetchJobs}>Try Again</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredJobs.length > 0 ? (
                filteredJobs.map((job, index) => (
                  <Card key={job.id} 
                    className={`group hover:shadow-premium transition-all duration-500 glass-card p-6 relative overflow-hidden ${selectedJob?.id === job.id ? 'ring-2 ring-primary border-transparent shadow-lg' : ''}`}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center overflow-hidden transition-smooth group-hover:scale-110">
                          <img 
                            src={job.company_logo || `https://ui-avatars.com/api/?name=${job.company}&background=random`} 
                            alt={job.company} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h3 className="font-extrabold text-gray-900 text-lg leading-tight group-hover:text-primary transition-colors">
                            {job.title}
                          </h3>
                          <p className="text-primary font-bold text-xs uppercase tracking-widest mt-1 opacity-80">{job.company}</p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                         <Button 
                            variant="ghost" 
                            size="sm" 
                            className={`rounded-xl transition-smooth ${isSaved(job.id) ? 'text-green-600 bg-green-50' : 'text-gray-300 hover:bg-gray-100'}`}
                            onClick={() => saveJob(job.id)}
                          >
                            {isSaved(job.id) ? <CheckCircle size={18} /> : <Bookmark size={18} />}
                          </Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="flex items-center text-gray-500 text-[11px] font-bold gap-2 bg-gray-50/50 p-2 rounded-lg">
                        <MapPin size={14} className="text-primary/60" />
                        {job.location}
                      </div>
                      <div className="flex items-center text-gray-500 text-[11px] font-bold gap-2 bg-gray-50/50 p-2 rounded-lg">
                        <Briefcase size={14} className="text-primary/60" />
                        {job.work_type || 'On-site'}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-8">
                       {job.required_skills?.slice(0, 3).map((skill, i) => (
                         <span key={i} className="px-3 py-1 bg-white/60 text-gray-600 rounded-full text-[10px] font-bold border border-gray-100 shadow-sm transition-smooth hover:bg-white hover:shadow-md">
                           {skill}
                         </span>
                       ))}
                    </div>

                    <div className="flex gap-3">
                      <Button 
                        variant={selectedJob?.id === job.id ? 'primary' : 'outline'} 
                        className="flex-1 rounded-xl font-bold py-5 h-auto text-sm"
                        onClick={() => {
                          setSelectedJob(job);
                          window.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      >
                        {selectedJob?.id === job.id ? 'Active Analysis' : 'AI Analysis'}
                      </Button>
                      
                      <Button 
                        variant="secondary" 
                        className="rounded-xl px-5 transition-smooth hover:scale-105 active:scale-95"
                        onClick={async () => {
                          window.open(job.apply_url, '_blank');
                          try { await api.post(`/applications/${job.id}`); } catch (e) {}
                        }}
                      >
                         <ExternalLink size={20} />
                      </Button>
                    </div>
                  </Card>
                ))
              ) : (
                <div className="col-span-full py-20 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                   <p className="text-gray-500 font-medium">No Indian jobs found matching your criteria.</p>
                   <Button variant="ghost" onClick={() => {
                     setSearchTerm('');
                     setFilters({ location: 'All', experience: 'All' });
                   }} className="mt-2">Clear filters</Button>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-8 h-fit lg:sticky lg:top-24">
            {selectedJob ? (
              <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                <ExplanationPanel 
                  jobId={selectedJob.id} 
                  jobTitle={selectedJob.title}
                />
                <div className="mt-8">
                  <SkillGap 
                    jobId={selectedJob.id} 
                    jobTitle={selectedJob.title}
                  />
                </div>
                <Button 
                  className="w-full mt-6 bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-100 h-14 rounded-2xl font-bold"
                  onClick={async () => {
                    window.open(selectedJob.apply_url, '_blank');
                    try { await api.post(`/applications/${selectedJob.id}`); } catch (e) {}
                  }}
                >
                  Apply Directly <ExternalLink size={18} className="ml-2" />
                </Button>
              </div>
            ) : (
              <Card className="flex flex-col items-center justify-center py-16 text-center bg-white/50 border-dashed border-2 rounded-3xl">
                <div className="bg-gray-100 p-4 rounded-full text-gray-300 mb-4 animate-float">
                  <Sparkles size={32} />
                </div>
                <p className="font-bold text-gray-900 mb-1 leading-tight">AI Analysis Ready</p>
                <p className="text-sm text-gray-400 max-w-[200px]">
                  Select a job card to generate match explanations and skill gap insights.
                </p>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Jobs;
