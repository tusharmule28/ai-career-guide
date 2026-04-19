'use client';

import React, { useState, useEffect } from 'react';
import { X, Sparkles, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import Button, { cn } from './ui/Button';

interface GapAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AnalysisResult {
  readiness_score: number;
  improvement_suggestions: string[];
  missing_keywords: string[];
  structural_feedback: string;
}

const GapAnalysisModal: React.FC<GapAnalysisModalProps> = ({ isOpen, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      handleAnalyze();
    }
  }, [isOpen]);

  const handleAnalyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/resumes/gap-analysis');
      setAnalysis(response);
    } catch (err: any) {
      setError(err.message || 'Failed to analyze resume gap.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
            onClick={onClose}
          />
          
          {/* Modal Container */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-background border border-white/10 rounded-[2.5rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-8 border-b border-border/50 flex items-center justify-between bg-surface/50">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 premium-gradient text-white rounded-2xl flex items-center justify-center shadow-glow">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white tracking-tight">Resume Analysis</h3>
                  <p className="text-xs font-bold text-text-muted uppercase tracking-widest">Market Readiness Review</p>
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
              {loading ? (
                <div className="py-24 flex flex-col items-center justify-center text-center">
                  <div className="relative mb-8">
                    <Loader2 size={48} className="text-primary-500 animate-spin" />
                    <Sparkles size={16} className="text-accent-400 absolute top-0 right-0 animate-pulse" />
                  </div>
                  <p className="text-white text-lg font-black tracking-tight mb-2">Analyzing professional footprint...</p>
                  <p className="text-text-muted text-sm font-medium">Correlating skills with multi-dimensional market demands</p>
                </div>
              ) : error ? (
                <div className="py-12 px-8 bg-rose-500/5 rounded-[2rem] border border-rose-500/20 flex flex-col items-center text-center gap-4">
                  <AlertCircle className="text-rose-500" size={32} />
                  <div>
                    <h4 className="font-black text-rose-500 uppercase tracking-widest text-sm mb-2">Analysis Protocol Iteration Failed</h4>
                    <p className="text-text-secondary text-sm font-medium mb-6">{error}</p>
                    <Button variant="danger" size="sm" className="rounded-xl px-8" onClick={handleAnalyze}>Retry Sync</Button>
                  </div>
                </div>
              ) : analysis ? (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                  {/* Score Card */}
                  <div className="flex items-center justify-between p-8 bg-surface rounded-[2rem] border border-white/5 relative overflow-hidden group">
                    <div className="relative z-10">
                      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted mb-2">Match Readiness</p>
                      <p className="text-5xl font-black text-white tracking-tighter">{analysis.readiness_score}%</p>
                    </div>
                    <div className="relative z-10 flex flex-col items-end">
                       <div className="h-2 w-40 bg-background rounded-full overflow-hidden mb-3 border border-white/5">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${analysis.readiness_score}%` }}
                            transition={{ duration: 1.5, ease: "easeOut" }}
                            className="h-full premium-gradient shadow-glow" 
                          />
                       </div>
                       <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest">Optimized</p>
                    </div>
                    {/* Decorative Blur */}
                    <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl group-hover:bg-primary-500/20 transition-colors" />
                  </div>

                  {/* Suggestions */}
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                      <div className="w-8 h-8 bg-primary-500/10 text-primary-400 rounded-xl flex items-center justify-center text-xs">01</div>
                      Key Suggestions
                    </h4>
                    <div className="space-y-3">
                      {analysis.improvement_suggestions?.map((item, i) => (
                        <div key={i} className="p-5 bg-surface/30 border border-border/50 rounded-2xl text-sm text-text-secondary leading-relaxed flex gap-4 hover:border-primary-500/30 transition-smooth group">
                          <div className="mt-1.5 w-1.5 h-1.5 bg-primary-500 rounded-full shrink-0 group-hover:scale-125 transition-transform" />
                          <span className="font-medium">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Missing Keywords */}
                  <div>
                    <h4 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6 flex items-center gap-3">
                       <div className="w-8 h-8 bg-accent-500/10 text-accent-400 rounded-xl flex items-center justify-center text-xs">02</div>
                       Missing Strategic Keywords
                    </h4>
                    <div className="flex flex-wrap gap-2.5">
                      {analysis.missing_keywords?.map((keyword, i) => (
                        <span key={i} className="px-4 py-2 bg-background text-text-secondary text-[11px] font-black rounded-xl border border-border/50 hover:border-accent-500/40 hover:text-accent-400 transition-smooth cursor-default">
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Structural Feedback */}
                  <div className="p-8 bg-primary-500/5 rounded-[2.5rem] border border-primary-500/10 relative overflow-hidden">
                    <h4 className="text-xs font-black text-primary-400 uppercase tracking-[0.2em] flex items-center gap-3 mb-4">
                       <CheckCircle2 size={18} /> Analysis Summary
                    </h4>
                    <p className="text-text-secondary text-sm font-medium leading-relaxed italic">
                        "{analysis.structural_feedback}"
                    </p>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Footer */}
            <div className="p-8 border-t border-border/50 bg-surface/50 flex justify-end">
              <Button onClick={onClose} variant="secondary" className="px-10 h-14 rounded-2xl font-black text-sm uppercase tracking-widest">
                Close Analysis
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default GapAnalysisModal;
