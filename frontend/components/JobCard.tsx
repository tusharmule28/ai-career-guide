'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, MapPin, DollarSign, ChevronRight, Bookmark, BookmarkCheck, Sparkles, Clock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/api';
import Card from './ui/Card';
import Button, { cn } from './ui/Button';
import ApplyWithAIBtn from './ApplyWithAIBtn';
import { Job } from '@/types/job';
import CircularScore from './ui/CircularScore';

interface JobCardProps {
  job: any;
  onSelect: (job: Job) => void;
  highlight?: boolean;
  userIsPremium?: boolean;
  userCredits?: number;
  onCreditsUsed?: (newCount: number) => void;
}

const JobCard: React.FC<JobCardProps> = ({
  job,
  onSelect,
  highlight,
  userIsPremium = false,
  userCredits = 3,
  onCreditsUsed,
}) => {
  const [saved, setSaved] = useState(false);

  const targetJob: Job = job.job || job;
  const title = targetJob.title || 'Untitled Role';
  const company = targetJob.company || 'Confidential Company';
  const location = targetJob.location || 'Remote';

  const formatSalary = (min?: number | null, max?: number | null) => {
    if (!min && !max) return 'Competitive';
    
    // Detect Currency: If min > 100,000, assume INR (Lakhs), otherwise assume USD (K)
    const isINR = min ? min > 100000 : (max ? max > 100000 : false);
    const symbol = isINR ? '₹' : '$';
    const divisor = isINR ? 100000 : 1000;
    const unit = isINR ? 'L' : 'k';

    if (min && max) {
      return `${symbol}${(min / divisor).toFixed(1)}${unit} – ${symbol}${(max / divisor).toFixed(1)}${unit}`;
    }
    return `From ${symbol}${(min! / divisor).toFixed(1)}${unit}`;
  };

  const salary = formatSalary(targetJob.salary_min, targetJob.salary_max);

  const matchScore: number = job.score || targetJob.score || 0;
  const source = targetJob.source || null;
  const jobId = targetJob.id || (targetJob as any).job_id;
  const matchReason = job.match_reason || targetJob.match_reason || null;

  const skills = Array.isArray(targetJob.required_skills)
    ? targetJob.required_skills
    : typeof targetJob.required_skills === 'string'
    ? targetJob.required_skills.split(',').map((s: string) => s.trim())
    : [];

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.post(`/jobs/${jobId}/save`);
      setSaved(true);
      toast.success('Job saved!');
    } catch {
      toast.error('Could not save.');
    }
  };

  return (
    <Card
      className={cn(
        "group h-full flex flex-col transition-all duration-500 bg-surface/30 hover:bg-surface border-border/30 hover:border-primary-500/30 isolate cursor-pointer",
        highlight && "ring-1 ring-primary-500/20 shadow-glow bg-surface/50"
      )}
      onClick={() => onSelect(targetJob)}
    >
      {/* Decorative Blur */}
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary-500/10 rounded-full blur-2xl group-hover:bg-primary-500/20 transition-colors -z-10" />

      {/* Header & Meta */}
      <div className="flex gap-4 items-start mb-4">
        {/* Company Logo */}
        <div className="w-10 h-10 rounded-xl bg-background border border-border/50 flex items-center justify-center overflow-hidden shrink-0 shadow-sm mt-1">
          {targetJob.company_logo
            ? <img src={targetJob.company_logo} alt={company} className="w-full h-full object-contain p-1" />
            : <Briefcase size={20} className="text-text-muted" />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs font-bold text-text-secondary truncate">{company}</span>
            {targetJob.posted_at && (
              <span className={cn(
                "flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider shrink-0",
                (new Date().getTime() - new Date(targetJob.posted_at).getTime()) < 86400000 
                  ? "text-indigo-400" 
                  : "text-text-muted"
              )}>
                <Clock size={9} />
                {(new Date().getTime() - new Date(targetJob.posted_at).getTime()) < 86400000 
                  ? "Fresh" 
                  : new Date(targetJob.posted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>
          
          <h3 className="text-base md:text-lg font-bold text-text group-hover:text-primary-400 transition-colors line-clamp-1 mb-1.5">
            {title}
          </h3>

          <div className="flex flex-wrap items-center gap-y-2 gap-x-2 xl:gap-x-3">
            {highlight && (
              <span className="px-2 py-0.5 bg-primary-500/10 text-primary-400 border border-primary-500/20 rounded-md text-[10px] font-bold">
                Top Match
              </span>
            )}
            <div className="flex items-center gap-1 text-[10px] font-bold text-text-secondary bg-surface border border-border/50 px-2 py-0.5 rounded-md max-w-full">
              <MapPin size={10} className="text-primary-400 shrink-0" />
              <span className="truncate">{location}</span>
            </div>
            <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 px-2 py-0.5 rounded-md">
              <DollarSign size={10} className="shrink-0" />
              <span className="whitespace-nowrap">{salary}</span>
            </div>
            {targetJob.work_type && (
               <span className="px-2 py-0.5 bg-background text-text-muted border border-border/50 rounded-md text-[10px] font-medium whitespace-nowrap">
                 {targetJob.work_type}
               </span>
            )}
            {source && (
               <span className={cn(
                 "px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.15em] rounded-md border whitespace-nowrap",
                 source.toLowerCase().includes('linkedin')
                   ? "bg-[#0077b5]/10 text-[#0077b5] border-[#0077b5]/20"
                   : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
               )}>
                 {source}
               </span>
             )}
          </div>
        </div>

        {/* Circular score indicator */}
        {matchScore > 0 && (
          <CircularScore score={matchScore} size={48} strokeWidth={4} />
        )}
      </div>

      {/* Skill Synergy Matrix or Default Skills */}
      <div className="mb-4">
        {matchScore > 0 ? (
          <div className="p-3 bg-slate-900/40 rounded-2xl border border-white/5 space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {job.found_skills?.slice(0, 4).map((skill: string, i: number) => (
                <span key={i} className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md text-[9px] font-black uppercase tracking-wider flex items-center gap-1 max-w-full">
                  <div className="w-1 h-1 rounded-full bg-emerald-400 shrink-0" /> <span className="truncate">{skill}</span>
                </span>
              ))}
              {job.missing_skills?.slice(0, 2).map((skill: string, i: number) => (
                <span key={i} className="px-2 py-0.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-md text-[9px] font-black uppercase tracking-wider flex items-center gap-1 opacity-70 max-w-full">
                  <div className="w-1 h-1 rounded-full bg-amber-400 shrink-0" /> <span className="truncate">{skill}</span>
                </span>
              ))}
            </div>
            
            {job.all_reasons && job.all_reasons.length > 0 ? (
              <div className="border-t border-white/5 pt-2 mt-2 space-y-1">
                <div className="flex items-start gap-1.5 text-[10px] leading-relaxed text-text-muted font-medium italic">
                    <Sparkles size={10} className="text-primary-400 shrink-0 mt-0.5" />
                    <span>{job.all_reasons[0]}</span>
                </div>
              </div>
            ) : matchReason ? (
               <div className="flex items-start gap-1.5 text-[10px] leading-relaxed text-text-muted font-medium italic border-t border-white/5 pt-2 mt-2">
                 <Sparkles size={10} className="text-primary-400 shrink-0 mt-0.5" />
                 <span>{matchReason}</span>
               </div>
            ) : null}
          </div>
        ) : (
          skills.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {skills.slice(0, 4).map((skill: string, i: number) => (
                <span key={i} className="px-2 py-0.5 bg-background border border-border/30 rounded-lg text-[9px] font-bold text-text-muted uppercase tracking-wider max-w-full">
                  <span className="truncate block">{skill}</span>
                </span>
              ))}
              {skills.length > 4 && (
                <span className="text-[9px] font-black text-primary-400/60 self-center ml-1">
                  +{skills.length - 4} more
                </span>
              )}
            </div>
          )
        )}
      </div>

      {/* Actions */}
      <div className="mt-auto pt-4 border-t border-border/30 flex flex-col xl:flex-row gap-3 xl:items-center xl:justify-between">
        {/* Primary Actions Row */}
        <div className="flex items-center gap-2 w-full xl:w-auto xl:flex-1 min-w-0">
          <ApplyWithAIBtn
            job={targetJob}
            creditsRemaining={userCredits}
            isPremium={userIsPremium}
            onCreditsUsed={onCreditsUsed}
            className="flex-1 xl:flex-none min-w-0 px-2 sm:px-4 h-10"
          />
          <Button
            size="sm"
            variant="outline"
            className="flex-1 xl:flex-none h-10 px-4 rounded-xl text-xs"
            onClick={async (e) => {
              e.stopPropagation();
              try {
                const store = (await import('@/lib/store/jobStore')).useJobStore.getState();
                await store.applyToJob(jobId);
                window.open(targetJob.apply_url, '_blank');
                toast.success('Opening application...');
              } catch {
                toast.error('Failed to launch application.');
              }
            }}
          >
            Apply Now
          </Button>

          {/* Desktop Bookmark */}
          <button
            onClick={(e) => {
               e.stopPropagation();
               handleSave(e);
            }}
            className={cn(
              "hidden xl:flex w-10 h-10 rounded-xl items-center justify-center transition-all duration-300 transform-gpu active:scale-90 shrink-0",
              saved
                ? "bg-primary-500/20 text-primary-400 border border-primary-500/30 shadow-glow"
                : "bg-surface border border-border/50 text-text-muted hover:text-text hover:border-border"
            )}
            title={saved ? 'Bookmarked' : 'Bookmark'}
          >
            {saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
          </button>
        </div>

        {/* Secondary Actions Row */}
        <div className="flex items-center justify-between w-full xl:w-auto">
          {/* Mobile Bookmark */}
          <button
            onClick={(e) => {
               e.stopPropagation();
               handleSave(e);
            }}
            className={cn(
              "flex xl:hidden w-10 h-10 rounded-xl items-center justify-center transition-all duration-300 transform-gpu active:scale-90 shrink-0",
              saved
                ? "bg-primary-500/20 text-primary-400 border border-primary-500/30 shadow-glow"
                : "bg-surface border border-border/50 text-text-muted hover:text-text hover:border-border"
            )}
            title={saved ? 'Bookmarked' : 'Bookmark'}
          >
            {saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
          </button>

          <div className="flex items-center text-xs font-semibold text-text-secondary hover:text-primary-400 transition-colors group/details">
            View Role
            <ChevronRight size={14} className="ml-0.5 group-hover/details:translate-x-0.5 transition-transform" />
          </div>
        </div>
      </div>
    </Card>
  );
};

export default JobCard;
