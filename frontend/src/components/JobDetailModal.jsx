import React from 'react';
import Modal from './ui/Modal';
import Button from './ui/Button';
import ScoreBadge from './ui/ScoreBadge';
import { Briefcase, MapPin, DollarSign, Clock, Sparkles, ShieldCheck, ExternalLink, Bookmark } from 'lucide-react';
import ExplanationPanel from './ExplanationPanel';
import SkillGap from './SkillGap';

const JobDetailModal = ({ isOpen, onClose, job }) => {
  if (!job) return null;

  const title = job.title || 'Untitled Role';
  const company = job.company || 'Confidential Company';
  const location = job.location || 'Remote';
  const salary = job.salary_range || 'Competitive';
  const matchScore = job.score || 0;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Job Details" maxWidth="max-w-5xl">
      <div className="flex flex-col">
        {/* Detail Header */}
        <div className="p-8 sm:p-10 bg-slate-50/50 border-b border-slate-100">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <span className="px-3 py-1 bg-accent-100 text-accent-700 text-[10px] font-black uppercase tracking-widest rounded-full border border-accent-200/50">
                  {job.work_type || 'Full-time'}
                </span>
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <Clock size={14} />
                  <span>Posted {new Date(job.posted_at).toLocaleDateString()}</span>
                </div>
              </div>
              
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight leading-tight mb-3">
                {title}
              </h2>
              <div className="flex items-center gap-2 text-lg font-bold text-slate-500">
                <Briefcase size={20} className="text-slate-400" />
                <span>{company}</span>
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-4 bg-white p-6 rounded-[2rem] shadow-premium border border-slate-100 min-w-[140px]">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none">Match Score</p>
              <ScoreBadge score={matchScore} size="lg" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-10">
            <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-accent-50 text-accent-600 flex items-center justify-center">
                    <MapPin size={20} />
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</p>
                    <p className="text-sm font-bold text-slate-900">{location}</p>
                </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <DollarSign size={20} />
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Salary Estimate</p>
                    <p className="text-sm font-bold text-slate-900">{salary}</p>
                </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-slate-50 text-slate-600 flex items-center justify-center">
                    <ShieldCheck size={20} />
                </div>
                <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verification</p>
                    <p className="text-sm font-bold text-slate-900">AI Verified Role</p>
                </div>
            </div>
          </div>
        </div>

        {/* Detail Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 p-8 sm:p-10">
          {/* Main Description */}
          <div className="lg:col-span-2 space-y-10">
            <div>
              <h4 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                <Briefcase size={20} className="text-accent-600" /> Job Description
              </h4>
              <div className="prose prose-slate max-w-none">
                <p className="text-slate-600 leading-relaxed font-medium whitespace-pre-wrap">
                  {job.description || "No detailed description available."}
                </p>
              </div>
            </div>

            <div>
              <h4 className="text-lg font-black text-slate-900 mb-6 flex items-center gap-2">
                <Sparkles size={20} className="text-accent-600" /> Required Skillsets
              </h4>
              <div className="flex flex-wrap gap-2">
                {(job.required_skills || []).map((skill, index) => (
                  <span 
                    key={index}
                    className="px-4 py-2 bg-slate-50 text-slate-700 text-xs font-bold rounded-xl border border-slate-100 hover:border-accent-300 transition-smooth"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* AI Insights Sidebar */}
          <div className="space-y-8">
            <ExplanationPanel jobId={job.id} jobTitle={job.title} />
            <SkillGap jobId={job.id} jobTitle={job.title} />

            <div className="p-1 bg-slate-900 rounded-[2rem] shadow-xl overflow-hidden">
                <div className="p-8 bg-slate-800 rounded-[1.8rem] border border-white/5 text-center">
                    <h5 className="text-white font-black mb-2">Ready to apply?</h5>
                    <p className="text-slate-400 text-xs font-medium mb-8">Direct application ensures your profile is prioritized by our system.</p>
                    <div className="flex flex-col gap-3">
                        <Button 
                            className="w-full h-12 rounded-xl font-black bg-accent-600 hover:bg-accent-700 shadow-glow"
                            onClick={() => window.open(job.apply_url, '_blank')}
                            icon={ExternalLink}
                        >
                            Apply Directly
                        </Button>
                        <Button 
                            variant="ghost"
                            className="w-full h-12 rounded-xl font-black text-white hover:bg-white/10"
                            icon={Bookmark}
                        >
                            Save for Later
                        </Button>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default JobDetailModal;
