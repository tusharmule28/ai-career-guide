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
  const matchScore = job.match_score || 85;

  return (
    <Card className="flex flex-col h-full hover:border-primary/20 bg-white shadow-sm hover:shadow-card-hover transition-all duration-300">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-gray-900 line-clamp-1 mb-1">{title}</h2>
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
             <div className="bg-primary/5 px-2 py-0.5 rounded-lg">{company}</div>
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
        <div className="flex -space-x-2">
          {/* Mock applied users icons */}
          <div className="w-6 h-6 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-[10px] text-gray-500 font-bold">JD</div>
          <div className="w-6 h-6 rounded-full bg-primary/10 border-2 border-white flex items-center justify-center text-[10px] text-primary font-bold">AI</div>
          <div className="w-6 h-6 rounded-full bg-gray-50 border-2 border-white flex items-center justify-center text-[10px] text-gray-400">+12</div>
        </div>
        <div className="flex gap-2">
          <Button variant="ghost" size="sm" className="p-2 text-gray-400 hover:text-primary">
            <Bookmark size={18} />
          </Button>
          <Button 
            size="sm" 
            onClick={() => onSelect(job)}
            className="group font-bold"
          >
            Details
            <ChevronRight size={16} className="ml-1 group-hover:translate-x-1 transition-smooth" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default JobCard;
