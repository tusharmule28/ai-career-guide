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
    <Card className="flex flex-col h-full hover:border-primary/20 bg-white shadow-sm hover:shadow-card-hover transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900 line-clamp-1 mb-1">{title}</h2>
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
             <div className="bg-primary/5 px-2 py-0.5 rounded-lg">{company}</div>
             {source && (
               <div className="bg-gray-100 text-gray-400 px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider font-bold">
                 via {source}
               </div>
             )}
          </div>
        </div>
        <ScoreBadge score={matchScore} />
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <MapPin size={16} className="text-gray-400" />
          <span>{location}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <DollarSign size={16} className="text-gray-400" />
          <span>{salary}</span>
        </div>
      </div>

      <div className="mt-auto pt-4 border-t border-gray-50 flex items-center justify-between">
        <div className="flex gap-2">
          {applyUrl !== '#' && (
            <a href={applyUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="text-xs font-bold border-primary/20 text-primary hover:bg-primary/5 px-4">
                Apply
              </Button>
            </a>
          )}
          <Button variant="ghost" size="sm" className="p-2 text-gray-400 hover:text-primary hidden sm:flex">
            <Bookmark size={18} />
          </Button>
        </div>
        <Button 
          size="sm" 
          onClick={() => onSelect(job)}
          className="group font-bold text-xs"
        >
          Details
          <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-smooth" />
        </Button>
      </div>
    </Card>
  );
};

export default JobCard;
