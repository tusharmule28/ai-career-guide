'use client';

import React, { useState } from 'react';
import { X, Sparkles, Loader2, AlertCircle, Copy, Check, FileText, User2, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import Button, { cn } from './ui/Button';
import { toast } from 'react-hot-toast';
import { Job } from '@/types/job';

interface CoverLetterModalProps {
  isOpen: boolean;
  onClose: () => void;
  job: Job;
}

interface CoverLetterResult {
  cover_letter: string;
  top_skills_to_highlight?: string[];
  pre_fill_data?: Record<string, any>;
}

const CoverLetterModal: React.FC<CoverLetterModalProps> = ({ isOpen, onClose, job }) => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CoverLetterResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const generate = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const data = await api.post(`/explanations/cover-letter/${job.id}`);
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Strategy generation failed. Please re-sync.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (result?.cover_letter) {
      navigator.clipboard.writeText(result.cover_letter);
      setCopied(true);
      toast.success('Bespoke letter copied to clipboard!');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-background border border-white/10 rounded-[2.5rem] shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-8 border-b border-border/50 flex items-center justify-between bg-surface/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 premium-gradient text-white rounded-2xl flex items-center justify-center shadow-glow">
                  <FileText size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight">AI Cover Letter</h3>
                  <p className="text-xs font-bold text-text-muted uppercase tracking-widest">{job.title} at {job.company}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-surface rounded-xl transition-smooth text-text-muted hover:text-white border border-transparent hover:border-border"
              >
                <X size={20} />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
              {!result && !loading && !error && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="w-24 h-24 bg-primary-500/10 text-primary-400 rounded-[2rem] flex items-center justify-center mb-8 shadow-inner border border-primary-500/20"
                  >
                    <Sparkles size={40} className="animate-pulse" />
                  </motion.div>
                  <h4 className="text-3xl font-black text-white mb-4 tracking-tight">Draft Strategic Letter</h4>
                  <p className="text-text-secondary max-w-md mx-auto mb-10 leading-relaxed font-bold">
                    Our AI will craft a high-conversion cover letter by correlating your unique career trajectory with this specific role requirements.
                  </p>
                  <Button onClick={generate} size="lg" className="h-16 px-12 rounded-2xl font-black shadow-glow transform transition-transform hover:scale-105 active:scale-95">
                    <Sparkles size={20} className="mr-2" />
                    Generate Letter
                  </Button>
                </div>
              )}

              {loading && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="relative mb-8">
                    <Loader2 size={48} className="text-primary-500 animate-spin" />
                    <Sparkles size={16} className="text-accent-400 absolute top-0 right-0 animate-pulse" />
                  </div>
                  <p className="text-white text-xl font-black tracking-tight mb-2">Synthesizing Narrative...</p>
                  <p className="text-text-muted text-sm font-bold uppercase tracking-widest">Bridging professional experience with market needs</p>
                </div>
              )}

              {error && (
                <div className="py-12 px-8 bg-rose-500/5 rounded-[2rem] border border-rose-500/20 flex flex-col items-center text-center gap-4">
                  <AlertCircle className="text-rose-500" size={32} />
                  <div>
                    <h4 className="font-black text-rose-500 uppercase tracking-widest text-sm mb-2">Synthesis Interrupted</h4>
                    <p className="text-text-secondary text-sm font-medium mb-8 leading-relaxed max-w-sm">{error}</p>
                    <Button variant="danger" size="sm" className="rounded-xl px-10" onClick={generate}>Retry Protocol</Button>
                  </div>
                </div>
              )}

              {result && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  {/* Generated Text */}
                  <div>
                    <div className="flex items-center justify-between mb-6">
                      <h4 className="text-xs font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
                        <FileText size={16} className="text-primary-400" /> Professional Letter
                      </h4>
                      <button
                        onClick={handleCopy}
                        className={cn(
                          "flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                          copied
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "bg-surface border border-border/50 text-text-muted hover:text-white hover:border-border"
                        )}
                      >
                        {copied ? <Check size={14} /> : <Copy size={14} />}
                        {copied ? 'Copied' : 'Copy Payload'}
                      </button>
                    </div>
                    <div className="bg-surface/30 border border-border/50 rounded-3xl p-8 shadow-inner group transition-smooth hover:border-primary-500/20">
                      <p className="text-text-secondary text-sm leading-[1.8] whitespace-pre-wrap font-medium selection:bg-primary-500/20">
                        {result.cover_letter}
                      </p>
                    </div>
                  </div>

                  {/* Skills Grid */}
                  {result.top_skills_to_highlight && result.top_skills_to_highlight.length > 0 && (
                    <div>
                      <h4 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                        <Sparkles size={16} className="text-accent-400" /> Strategic Anchors
                      </h4>
                      <div className="flex flex-wrap gap-2.5">
                        {result.top_skills_to_highlight.map((skill, i) => (
                          <span key={i} className="px-4 py-2 bg-accent-500/5 text-accent-400 border border-accent-500/20 text-[10px] font-black uppercase tracking-widest rounded-xl">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Pre-fill Grid */}
                  {result.pre_fill_data && (
                    <div className="pt-6 border-t border-border/50">
                      <h4 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                        <User2 size={16} className="text-primary-400" /> Application Data
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {Object.entries(result.pre_fill_data).map(([key, value]) => value ? (
                          <div key={key} className="p-5 bg-surface/30 border border-border/30 rounded-2xl group hover:border-primary-500/30 transition-smooth">
                            <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.15em] mb-1.5 leading-none">
                              {key.replace(/_/g, ' ')}
                            </p>
                            <p className="text-xs font-black text-text-secondary truncate">{String(value)}</p>
                          </div>
                        ) : null)}
                      </div>
                    </div>
                  )}

                  {/* Footer Action */}
                  <div className="flex justify-center pt-8">
                    <Button variant="ghost" size="sm" onClick={generate} className="text-[10px] font-black uppercase tracking-widest text-text-muted hover:text-primary-400 transition-colors">
                      <RefreshCw size={14} className="mr-2" /> Re-synthesize Alternative Narrative
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-8 border-t border-border/50 bg-surface/50 flex justify-end">
              <Button onClick={onClose} variant="secondary" className="px-10 h-14 rounded-2xl font-black text-sm uppercase tracking-widest">
                Close Narrative
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default CoverLetterModal;
