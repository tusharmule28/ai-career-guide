import React, { useState } from 'react';
import { Briefcase, MapPin, DollarSign, ChevronRight, Bookmark, BookmarkCheck, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../utils/api';
import Card from './ui/Card';
import Button from './ui/Button';
import { ApplyWithAIBtn } from './ApplyWithAIBtn';
import type { Job } from '../types/api';

interface JobCardProps {
  job: any; // raw API payload — may be a MatchResult or a Job
  onSelect: (job: Job) => void;
  highlight?: boolean;
  userIsPremium?: boolean;
  userCredits?: number;
  onCreditsUsed?: (newCount: number) => void;
}

/** Thin animated progress bar for match score */
const MatchBar: React.FC<{ score: number }> = ({ score }) => {
  const color =
    score >= 80 ? 'from-emerald-500 to-green-400' :
    score >= 60 ? 'from-amber-500 to-yellow-400' :
    'from-rose-500 to-red-400';

  return (
    <div className="flex items-center gap-2 mt-1">
      <div className="flex-1 h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${color} transition-all duration-700`}
          style={{ width: `${Math.min(score, 100)}%` }}
        />
      </div>
      <span className={`text-xs font-bold tabular-nums bg-gradient-to-r ${color} bg-clip-text text-transparent`}>
        {score}%
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
  const salary =
    targetJob.salary_min && targetJob.salary_max
      ? `$${Number(targetJob.salary_min).toLocaleString()} – $${Number(targetJob.salary_max).toLocaleString()}`
      : targetJob.salary_min
      ? `From $${Number(targetJob.salary_min).toLocaleString()}`
      : 'Competitive';

  const matchScore: number = job.score || targetJob.score || 0;
  const source = targetJob.source || null;
  const applyUrl = targetJob.apply_url || '#';
  const jobId = targetJob.id;
  const matchReason = job.match_reason || targetJob.match_reason || null;

  const handleSave = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await api.post(`/jobs/${jobId}/save`, {});
      setSaved(true);
      toast.success('Job saved to your list!');
    } catch {
      toast.error('Could not save job.');
    }
  };

  return (
    <Card className={`group relative flex flex-col h-full border transition-all duration-300 overflow-hidden bg-surface/40 hover:bg-surface/60 border-border/50 hover:border-border/80 ${
      highlight ? 'ring-1 ring-primary-500/30 shadow-glow' : ''
    }`}>
      {highlight && (
        <div className="absolute top-3 right-3 text-primary-400 animate-pulse">
          <Sparkles size={14} />
        </div>
      )}

      {/* Top */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 pr-4">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md ${
              highlight ? 'bg-primary-500/10 text-primary-300 border border-primary-500/20' : 'bg-surface text-text-muted border border-border/50'
            }`}>
              {highlight ? '✦ AI Match' : (targetJob.work_type || 'Full-time')}
            </span>
            {source && (
              <span className="text-[9px] text-text-muted font-medium uppercase tracking-widest">
                {source}
              </span>
            )}
          </div>

          <h3 className="text-base font-bold text-text group-hover:text-primary-300 transition-colors line-clamp-1 leading-snug">
            {title}
          </h3>

          <div className="flex items-center gap-1.5 text-xs text-text-secondary mt-0.5">
            {targetJob.company_logo ? (
              <img src={targetJob.company_logo} alt={company} className="w-4 h-4 rounded object-contain" />
            ) : (
              <Briefcase size={11} className="text-text-muted shrink-0" />
            )}
            <span className="truncate font-medium">{company}</span>
          </div>
        </div>
      </div>

      {/* Match score bar */}
      {matchScore > 0 && (
        <div className="mb-3">
          <p className="text-[10px] text-slate-500 font-medium mb-0.5">Match score</p>
          <MatchBar score={matchScore} />
        </div>
      )}

      {/* AI match reason */}
      {matchReason && (
        <div className="flex items-start gap-1.5 mb-3 px-2.5 py-2 bg-primary-500/5 border border-primary-500/10 rounded-lg">
          <Sparkles size={11} className="text-primary-400 mt-0.5 shrink-0" />
          <p className="text-[10px] text-primary-200/60 leading-tight">{matchReason}</p>
        </div>
      )}

      {/* Meta pills */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        <div className="inline-flex items-center gap-1 text-[10px] font-medium text-text-secondary bg-surface/50 px-2 py-1 rounded-lg border border-border/50">
          <MapPin size={10} className="text-primary-400" />
          {location}
        </div>
        <div className="inline-flex items-center gap-1 text-[10px] font-medium text-text-secondary bg-surface/50 px-2 py-1 rounded-lg border border-border/50">
          <DollarSign size={10} className="text-emerald-400" />
          {salary}
        </div>
      </div>

      {/* Actions */}
      <div className="mt-auto pt-3 border-t border-slate-800 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex gap-2 items-center">
          <ApplyWithAIBtn
            job={targetJob}
            creditsRemaining={userCredits}
            isPremium={userIsPremium}
            onCreditsUsed={onCreditsUsed}
          />
          <button
            onClick={handleSave}
            className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${
              saved ? 'text-primary-400 bg-primary-500/10 border border-primary-500/20' : 'text-text-muted hover:text-primary-400 hover:bg-surface border border-border/50'
            }`}
            title={saved ? 'Saved!' : 'Save job'}
          >
            {saved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
          </button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSelect(targetJob)}
          className="h-8 px-3 text-xs font-semibold text-text-secondary hover:text-text border-border hover:border-border/80 hover:bg-surface"
        >
          Details
          <ChevronRight size={13} className="ml-1 group-hover:translate-x-0.5 transition-transform" />
        </Button>
      </div>
    </Card>
  );
};

export default JobCard;
