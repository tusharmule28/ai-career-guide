import React, { useState } from 'react';
import { Briefcase, MapPin, DollarSign, ChevronRight, Bookmark, BookmarkCheck, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '../utils/api';
import Card from './ui/Card';
import Button from './ui/Button';
import ScoreBadge from './ui/ScoreBadge';

const JobCard = ({ job, onSelect, highlight }) => {
  const [saved, setSaved] = useState(false);

  const targetJob = job.job || job;
  const title = targetJob.title || 'Untitled Role';
  const company = targetJob.company || 'Confidential Company';
  const location = targetJob.location || 'Remote';
  const salary = targetJob.salary_min && targetJob.salary_max
    ? `$${Number(targetJob.salary_min).toLocaleString()} – $${Number(targetJob.salary_max).toLocaleString()}`
    : targetJob.salary_min ? `From $${Number(targetJob.salary_min).toLocaleString()}`
    : 'Competitive';
    
  const matchScore = job.score || targetJob.score || targetJob.matchScore || 0;
  const source = targetJob.source || null;
  const applyUrl = targetJob.apply_url || '#';
  const jobId = targetJob.id || targetJob.job_id || job.id || job.job_id;
  const matchReason = job.match_reason || targetJob.match_reason || null;

  const handleSave = async (e) => {
    e.stopPropagation();
    try {
      await api.post(`/jobs/${jobId}/save`);
      setSaved(true);
      toast.success('Job saved to your list!');
    } catch (err) {
      toast.error('Could not save job.');
    }
  };

  return (
    <Card className={`group relative flex flex-col h-full bg-white/90 border border-slate-200/50 hover:border-primary-400/30 transition-all duration-500 overflow-hidden ${
      highlight 
        ? 'ring-2 ring-primary-500/20 bg-gradient-to-br from-primary-50/50 to-white' 
        : ''
    }`}>
      {/* AI Sparkle Decor for Matches */}
      {highlight && (
        <div className="absolute top-0 right-0 p-4 text-primary-500 animate-pulse">
          <Sparkles size={18} />
        </div>
      )}
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-accent-500/5 rounded-full blur-2xl group-hover:bg-accent-500/10 transition-colors pointer-events-none"></div>

      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-lg border ${
              highlight 
                ? 'bg-primary-600 text-white border-primary-600 shadow-sm' 
                : 'bg-slate-100 text-slate-500 border-slate-200/50'
            }`}>
              {highlight ? 'Premium Match' : (job.work_type || 'Full-time')}
            </span>
            {source && (
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                • {source}
              </span>
            )}
          </div>
          <h3 className="text-lg font-black text-slate-900 group-hover:text-primary-700 transition-colors line-clamp-1 leading-tight mb-2">
            {title}
          </h3>
          <div className="flex items-center gap-2 text-sm font-bold text-slate-500">
            {targetJob.company_logo ? (
              <img src={targetJob.company_logo} alt={company} className="w-5 h-5 rounded-lg object-contain bg-white shadow-soft" />
            ) : (
              <div className="w-5 h-5 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400">
                <Briefcase size={12} />
              </div>
            )}
            <span className="truncate">{company}</span>
          </div>
        </div>
        <ScoreBadge score={matchScore} size="md" />
      </div>

      {matchReason && (
        <div className="flex items-start gap-2 mb-4 p-2 bg-accent-50/50 rounded-lg border border-accent-100/50 relative overflow-hidden group/reason">
          <Sparkles size={12} className="text-accent-600 mt-0.5 shrink-0" />
          <p className="text-[10px] font-bold text-accent-700 leading-tight">
            Why this job? <span className="font-medium text-accent-600/80">{matchReason}</span>
          </p>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-6">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-black text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-xl border border-slate-100">
          <MapPin size={12} className="text-primary-500" />
          <span>{location}</span>
        </div>
        <div className="inline-flex items-center gap-1.5 text-[11px] font-black text-slate-500 bg-emerald-50/50 px-2.5 py-1.5 rounded-xl border border-emerald-100/50">
          <DollarSign size={12} className="text-emerald-500" />
          <span>{salary}</span>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-slate-100/50 flex items-center justify-between gap-3">
        <div className="flex gap-2">
          {applyUrl !== '#' && (
            <a href={applyUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm" className="h-8 px-3 text-[11px] font-bold border-slate-100 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-100">
                Apply
              </Button>
            </a>
          )}
          <Button
            variant="ghost" size="sm"
            className={`w-9 h-9 p-0 rounded-xl transition-all duration-300 ${
              saved ? 'text-primary-600 bg-primary-50 border border-primary-100' : 'text-slate-400 hover:text-primary-600 hover:bg-primary-50 hover:border-primary-100'
            }`}
            onClick={handleSave}
            title={saved ? 'Saved!' : 'Save job'}
          >
            {saved ? <BookmarkCheck size={16} /> : <Bookmark size={16} />}
          </Button>
        </div>
        <Button 
          variant="primary"
          size="sm" 
          onClick={() => onSelect(targetJob)}
          className="h-9 px-4 text-xs font-black shadow-soft hover:shadow-glow group/btn"
        >
          View Role
          <ChevronRight size={16} className="ml-1 group-hover/btn:translate-x-1 transition-transform" />
        </Button>
      </div>
    </Card>
  );
};

export default JobCard;
