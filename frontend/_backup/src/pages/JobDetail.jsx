import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  Briefcase, MapPin, DollarSign, Clock, Sparkles, 
  ShieldCheck, ExternalLink, Bookmark, BookmarkCheck, 
  FileText, ArrowLeft, ChevronRight, Loader2, TrendingUp
} from 'lucide-react';
import Button from '../components/ui/Button';
import ScoreBadge from '../components/ui/ScoreBadge';
import ExplanationPanel from '../components/ExplanationPanel';
import SkillGap from '../components/SkillGap';
import CoverLetterModal from '../components/CoverLetterModal';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import JobCard from '../components/JobCard';

const JobDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [isCoverLetterOpen, setIsCoverLetterOpen] = useState(false);
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  useEffect(() => {
    fetchJobDetails();
    // Scroll to top on ID change
    window.scrollTo(0, 0);
  }, [id]);

  const fetchJobDetails = async () => {
    setLoading(true);
    try {
      const data = await api.get(`/jobs/${id}`);
      setJob(data);
      
      // Track Recently Viewed
      trackRecentlyViewed(data);
      
      // Check if already saved
      checkIfSaved(data.id);
      
      // Fetch Smart Suggestions
      fetchSuggestions(data);
      
      // Fetch AI Insights (Match Reason + Growth Path)
      fetchInsights();
    } catch (err) {
      toast.error('Failed to load job details');
      navigate('/jobs');
    } finally {
      setLoading(false);
    }
  };

  const trackRecentlyViewed = (jobData) => {
    const recent = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
    const filtered = recent.filter(j => j.id !== jobData.id);
    const updated = [{
      id: jobData.id,
      title: jobData.title,
      company: jobData.company,
      location: jobData.location,
      posted_at: jobData.posted_at
    }, ...filtered].slice(0, 10);
    localStorage.setItem('recentlyViewed', JSON.stringify(updated));
  };

  const checkIfSaved = async (jobId) => {
    try {
      const savedJobs = await api.get('/jobs/saved');
      setSaved(savedJobs.some(j => j.id === jobId));
    } catch (err) {
      console.error('Failed to check saved status:', err);
    }
  };

  const fetchSuggestions = async (currentJob) => {
    setSuggestionsLoading(true);
    try {
      // Find matches based on current job's first two skills for relevance
      const skillsToMatch = currentJob.required_skills?.slice(0, 2).join(' ') || currentJob.title;
      const data = await api.post('/matching/match-text', {
        resume_text: skillsToMatch,
        top_n: 3
      });
      // Handle response correctly (data is likely an array of dicts with score/job keys from existing logic)
      setSuggestions(data.filter(j => (j.id || j.job_id) !== currentJob.id));
    } catch (err) {
      console.error('Failed to fetch suggestions:', err);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const fetchInsights = async () => {
    setInsightsLoading(true);
    try {
      const data = await api.get(`/jobs/${id}/insights`);
      setInsights(data);
    } catch (err) {
      console.error('Failed to fetch job insights:', err);
    } finally {
      setInsightsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await api.post(`/jobs/${job.id}/save`);
      setSaved(true);
      toast.success('Job saved to your list!');
    } catch {
      toast.error('Could not save job.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  if (!job) return null;

  const salary = job.salary_min && job.salary_max
    ? `$${Number(job.salary_min).toLocaleString()} – $${Number(job.salary_max).toLocaleString()}`
    : job.salary_min ? `From $${Number(job.salary_min).toLocaleString()}`
    : 'Competitive';

  return (
    <div className="section-container pb-20 animate-fade-in">
      {/* Navigation */}
      <div className="mb-8">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-text-muted hover:text-text font-bold transition-smooth"
        >
          <ArrowLeft size={20} />
          Back to Results
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-12">
          {/* Header Card */}
          <div className="p-8 sm:p-12 bg-surface/50 rounded-[2.5rem] border border-border/50 shadow-premium">
             <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="px-3 py-1 bg-primary-500/10 text-primary-400 text-[10px] font-black uppercase tracking-widest rounded-full border border-primary-500/20">
                      {job.work_type || 'Full-time'}
                    </span>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-text-muted uppercase tracking-widest">
                      <Clock size={14} />
                      <span>Posted {new Date(job.posted_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <h1 className="text-4xl sm:text-5xl font-black text-text tracking-tight leading-tight mb-4">
                    {job.title}
                  </h1>
                  <div className="flex items-center gap-3 text-xl font-bold text-text-secondary">
                    <div className="w-10 h-10 rounded-xl bg-surface flex items-center justify-center text-text-muted">
                      {job.company_logo ? (
                        <img src={job.company_logo} alt={job.company} className="w-full h-full object-contain" />
                      ) : (
                        <Briefcase size={24} />
                      )}
                    </div>
                    <span>{job.company}</span>
                  </div>
                </div>
                
                <div className="flex flex-col items-center gap-4 bg-surface p-8 rounded-[2.5rem] border border-border/50 min-w-[160px]">
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-widest leading-none">Match Score</p>
                  <ScoreBadge score={job.score || 85} size="lg" />
                </div>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-12">
                <div className="flex items-center gap-3 p-5 bg-surface rounded-2xl border border-border/50">
                  <div className="w-12 h-12 rounded-xl bg-primary-500/10 text-primary-400 flex items-center justify-center font-bold">
                    <MapPin size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Location</p>
                    <p className="text-base font-bold text-text">{job.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-5 bg-surface rounded-2xl border border-border/50">
                  <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                    <DollarSign size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Salary</p>
                    <p className="text-base font-bold text-text">{salary}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-5 bg-surface rounded-2xl border border-border/50">
                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 flex items-center justify-center">
                    <ShieldCheck size={24} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Type</p>
                    <p className="text-base font-bold text-text">{job.work_type || 'Full-time'}</p>
                  </div>
                </div>
             </div>
          </div>

          </div>

          {/* Description Section */}
          <div className="p-8 sm:p-12 bg-surface/50 rounded-[2.5rem] border border-border/50 shadow-sm">
             <h3 className="text-2xl font-black text-text mb-8 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-500/10 text-primary-400 flex items-center justify-center">
                   <Briefcase size={18} />
                </div>
                Job Description
             </h3>
             <div className="prose prose-slate max-w-none">
                <p className="text-slate-600 text-lg leading-relaxed font-medium whitespace-pre-wrap">
                   {job.description}
                </p>
             </div>

             <div className="mt-12 pt-12 border-t border-border/50">
                <h3 className="text-2xl font-black text-text mb-8 flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                      <Sparkles size={18} />
                   </div>
                   Required Skillsets
                </h3>
                <div className="flex flex-wrap gap-3">
                  {(job.required_skills || []).map((skill, index) => (
                    <span 
                      key={index}
                      className="px-5 py-2.5 bg-slate-50 text-slate-700 text-sm font-bold rounded-xl border border-slate-100 hover:border-accent-300 transition-smooth"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
             </div>
          </div>

          {/* AI Insights and Growth Path */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="p-8 bg-surface/50 rounded-[2.5rem] border border-border/50 shadow-sm">
                <h3 className="text-xl font-black text-text mb-6 flex items-center gap-3">
                   <div className="w-8 h-8 rounded-lg bg-primary-500/10 text-primary-400 flex items-center justify-center">
                      <Sparkles size={18} />
                   </div>
                   Strategic Match Insight
                </h3>
                {insightsLoading ? (
                   <div className="space-y-4">
                      <div className="h-4 bg-slate-50 w-full animate-pulse rounded"></div>
                      <div className="h-4 bg-slate-50 w-4/5 animate-pulse rounded"></div>
                   </div>
                ) : (
                   <div className="prose prose-slate max-w-none">
                      <p className="text-slate-600 text-sm leading-relaxed font-medium">
                         {insights?.match_explanation || 'AI analysis in progress. Our systems are evaluating your profile against the key requirements for this position.'}
                      </p>
                   </div>
                )}
             </div>

             <div className="p-8 bg-slate-900 text-white rounded-[2.5rem] shadow-premium relative overflow-hidden group">
                <div className="relative z-10">
                   <h3 className="text-xl font-black text-white mb-6 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-accent-500/20 text-accent-400 flex items-center justify-center">
                         <TrendingUp size={18} /> {/* Need to import TrendingUp */}
                      </div>
                      AI Growth Path
                   </h3>
                   {insightsLoading ? (
                      <div className="space-y-4">
                         <div className="h-4 bg-white/10 w-full animate-pulse rounded"></div>
                         <div className="h-4 bg-white/10 w-3/4 animate-pulse rounded"></div>
                      </div>
                   ) : (
                      <div className="prose prose-invert max-w-none">
                         <div className="text-slate-300 text-sm leading-relaxed font-medium whitespace-pre-wrap">
                            {insights?.growth_path || 'No specific gaps identified. You have the core profile required for this role.'}
                         </div>
                      </div>
                   )}
                </div>
                <div className="absolute -right-16 -bottom-16 w-48 h-48 bg-accent-500/10 rounded-full blur-3xl group-hover:scale-125 transition-transform duration-1000"></div>
             </div>
          </div>

          {/* Smart Suggestions */}
          <div className="pt-12">
             <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-black text-text">Similar Roles You May Like</h3>
                <Link to="/jobs" className="text-primary-400 font-bold flex items-center gap-1 hover:gap-2 transition-all">
                   View All <ChevronRight size={20} />
                </Link>
             </div>
             
             {suggestionsLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   <div className="h-48 bg-slate-50 animate-pulse rounded-2xl"></div>
                   <div className="h-48 bg-slate-50 animate-pulse rounded-2xl"></div>
                </div>
             ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {suggestions.map(s => (
                      <JobCard key={s.job_id} job={s} onSelect={(j) => navigate(`/job/${j.id || j.job_id}`)} />
                   ))}
                   {suggestions.length === 0 && (
                      <div className="col-span-full p-12 bg-slate-50 rounded-[2rem] text-center">
                         <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No similar roles found right now</p>
                      </div>
                   )}
                </div>
             )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
           <ExplanationPanel jobId={job.id} jobTitle={job.title} />
           <SkillGap jobId={job.id} jobTitle={job.title} />

           <div className="sticky top-8">
              <div className="p-1 bg-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden">
                 <div className="p-10 bg-slate-800 rounded-[2.3rem] border border-white/5">
                    <div className="text-center mb-10">
                       <div className="w-16 h-16 bg-accent-500/10 text-accent-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
                          <ShieldCheck size={32} />
                       </div>
                       <h4 className="text-2xl font-black text-white mb-3">Instant Apply</h4>
                       <p className="text-slate-400 text-sm font-medium">Your profile is 85% ready for this role. Submit now to get priority review.</p>
                    </div>

                    <div className="space-y-4">
                       <Button 
                          className="w-full h-14 rounded-2xl font-black text-lg bg-accent-600 hover:bg-accent-700 shadow-glow"
                          onClick={() => window.open(job.apply_url, '_blank')}
                          icon={ExternalLink}
                       >
                          Apply Directly
                       </Button>
                       <Button 
                          variant="ghost"
                          className="w-full h-14 rounded-2xl font-black text-white hover:bg-white/10 border border-white/10"
                          onClick={() => setIsCoverLetterOpen(true)}
                       >
                          <FileText size={18} className="mr-2" />
                          AI Cover Letter
                       </Button>
                       <Button 
                          variant="ghost"
                          className={`w-full h-14 rounded-2xl font-black border transition-all ${
                            saved 
                              ? 'text-accent-400 border-accent-400/30 bg-accent-500/10' 
                              : 'text-white hover:bg-white/10 border-white/10'
                          }`}
                          onClick={handleSave}
                        >
                          {saved ? <BookmarkCheck size={20} className="mr-2" /> : <Bookmark size={20} className="mr-2" />}
                          {saved ? 'Saved!' : 'Save for Later'}
                       </Button>
                    </div>
                 </div>
              </div>
           </div>
         </div>

      <CoverLetterModal
        isOpen={isCoverLetterOpen}
        onClose={() => setIsCoverLetterOpen(false)}
        job={job}
      />
    </div>
  );
};

export default JobDetail;
