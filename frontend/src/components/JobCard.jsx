import React from 'react';
import { Briefcase, MapPin, DollarSign, Clock, CheckCircle2, ChevronRight, Bookmark } from 'lucide-react';
import Card from './ui/Card';
import Button from './ui/Button';
import ScoreBadge from './ui/ScoreBadge';

const JobCard = ({ job, onSelect }) => {
  // Safe extraction with fallbacks
  const title = job.title || 'Untitled Role';
  const company = job.company || 'Confidential Company';
  const location = job.location || 'Remote';
  const salary = job.salary_range || '$80,000 - $120,000';
  const matchScore = job.score || job.matchScore || 85;
  const source = job.source || null;
  const applyUrl = job.apply_url || '#';

  return (
    <Card className="glass-card p-6 flex flex-col h-full hover:shadow-premium border-slate-200/50 hover:border-accent-200 transition-smooth group">
      <div className="flex justify-between items-start mb-5">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2 py-0.5 bg-accent-50 text-accent-700 text-[10px] font-bold uppercase tracking-wider rounded-md border border-accent-100/50">
              {job.work_type || 'Full-time'}
            </span>
            {source && (
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                via {source}
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-slate-900 group-hover:text-accent-700 transition-colors line-clamp-1 mb-1 leading-tight">{title}</h2>
          <div className="flex items-center gap-1.5 text-sm font-medium text-slate-500">
             <Briefcase size={14} className="text-slate-400" />
             <span>{company}</span>
          </div>
        </div>
        <ScoreBadge score={matchScore} size="lg" />
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50/50 px-2.5 py-1 rounded-lg border border-slate-100">
          <MapPin size={15} className="text-accent-500" />
          <span>{location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-500 bg-slate-50/50 px-2.5 py-1 rounded-lg border border-slate-100">
          <DollarSign size={15} className="text-emerald-500" />
          <span>{salary}</span>
        </div>
      </div>

      <div className="mt-auto pt-5 border-t border-slate-100 flex items-center justify-between gap-3">
        <div className="flex gap-2">
          {applyUrl !== '#' && (
            <a href={applyUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" size="sm" className="h-9 px-4 font-bold text-xs border-slate-200 hover:border-accent-300 hover:text-accent-700">
                Apply
              </Button>
            </a>
          )}
          <Button variant="ghost" size="sm" className="w-9 h-9 p-0 text-slate-400 hover:text-accent-600 hover:bg-accent-50 hidden sm:flex border border-transparent hover:border-accent-100">
            <Bookmark size={18} />
          </Button>
        </div>
        <Button 
          variant="accent"
          size="sm" 
          onClick={() => onSelect(job)}
          className="h-9 font-bold text-xs shadow-sm hover:shadow-glow"
        >
          View Details
          <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-smooth" />
        </Button>
      </div>
    </Card>
  );
};

export default JobCard;
