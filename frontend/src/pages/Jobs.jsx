import React, { useEffect, useState } from 'react';
import { Search, Filter, SlidersHorizontal, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { api } from '../utils/api';
import JobCard from '../components/JobCard';
import SkillGap from '../components/SkillGap';
import ExplanationPanel from '../components/ExplanationPanel';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      // 1. Try to get AI matches first
      try {
        const matches = await api.post('/matching/match', {});
        if (matches && matches.length > 0) {
          // Flatten match data for display
          const matchedJobs = matches.map(m => ({
            ...m,
            id: m.job_id, // Map job_id to id for consistency
            matchScore: m.score
          }));
          setJobs(matchedJobs);
          return;
        }
      } catch (matchErr) {
        console.warn('AI matching not available or no resume found:', matchErr);
      }

      // 2. Fallback to regular jobs list if matching fails or no resume
      const data = await api.get('/jobs');
      setJobs(data);
    } catch (err) {
      setError(err.message || 'Failed to fetch jobs.');
    } finally {
      setLoading(false);
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
          <Button variant="secondary" size="sm" className="hidden sm:flex">
            <SlidersHorizontal size={18} className="mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-gray-400">
          <Loader2 size={48} className="animate-spin mb-4 text-primary/50" />
          <p className="font-medium">Curating your customized job feed...</p>
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
                filteredJobs.map(job => (
                  <JobCard 
                    key={job.id} 
                    job={job} 
                    onSelect={setSelectedJob} 
                  />
                ))
              ) : (
                <div className="col-span-full py-20 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                   <p className="text-gray-500 font-medium">No matches found for "{searchTerm}"</p>
                   <Button variant="ghost" onClick={() => setSearchTerm('')} className="mt-2">Clear search</Button>
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
              </div>
            ) : (
              <Card className="flex flex-col items-center justify-center py-16 text-center bg-white/50 animate-pulse">
                <div className="bg-gray-100 p-4 rounded-full text-gray-300 mb-4">
                  <Sparkles size={32} />
                </div>
                <p className="font-bold text-gray-400 mb-1 leading-tight">No Job Selected</p>
                <p className="text-sm text-gray-400 max-w-[200px]">
                  Click "Details" on any job card to see AI insights.
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
