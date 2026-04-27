'use client';

import React from 'react';
import { Search, MapPin, Briefcase, FilterX } from 'lucide-react';
import Input from './ui/Input';
import Button, { cn } from './ui/Button';

interface JobSearchFilterProps {
  onFilterChange: (filters: { q: string; location: string; job_type: string }) => void;
  filters: { q: string; location: string; job_type: string };
  isSearching?: boolean;
}

const JobSearchFilter: React.FC<JobSearchFilterProps> = ({ 
  onFilterChange, 
  filters,
  isSearching = false
}) => {
  const handleChange = (name: string, value: string) => {
    onFilterChange({ ...filters, [name]: value });
  };

  const handleReset = () => {
    onFilterChange({ q: '', location: 'All', job_type: 'All' });
  };

  return (
    <div className="bg-surface/40 backdrop-blur-md border border-border/50 rounded-[2rem] p-6 mb-8 shadow-premium animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        {/* Keyword Search */}
        <div className="md:col-span-1">
          <Input
            label="Protocol Search"
            placeholder="Role, company, or tech..."
            icon={Search}
            value={filters.q}
            onChange={(e) => handleChange('q', e.target.value)}
            className="w-full"
          />
        </div>

        {/* Location Filter */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
            Sector / Region
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors">
              <MapPin size={18} />
            </div>
            <select
              className="w-full bg-surface border border-border rounded-xl py-3 pl-11 pr-4 text-sm font-bold text-text outline-none focus:ring-4 focus:ring-primary-400/10 focus:border-primary-400 transition-all appearance-none cursor-pointer"
              value={filters.location}
              onChange={(e) => handleChange('location', e.target.value)}
            >
              <option value="All">Global Matrix</option>
              <option value="Remote">Remote Protocol</option>
              <option value="Bangalore">Bangalore Hub</option>
              <option value="San Francisco">SF Sector</option>
              <option value="London">London Node</option>
              <option value="Hyderabad">Hyderabad Node</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none border-t-4 border-t-slate-400 border-x-4 border-x-transparent" />
          </div>
        </div>

        {/* Job Type Filter */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1 mb-2 block">
            Engagement Type
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors">
              <Briefcase size={18} />
            </div>
            <select
              className="w-full bg-surface border border-border rounded-xl py-3 pl-11 pr-4 text-sm font-bold text-text outline-none focus:ring-4 focus:ring-primary-400/10 focus:border-primary-400 transition-all appearance-none cursor-pointer"
              value={filters.job_type}
              onChange={(e) => handleChange('job_type', e.target.value)}
            >
              <option value="All">All Modalities</option>
              <option value="Full-time">Full-time Core</option>
              <option value="Part-time">Part-time Fragment</option>
              <option value="Contract">Strategic Contract</option>
              <option value="Internship">Apprentice Stream</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none border-t-4 border-t-slate-400 border-x-4 border-x-transparent" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="ghost"
            className="flex-1 h-12 rounded-xl text-[10px] font-black uppercase tracking-widest text-rose-400/60 hover:text-rose-400 hover:bg-rose-500/5 transition-all"
            onClick={handleReset}
          >
            <FilterX size={16} className="mr-2" /> Reset
          </Button>
        </div>
      </div>
    </div>
  );
};

export default JobSearchFilter;
