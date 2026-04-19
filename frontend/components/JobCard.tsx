'use client';

import React, { useState } from 'react';
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

const MatchBar: React.FC<{ score: number }> = ({ score }) => {
  const color =
    score >= 80 ? 'from-emerald-500 to-green-400' :
    score >= 60 ? 'from-amber-500 to-yellow-400' :
    'from-rose-500 to-red-400';

  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 h-1.5 bg-slate-800/60 rounded-full overflow-hidden border border-white/5">
        <div
          className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-1000", color)}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
      <span className="text-[9px] font-black text-text-muted uppercase tracking-wider tabular-nums">
        Match
      </span>
    </div>
  );
};

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

  const salary = targetJob.salary_min && targetJob.salary_max
    ? `$${Math.round(targetJob.salary_min / 1000)}k – $${Math.round(targetJob.salary_max / 1000)}k`
    : targetJob.salary_min
    ? `From $${Math.round(targetJob.salary_min / 1000)}k`
    : 'Competitive';

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
        "group h-full flex flex-col transition-all duration-500 bg-surface/30 hover:bg-surface border-border/30 hover:border-primary-500/30 isolate",
        highlight && "ring-1 ring-primary-500/20 shadow-glow bg-surface/50"
      )}
    >
      {/* Decorative Blur */}
      <div className="absolute -top-12 -right-12 w-24 h-24 bg-primary-500/10 rounded-full blur-2xl group-hover:bg-primary-500/20 transition-colors -z-10" />

      {/* Header */}
      <div className="flex justify-between items-start gap-3 mb-4">
        <div className="flex-1 min-w-0">
          {/* Badges row */}
          <div className="flex items-center gap-1.5 mb-2 flex-wrap">
            <span className={cn(
              "px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.15em] rounded-md border",
              highlight
                ? "bg-primary-500/10 text-primary-400 border-primary-500/20"
                : "bg-background text-text-muted border-border/50"
            )}>
              {highlight ? "Top Match" : (targetJob.work_type || "Full-time")}
            </span>
            {source && (
              <span className={cn(
                "px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.15em] rounded-md border",
                source.toLowerCase().includes('linkedin')
                  ? "bg-[#0077b5]/10 text-[#0077b5] border-[#0077b5]/20"
                  : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
              )}>
                {source}
              </span>
            )}
            {targetJob.posted_at && (
              <span className="flex items-center gap-1 text-[9px] text-text-muted font-bold uppercase tracking-wider">
                <Clock size={9} />
                {new Date(targetJob.posted_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            )}
          </div>

          <h3 className="text-base font-black text-text group-hover:text-primary-300 transition-colors line-clamp-1 tracking-tight leading-tight mb-1">
            {title}
          </h3>

          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-background border border-border/50 flex items-center justify-center overflow-hidden shrink-0">
              {targetJob.company_logo
                ? <img src={targetJob.company_logo} alt={company} className="w-full h-full object-contain" />
                : <Briefcase size={10} className="text-text-muted" />}
            </div>
            <span className="text-xs font-bold text-text-secondary truncate">{company}</span>
          </div>
        </div>

        {/* Circular score indicator */}
        {matchScore > 0 && (
          <CircularScore score={matchScore} size={52} strokeWidth={4} />
        )}
      </div>

      {/* Match bar */}
      {matchScore > 0 && <MatchBar score={matchScore} />}

      {/* AI Insight */}
      {matchReason && (
        <div className="my-4 p-3 bg-primary-500/5 rounded-2xl border border-primary-500/10 relative overflow-hidden group/insight">
          <div className="flex items-start gap-2 relative z-10">
            <Sparkles size={11} className="text-primary-400 mt-0.5 shrink-0" />
            <p className="text-[10px] leading-relaxed text-primary-200/60 font-medium italic line-clamp-2">
              {matchReason}
            </p>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary-500/5 to-transparent -translate-x-full group-hover/insight:translate-x-full transition-transform duration-1000" />
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5 my-3">
          {skills.slice(0, 3).map((skill: string, i: number) => (
            <span key={i} className="px-2 py-0.5 bg-background border border-border/30 rounded-lg text-[9px] font-bold text-text-muted uppercase tracking-wider">
              {skill}
            </span>
          ))}
          {skills.length > 3 && (
            <span className="text-[9px] font-black text-primary-400/60 self-center ml-1">
              +{skills.length - 3} more
            </span>
          )}
        </div>
      )}

      {/* Meta */}
      <div className="flex items-center gap-3 mt-1 mb-4">
        <div className="flex items-center gap-1 text-[10px] font-bold text-text-secondary">
          <MapPin size={11} className="text-primary-400" />
          {location}
        </div>
        <div className="h-1 w-1 rounded-full bg-border flex-shrink-0" />
        <div className="flex items-center gap-1 text-[10px] font-bold text-emerald-400">
          <DollarSign size={11} />
          {salary}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-auto pt-4 border-t border-border/30 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <ApplyWithAIBtn
            job={targetJob}
            creditsRemaining={userCredits}
            isPremium={userIsPremium}
            onCreditsUsed={onCreditsUsed}
          />
          <button
            onClick={handleSave}
            className={cn(
              "w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 transform-gpu active:scale-90",
              saved
                ? "bg-primary-500/20 text-primary-400 border border-primary-500/30 shadow-glow"
                : "bg-surface border border-border/50 text-text-muted hover:text-text hover:border-border"
            )}
            title={saved ? 'Bookmarked' : 'Bookmark'}
          >
            {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
          </button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSelect(targetJob)}
          className="group/details font-black text-[10px] uppercase tracking-widest text-text-secondary hover:text-white"
        >
          View Role
          <ChevronRight size={13} className="ml-1 group-hover/details:translate-x-1 transition-transform" />
        </Button>
      </div>
    </Card>
  );
};

export default JobCard;
