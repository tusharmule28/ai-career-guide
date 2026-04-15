import React from 'react';
import { Filter } from 'lucide-react';
import Button from './ui/Button';

const JobFilterBar = ({ filters, setFilters, onReset }) => {
  return (
    <div className="flex flex-wrap items-center gap-4 mb-10 pb-6 border-b border-slate-100">
      <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest mr-2">
        <Filter size={14} />
        Filters
      </div>
      
      <select 
        className="bg-slate-50 border-none text-[11px] font-bold rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-accent-500/20 text-slate-600 cursor-pointer transition-all hover:bg-slate-100"
        value={filters.location}
        onChange={(e) => setFilters({...filters, location: e.target.value})}
      >
        <option value="All">All Locations</option>
        <option value="Remote">Remote Only</option>
        <option value="India">India</option>
        <option value="San Francisco">San Francisco</option>
        <option value="New York">New York</option>
        <option value="London">London</option>
      </select>

      <select 
        className="bg-slate-50 border-none text-[11px] font-bold rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-accent-500/20 text-slate-600 cursor-pointer transition-all hover:bg-slate-100"
        value={filters.experience}
        onChange={(e) => setFilters({...filters, experience: e.target.value})}
      >
        <option value="All">Experience Level</option>
        <option value="Entry">Entry Level</option>
        <option value="Mid">Mid-Level</option>
        <option value="Senior">Senior Level</option>
        <option value="Lead">Lead/Director</option>
      </select>

      <select 
        className="bg-slate-50 border-none text-[11px] font-bold rounded-lg px-4 py-2 outline-none focus:ring-2 focus:ring-accent-500/20 text-slate-600 cursor-pointer transition-all hover:bg-slate-100"
        value={filters.jobType}
        onChange={(e) => setFilters({...filters, jobType: e.target.value})}
      >
        <option value="All">Job Type</option>
        <option value="Full-time">Full-time</option>
        <option value="Contract">Contract</option>
        <option value="Part-time">Part-time</option>
        <option value="Internship">Internship</option>
      </select>

      <Button 
        variant="ghost" 
        size="sm" 
        className="text-[11px] font-bold text-slate-400 hover:text-accent-600 ml-auto"
        onClick={onReset}
      >
        Reset All
      </Button>
    </div>
  );
};

export default JobFilterBar;
