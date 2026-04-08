import React from 'react';
import { Briefcase, MapPin, DollarSign, ChevronRight, Bookmark, Sparkles } from 'lucide-react';
import Card from './ui/Card';
import Button from './ui/Button';
import ScoreBadge from './ui/ScoreBadge';

const JobCard = ({ job, onSelect, highlight }) => {
  const title = job.title || 'Untitled Role';
  const company = job.company || 'Confidential Company';
  const location = job.location || 'Remote';
  const salary = job.salary_range || 'Competitive';
  const matchScore = job.score || job.matchScore || 0;
  const source = job.source || null;
  const applyUrl = job.apply_url || '#';

  return (
    <Card className={`glass-card p-6 flex flex-col h-full transition-smooth group relative overflow-hidden ${
      highlight 
        ? 'shadow-premium border-accent-300 ring-1 ring-accent-400/20 bg-accent-50/10' 
        : 'hover:shadow-premium border-slate-200/50 hover:border-accent-200'
    }`}>
      {/* AI Sparkle Decor for Matches */}
      {highlight && (
        <div className="absolute top-0 right-0 p-3 text-accent-500 animate-pulse">
          <Sparkles size={16} />
        </div>
      )}
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-accent-500/5 rounded-full blur-2xl group-hover:bg-accent-500/10 transition-colors pointer-events-none"></div>

      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider rounded-md border ${
              highlight 
                ? 'bg-accent-600 text-white border-accent-600' 
                : 'bg-slate-100 text-slate-600 border-slate-200/50'
            }`}>
              {highlight ? 'Perfect Match' : (job.work_type || 'Full-time')}
            </span>
            {source && (
              <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                • {source}
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-accent-700 transition-colors line-clamp-1 leading-tight mb-1">
            {title}
          </h3>
          <div className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
             <Briefcase size={14} className="text-slate-400" />
             <span>{company}</span>
          </div>
        </div>
        <ScoreBadge score={matchScore} size="md" />
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
          <MapPin size={12} className="text-accent-500" />
          <span>{location}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-500 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100">
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
          <Button variant="ghost" size="sm" className="w-8 h-8 p-0 text-slate-400 hover:text-accent-600 hover:bg-accent-50 border border-transparent hover:border-accent-100">
            <Bookmark size={14} />
          </Button>
        </div>
        <Button 
          variant="accent"
          size="sm" 
          onClick={() => onSelect(job)}
          className="h-8 px-4 text-[11px] font-bold shadow-sm hover:shadow-glow"
        >
          View Details
          <ChevronRight size={14} className="ml-1 group-hover:translate-x-0.5 transition-smooth" />
        </Button>
      </div>
    </Card>
  );
};

export default JobCard;
