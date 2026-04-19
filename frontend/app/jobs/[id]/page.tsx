'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { 
  Briefcase, MapPin, DollarSign, Clock, Sparkles, 
  ShieldCheck, ExternalLink, Bookmark, BookmarkCheck, 
  FileText, ArrowLeft, ChevronRight, Loader2, TrendingUp, Lightbulb, CheckCircle2, AlertCircle, Quote
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Button, { cn } from '@/components/ui/Button';
import ScoreBadge from '@/components/ui/ScoreBadge';
import Card from '@/components/ui/Card';
import { api } from '@/lib/api';
import { useAuth } from '@/lib/auth-context';
import JobCard from '@/components/JobCard';
import { JobCardSkeleton } from '@/components/ui/Skeleton';
import CoverLetterModal from '@/components/CoverLetterModal';
import { Job } from '@/types/job';

// --- Sub-components (Refactored for Dark Theme) ---

const InsightPanel: React.FC<{ jobId: string }> = ({ jobId }) => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/explanations/${jobId}`);
        setData(res);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [jobId]);

  if (loading) return <div className="h-32 bg-indigo-500/5 animate-pulse rounded-[2.5rem] border border-indigo-500/10" />;
  if (error || !data) return null;

  return (
    <Card className="border-none bg-indigo-500/5 rounded-[2.5rem] p-8 relative overflow-hidden group">
      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="bg-indigo-600 text-white p-2.5 rounded-xl shadow-glow-indigo">
          <Sparkles size={18} />
        </div>
        <h3 className="font-black text-white uppercase tracking-[0.2em] text-[10px]">AI Strategic Insight</h3>
      </div>
      <div className="relative z-10">
        <Quote className="absolute -left-2 -top-2 text-indigo-500/10" size={40} />
        <p className="text-sm leading-relaxed text-text-secondary italic font-medium pl-6">
          {data.explanation}
        </p>
      </div>
      <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl group-hover:bg-indigo-500/20 transition-all duration-1000" />
    </Card>
  );
};

const SkillGapPanel: React.FC<{ jobId: string }> = ({ jobId }) => {
  const [analysis, setAnalysis] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/skills/gap/${jobId}`);
        setAnalysis(res);
      } catch { }
      finally { setLoading(false); }
    };
    fetch();
  }, [jobId]);

  if (loading) return <div className="h-64 bg-surface/30 animate-pulse rounded-[2.5rem] border border-border/50" />;
  if (!analysis) return null;

  return (
    <Card className="p-8 bg-surface/30 border-border/50 rounded-[2.5rem] shadow-inner">
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 bg-violet-500/10 text-violet-400 rounded-xl flex items-center justify-center border border-violet-500/20 shadow-sm">
            <TrendingUp size={20} />
        </div>
        <h3 className="font-black text-white tracking-tight text-lg">Skill Gap Analysis</h3>
      </div>

      <div className="space-y-8">
        <div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-4 flex items-center gap-2">
            <CheckCircle2 size={14} /> Critical Matches
          </h4>
          <div className="flex flex-wrap gap-2">
            {analysis.matched_skills?.map((skill: string, i: number) => (
              <span key={i} className="px-3 py-1.5 bg-emerald-500/5 text-emerald-400 text-[10px] font-black uppercase tracking-wider rounded-lg border border-emerald-500/20">
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-4 flex items-center gap-2">
            <AlertCircle size={14} /> Development Targets
          </h4>
          <div className="flex flex-wrap gap-2">
            {analysis.missing_skills?.map((skill: string, i: number) => (
              <span key={i} className="px-3 py-1.5 bg-indigo-500/5 text-indigo-400 text-[10px] font-black uppercase tracking-wider rounded-lg border border-indigo-500/20">
                {skill}
              </span>
            ))}
          </div>
        </div>

        <div className="p-5 bg-background/50 rounded-2xl border border-white/5 flex items-start gap-3 group shadow-inner">
          <Lightbulb size={18} className="text-amber-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
          <p className="text-xs font-bold text-text-secondary leading-relaxed italic">
            "{analysis.recommendation || `Bridging the gap in ${analysis.missing_skills?.[0] || 'core sector skills'} could improve your match percentile by up to 15%`}"
          </p>
        </div>
      </div>
    </Card>
  );
};

// --- Main Page ---

export default function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();
  
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [isCoverLetterOpen, setIsCoverLetterOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const data = await api.get(`/jobs/${id}`);
        setJob(data);
        
        // Track recently viewed
        const recent = JSON.parse(localStorage.getItem('recentlyViewed') || '[]');
        const updated = [data, ...recent.filter((j: any) => j.id !== data.id)].slice(0, 10);
        localStorage.setItem('recentlyViewed', JSON.stringify(updated));

        // Suggestions
        setSuggestionsLoading(true);
        try {
          const skillsArr = Array.isArray(data.required_skills) 
            ? data.required_skills 
            : typeof data.required_skills === 'string' 
              ? (data.required_skills as string).split(',').map((s: string) => s.trim()) 
              : [];
          const skillsToMatch = skillsArr.slice(0, 2).join(' ') || data.title;
          const sug = await api.post('/matching/match-text', { resume_text: skillsToMatch, top_n: 4 });
          setSuggestions(sug.filter((s: any) => (s.job?.id || s.id) !== data.id).slice(0, 2));
        } catch {} finally { setSuggestionsLoading(false); }

      } catch (err) {
        toast.error('Mission failed to load.');
        router.push('/jobs');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, router]);

  const handleSave = async () => {
    if (!job) return;
    try {
      await api.post(`/jobs/${job.id}/save`);
      setSaved(true);
      toast.success('Strategy bookmarked!');
    } catch {
      toast.error('Sync failed.');
    }
  };

  if (loading) return (
    <div className="section-container flex flex-col items-center justify-center py-40">
       <Loader2 className="animate-spin text-indigo-500 mb-6" size={64} />
       <p className="text-white font-black text-xl tracking-tighter uppercase animate-pulse">Syncing Mission Details...</p>
    </div>
  );

  if (!job) return null;

  const salary = job.salary_min && job.salary_max
    ? `$${(job.salary_min / 1000).toFixed(0)}k – $${(job.salary_max/1000).toFixed(0)}k`
    : job.salary_min ? `From $${(job.salary_min/1000).toFixed(0)}k` : 'Competitive';

  return (
    <div className="section-container pb-32">
       {/* Breadcrumbs */}
       <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-12">
          <button onClick={() => router.back()} className="group flex items-center gap-3 text-[10px] font-black text-text-muted hover:text-white uppercase tracking-[0.25em] transition-all">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Back to Command Center
          </button>
       </motion.div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-16">
             {/* Header Header */}
             <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-12 p-10 md:p-14 bg-slate-950 rounded-[3rem] border border-white/5 shadow-22xl isolate overflow-hidden">
                    <div className="relative z-10 flex-1">
                        <div className="flex items-center gap-4 mb-8">
                            <span className="px-3 py-1 bg-indigo-500/10 text-indigo-400 text-[10px] font-black uppercase tracking-[0.15em] rounded-md border border-indigo-500/20 shadow-glow-indigo">
                                {job.work_type || 'Full-time'}
                            </span>
                            <div className="flex items-center gap-1.5 text-[10px] font-black text-text-muted uppercase tracking-widest">
                                <Clock size={14} />
                                {new Date(job.posted_at).toLocaleDateString([], { month: 'long', day: 'numeric' })}
                            </div>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-black text-white leading-[0.9] tracking-tighter mb-8 max-w-xl">
                            {job.title}
                        </h1>

                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-surface rounded-2xl flex items-center justify-center border border-white/5 overflow-hidden p-1 shadow-inner">
                                {job.company_logo ? (
                                    <img src={job.company_logo} alt={job.company} className="w-full h-full object-contain" />
                                ) : <Briefcase size={28} className="text-text-muted" />}
                            </div>
                            <div>
                                <p className="text-2xl font-black text-white tracking-tight leading-none mb-1">{job.company}</p>
                                <p className="text-xs font-bold text-text-muted uppercase tracking-widest leading-none">{job.location}</p>
                            </div>
                        </div>
                    </div>

                    <div className="shrink-0 flex flex-col items-center gap-3 bg-indigo-600/5 backdrop-blur-xl p-10 rounded-[3rem] border border-indigo-500/10 shadow-glow-indigo group">
                        <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] leading-none mb-2">Synergy Level</p>
                        <ScoreBadge score={job.score || 85} size="lg" />
                        <div className="mt-4 px-4 py-2 bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase rounded-xl border border-emerald-500/20 shadow-sm animate-pulse">
                            High Potency
                        </div>
                    </div>

                    {/* Background decoration */}
                    <div className="absolute -right-20 -bottom-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] -z-10" />
                </div>
             </motion.div>

             {/* Description Card */}
             <section className="space-y-10">
                <div className="flex items-center gap-4 mb-8">
                   <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-primary-400">
                      <FileText size={24} />
                   </div>
                   <h2 className="text-3xl font-black text-white tracking-tight">Mission Protocols</h2>
                </div>
                
                <Card className="p-10 md:p-14 bg-surface/20 border-border/30 rounded-[3rem]">
                   <div className="prose prose-invert max-w-none prose-p:text-text-secondary prose-p:text-lg prose-p:font-medium prose-p:leading-relaxed">
                      <p className="whitespace-pre-wrap">{job.description}</p>
                   </div>
                </Card>

                {/* Skills section */}
                {job.required_skills && (
                  <div className="pt-10">
                     <h3 className="text-xs font-black text-text-muted uppercase tracking-[0.3em] mb-8">Required DNA Signatures</h3>
                     <div className="flex flex-wrap gap-3">
                        {(Array.isArray(job.required_skills) 
                          ? job.required_skills 
                          : typeof job.required_skills === 'string' 
                            ? (job.required_skills as string).split(',').map((s: string) => s.trim()) 
                            : []
                        ).map((skill: string, i: number) => (
                           <span key={i} className="px-6 py-3 bg-surface border border-border/50 rounded-2xl text-xs font-black text-text-secondary uppercase tracking-widest hover:border-primary-400 hover:text-white transition-all transform-gpu hover:scale-105">
                                {skill}
                           </span>
                        ))}
                     </div>
                  </div>
                )}
             </section>

             {/* Similar Roles */}
             {suggestions.length > 0 && (
                <section>
                    <div className="flex items-center justify-between mb-10">
                        <h3 className="text-2xl font-black text-white tracking-tight">Alternative Trajectories</h3>
                        <Link href="/jobs" className="text-[10px] font-black text-primary-400 uppercase tracking-widest flex items-center gap-2 group">
                            Full Sector <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {suggestions.map(s => <JobCard key={s.id || s.job_id} job={s} onSelect={(j) => window.location.href = `/jobs/${j.id}`} />)}
                    </div>
                </section>
             )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
             {/* Sticky Controls */}
             <div className="sticky top-32 space-y-8">
                <InsightPanel jobId={id} />
                <SkillGapPanel jobId={id} />

                <Card className="p-10 bg-slate-950 border-white/10 rounded-[3.5rem] shadow-glow overflow-hidden relative">
                   <div className="relative z-10 space-y-6">
                      <div className="text-center mb-10">
                         <div className="w-16 h-16 bg-primary-500/10 text-primary-400 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow border border-primary-500/20">
                            <ShieldCheck size={32} />
                         </div>
                         <h4 className="text-2xl font-black text-white mb-2 leading-none">Execute Mission</h4>
                         <p className="text-xs font-bold text-text-muted uppercase tracking-widest mt-3 opacity-60">Verified Connection Active</p>
                      </div>

                      <Button 
                         variant="accent"
                         className="w-full h-16 rounded-2xl font-black text-base shadow-glow uppercase tracking-[0.1em]"
                         onClick={async () => {
                            const store = (await import('@/lib/store/jobStore')).useJobStore.getState();
                            await store.applyToJob(job.id);
                            window.open(job.apply_url, '_blank');
                         }}
                      >
                         Launch Application <ExternalLink size={20} className="ml-2" />
                      </Button>

                      <Button 
                         variant="secondary"
                         className="w-full h-16 rounded-2xl font-black text-white uppercase tracking-[0.1em] border border-white/10"
                         onClick={() => setIsCoverLetterOpen(true)}
                      >
                         AI Narrative Synthesis
                      </Button>

                      <button 
                        onClick={handleSave}
                        className={cn(
                            "w-full h-12 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all",
                            saved ? "text-primary-400" : "text-text-muted hover:text-white"
                        )}
                      >
                        {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
                        {saved ? 'Protocol Bookmarked' : 'Add to Strategic List'}
                      </button>
                   </div>
                   <div className="absolute -top-12 -right-12 w-32 h-32 bg-primary-500/10 rounded-full blur-[80px]" />
                </Card>
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
}

// Minimal Link replacement since next/link isn't working as nicely with absolute redirects in this context without a proper router.push
const Link = ({ href, children, className }: any) => <a href={href} className={className}>{children}</a>;
