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
    <div className="bg-surface/30 backdrop-blur-md border border-border/50 rounded-3xl p-6 mb-8 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
        {/* Keyword Search */}
        <div className="md:col-span-1">
          <Input
            label="Search Jobs"
            placeholder="Role, company, or skills..."
            icon={Search}
            value={filters.q}
            onChange={(e) => handleChange('q', e.target.value)}
            className="w-full"
          />
        </div>

        {/* Location Filter */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1 mb-2 block">
            Location
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors">
              <MapPin size={18} />
            </div>
            <select
              className="w-full bg-surface border border-border rounded-xl py-3 pl-11 pr-4 text-sm font-semibold text-text outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all appearance-none cursor-pointer"
              value={filters.location}
              onChange={(e) => handleChange('location', e.target.value)}
            >
              <option value="All">All Locations</option>
              <option value="Remote">Remote</option>
              <option value="Bangalore">Bangalore</option>
              <option value="San Francisco">San Francisco</option>
              <option value="London">London</option>
              <option value="Hyderabad">Hyderabad</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none border-t-4 border-t-slate-400 border-x-4 border-x-transparent" />
          </div>
        </div>

        {/* Job Type Filter */}
        <div>
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider ml-1 mb-2 block">
            Job Type
          </label>
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-indigo-400 transition-colors">
              <Briefcase size={18} />
            </div>
            <select
              className="w-full bg-surface border border-border rounded-xl py-3 pl-11 pr-4 text-sm font-semibold text-text outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all appearance-none cursor-pointer"
              value={filters.job_type}
              onChange={(e) => handleChange('job_type', e.target.value)}
            >
              <option value="All">All Types</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Internship">Internship</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none border-t-4 border-t-slate-400 border-x-4 border-x-transparent" />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            variant="ghost"
            className="flex-1 h-12 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10 transition-all"
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
