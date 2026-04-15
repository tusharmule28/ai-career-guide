import React, { useState } from 'react';
import { X, Sparkles, Loader2, AlertCircle, Copy, Check, FileText, User2, Link2 } from 'lucide-react';
import { api } from '../utils/api';
import Button from './ui/Button';
import { toast } from 'react-hot-toast';

const CoverLetterModal = ({ isOpen, onClose, job }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await api.post(`/explanations/cover-letter/${job.id || job.job_id}`);
      setResult(data);
    } catch (err) {
      setError(err.message || 'Failed to generate. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result?.cover_letter) {
      navigator.clipboard.writeText(result.cover_letter);
      setCopied(true);
      toast.success('Cover letter copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (!isOpen || !job) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-gradient-to-r from-accent-50 to-indigo-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent-600 text-white rounded-xl flex items-center justify-center shadow-glow shadow-accent-500/30">
              <FileText size={20} />
            </div>
            <div>
              <h3 className="text-xl font-extrabold text-slate-900">AI Cover Letter</h3>
              <p className="text-sm text-slate-500 font-medium">{job.title} at {job.company}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/60 rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {!result && !loading && !error && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <div className="w-20 h-20 bg-accent-50 text-accent-500 rounded-3xl flex items-center justify-center mb-6 shadow-lg">
                <Sparkles size={36} />
              </div>
              <h4 className="text-2xl font-extrabold text-slate-900 mb-3">Generate Your Cover Letter</h4>
              <p className="text-slate-500 max-w-sm mb-8 leading-relaxed font-medium">
                Our AI will craft a tailored cover letter and pre-fill data based on your resume and this job.
              </p>
              <Button onClick={generate} className="h-12 px-10 font-bold rounded-xl shadow-glow shadow-accent-500/20">
                <Sparkles size={18} className="mr-2" />
                Generate with AI
              </Button>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Loader2 size={40} className="text-accent-500 animate-spin mb-4" />
              <p className="text-slate-700 font-bold">Crafting your personalized letter...</p>
              <p className="text-slate-400 text-sm mt-2">Analyzing your resume against the job requirements</p>
            </div>
          )}

          {error && (
            <div className="py-8 px-6 bg-red-50 rounded-2xl border border-red-100 flex items-start gap-4">
              <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={24} />
              <div>
                <h4 className="font-bold text-red-900 mb-1">Generation Failed</h4>
                <p className="text-red-700 text-sm">{error}</p>
                <Button variant="secondary" size="sm" className="mt-4" onClick={generate}>Retry</Button>
              </div>
            </div>
          )}

          {result && (
            <div className="space-y-6 animate-fade-in">
              {/* Cover Letter */}
              <div className="relative">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <FileText size={16} className="text-accent-600" /> Cover Letter
                  </h4>
                  <button
                    onClick={handleCopy}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      copied ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600 hover:bg-accent-100 hover:text-accent-700'
                    }`}
                  >
                    {copied ? <Check size={13} /> : <Copy size={13} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
                  <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                    {result.cover_letter}
                  </p>
                </div>
              </div>

              {/* Skills to Highlight */}
              {result.top_skills_to_highlight?.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <Sparkles size={16} className="text-amber-500" /> Top Skills to Highlight
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {result.top_skills_to_highlight.map((skill, i) => (
                      <span key={i} className="px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-100 text-xs font-bold rounded-lg">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Pre-fill Data */}
              {result.pre_fill_data && (
                <div>
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-widest mb-3 flex items-center gap-2">
                    <User2 size={16} className="text-indigo-500" /> Application Pre-fill Data
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(result.pre_fill_data).map(([key, value]) => value ? (
                      <div key={key} className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-xl">
                        <p className="text-[9px] font-bold text-indigo-400 uppercase tracking-widest mb-1">
                          {key.replace(/_/g, ' ')}
                        </p>
                        <p className="text-xs font-bold text-slate-700 line-clamp-2">{value}</p>
                      </div>
                    ) : null)}
                  </div>
                </div>
              )}

              {/* Regenerate */}
              <div className="pt-4 border-t border-slate-100">
                <Button variant="ghost" size="sm" onClick={generate} className="text-slate-400 hover:text-accent-600 font-bold">
                  <Sparkles size={14} className="mr-1.5" /> Regenerate
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <Button onClick={onClose} className="px-8 h-11 font-bold rounded-xl">Close</Button>
        </div>
      </div>
    </div>
  );
};

export default CoverLetterModal;
