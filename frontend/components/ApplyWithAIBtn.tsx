'use client';

import React, { useState } from 'react';
import { Sparkles, X, Loader2, CheckCircle, AlertCircle, Crown, ChevronDown, ChevronUp, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { ApplyWithAIResult, Job } from '@/types/job';
import Button, { cn } from './ui/Button';

interface ApplyWithAIBtnProps {
  job: Job;
  creditsRemaining: number;
  isPremium: boolean;
  onCreditsUsed?: (newCount: number) => void;
}

type ModalState = 'idle' | 'loading' | 'success' | 'error' | 'no_credits';

const MatchGauge: React.FC<{ score: number }> = ({ score }) => {
  const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444';
  const circumference = 2 * Math.PI * 36;
  const strokeDash = (score / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center">
      <svg width="90" height="90" viewBox="0 0 90 90">
        <circle cx="45" cy="45" r="36" fill="none" stroke="#1e293b" strokeWidth="8" />
        <motion.circle
          initial={{ strokeDasharray: `0 ${circumference}` }}
          animate={{ strokeDasharray: `${strokeDash} ${circumference}` }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          cx="45" cy="45" r="36"
          fill="none"
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          transform="rotate(-90 45 45)"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-white">{score}</span>
        <span className="text-[10px] text-slate-400">/ 100</span>
      </div>
      <span className="text-xs text-slate-400 mt-1">Match Score</span>
    </div>
  );
};

const SkillBadge: React.FC<{ label: string; variant: 'match' | 'gap' }> = ({ label, variant }) => (
  <span className={cn(
    "px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-smooth",
    variant === 'match' 
      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
      : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
  )}>
    {label}
  </span>
);

const ApplyWithAIModal: React.FC<{
  result: ApplyWithAIResult;
  job: Job;
  onClose: () => void;
}> = ({ result, job, onClose }) => {
  const [coverLetterExpanded, setCoverLetterExpanded] = useState(true);
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.cover_letter);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-background border border-border/50 rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 sm:p-8 border-b border-border/50 bg-surface/50 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="premium-gradient p-2 rounded-xl text-white">
                <Sparkles size={20} />
            </div>
            <h2 className="text-xl font-black text-white tracking-tight">AI Strategy Session</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl text-text-muted hover:bg-surface hover:text-text transition-smooth border border-transparent hover:border-border">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar space-y-8">
          {/* Job + Match Score */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 p-6 bg-surface/30 rounded-3xl border border-border/30">
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-lg font-black text-white mb-1">{job.title}</h3>
              <p className="text-sm font-bold text-primary-400 mb-3">{job.company}</p>
              <p className="text-xs text-text-secondary leading-relaxed max-w-sm italic">
                "{result.match_rationale}"
              </p>
            </div>
            <div className="shrink-0">
                <MatchGauge score={result.match_score} />
            </div>
          </div>

          {/* Skills Analysis */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 bg-emerald-500/5 rounded-3xl border border-emerald-500/10">
              <p className="text-[10px] font-black text-emerald-400 mb-4 flex items-center gap-2 uppercase tracking-widest">
                <CheckCircle size={14} /> Critical Strengths
              </p>
              <div className="flex flex-wrap gap-2">
                {result.matched_skills.length ? result.matched_skills.map(s => (
                  <SkillBadge key={s} label={s} variant="match" />
                )) : <span className="text-xs text-text-muted">No specific matches identified</span>}
              </div>
            </div>
            <div className="p-5 bg-rose-500/5 rounded-3xl border border-rose-500/10">
              <p className="text-[10px] font-black text-rose-400 mb-4 flex items-center gap-2 uppercase tracking-widest">
                <AlertCircle size={14} /> Growth Opportunities
              </p>
              <div className="flex flex-wrap gap-2">
                {result.missing_skills.length ? result.missing_skills.map(s => (
                  <SkillBadge key={s} label={s} variant="gap" />
                )) : <span className="text-xs text-emerald-400 font-bold">Absolute Perfection!</span>}
              </div>
            </div>
          </div>

          {/* Cover Letter */}
          <div className="bg-surface/50 rounded-3xl border border-border/50 overflow-hidden group">
            <div
              className="flex items-center justify-between p-5 cursor-pointer select-none hover:bg-surface transition-colors"
              onClick={() => setCoverLetterExpanded(!coverLetterExpanded)}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary-500/10 text-primary-400 flex items-center justify-center">
                    <Sparkles size={16} />
                </div>
                <span className="text-sm font-black text-white">AI Bespoke Cover Letter</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={(e) => { e.stopPropagation(); handleCopy(); }}
                  className="px-3 py-1.5 rounded-xl bg-primary-500/20 hover:bg-primary-500/30 text-primary-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all"
                >
                  {copied ? <>Copied!</> : <><Copy size={12} /> Copy</>}
                </button>
                {coverLetterExpanded ? <ChevronUp size={20} className="text-text-muted" /> : <ChevronDown size={20} className="text-text-muted" />}
              </div>
            </div>
            <AnimatePresence>
              {coverLetterExpanded && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-5 pb-5 overflow-hidden"
                >
                  <div className="p-5 bg-background/50 rounded-2xl border border-border/30 text-sm text-text-secondary whitespace-pre-wrap font-medium leading-[1.8] selected:bg-primary-500/10 select-all">
                    {result.cover_letter}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Pre-fill Data */}
          <div>
            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest mb-4 ml-2">Smart Application Payload</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {Object.entries(result.pre_fill_data).filter(([, v]) => v).map(([key, value]) => (
                <div key={key} className="bg-surface/30 rounded-2xl p-4 border border-border/50 group hover:border-primary-500/30 transition-smooth">
                  <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] mb-1 leading-none">{key.replace(/_/g, ' ')}</p>
                  <p className="text-sm text-text font-bold truncate leading-tight">{String(value)}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 py-6 bg-surface/50 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center transition-all",
                result.credits_remaining === -1 ? "bg-amber-500/10 text-amber-400" : "bg-primary-500/10 text-primary-400"
            )}>
                {result.credits_remaining === -1 ? <Crown size={18} /> : <Sparkles size={16} />}
            </div>
            <p className="text-sm font-black text-text-secondary leading-none">
              {result.credits_remaining === -1
                ? 'Unlimited Elite Access'
                : `${result.credits_remaining} Search Credits Remaining`}
            </p>
          </div>
          <Button
            className="w-full sm:w-auto px-8 rounded-2xl font-black bg-white text-black hover:bg-slate-200"
            onClick={async () => {
              // Trigger tracking in our system first
              const store = (await import('@/lib/store/jobStore')).useJobStore.getState();
              await store.applyToJob(job.id || (job as any).job_id);
              // Then open external link
              window.open(job.apply_url, '_blank');
              onClose();
            }}
          >
            Submit Application →
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

const ApplyWithAIBtn: React.FC<ApplyWithAIBtnProps> = ({
  job,
  creditsRemaining,
  isPremium,
  onCreditsUsed,
}) => {
  const [modalState, setModalState] = useState<ModalState>('idle');
  const [result, setResult] = useState<ApplyWithAIResult | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  const hasAccess = isPremium || creditsRemaining > 0;

  const handleClick = async () => {
    if (!hasAccess) {
      setModalState('no_credits');
      return;
    }
    setModalState('loading');
    try {
      const targetJobId = job.id || (job as any).job_id;
      const data = await api.post('/agent/apply-with-ai', { job_id: targetJobId }) as ApplyWithAIResult;
      setResult(data);
      setModalState('success');
      if (onCreditsUsed && data.credits_remaining !== -1) {
        onCreditsUsed(data.credits_remaining);
      }
    } catch (err: any) {
      if (err.message?.includes('402') || err.message?.toLowerCase().includes('credit')) {
        setModalState('no_credits');
      } else {
        setErrorMsg(err.message || 'Something went wrong.');
        setModalState('error');
      }
    }
  };

  return (
    <>
      <button
        onClick={handleClick}
        disabled={modalState === 'loading'}
        className={cn(
            "relative group flex items-center gap-2.5 px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 isolate overflow-hidden shadow-soft transform-gpu",
            hasAccess 
                ? "bg-slate-900 text-white hover:text-white border border-white/5 active:scale-95" 
                : "bg-slate-800 text-slate-500 cursor-default grayscale"
        )}
      >
        {hasAccess && (
            <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
        )}
        
        {modalState === 'loading' ? (
          <Loader2 className="w-4 h-4 animate-spin text-primary-400" />
        ) : (
          <Sparkles className={cn("w-4 h-4 transition-transform group-hover:rotate-12", hasAccess ? "text-violet-400" : "text-slate-600")} />
        )}
        
        {modalState === 'loading' ? 'Analyzing Synergy...' : 'Optimize with AI'}

        {isPremium ? (
          <Crown className="w-4 h-4 text-amber-400 ml-1" />
        ) : (
          creditsRemaining > 0 && (
            <span className="ml-1 px-1.5 py-0.5 bg-violet-500/20 text-violet-400 text-[10px] rounded-md border border-violet-500/30">
                {creditsRemaining}X
            </span>
          )
        )}
      </button>

      <AnimatePresence>
        {/* Success Modal */}
        {modalState === 'success' && result && (
          <ApplyWithAIModal
            result={result}
            job={job}
            onClose={() => setModalState('idle')}
          />
        )}

        {/* No Credits Modal */}
        {modalState === 'no_credits' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setModalState('idle')}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 30 }}
              className="relative bg-background border border-amber-500/30 rounded-[3rem] p-10 max-w-sm w-full text-center shadow-2xl overflow-hidden"
            >
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/10 rounded-full blur-[80px]" />
              
              <div className="w-20 h-20 bg-amber-500/10 text-amber-400 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-inner border border-amber-500/20">
                <Crown size={40} />
              </div>
              <h3 className="text-2xl font-black text-white mb-3 tracking-tighter">Elite Access Required</h3>
              <p className="text-text-secondary text-sm font-medium mb-8 leading-relaxed">
                You've maximized your free strategy sessions. Upgrade to Elite for unlimited AI-powered applications and priority matching.
              </p>
              
              <div className="space-y-4">
                <Button className="w-full bg-amber-500 hover:bg-amber-400 text-black h-14 rounded-2xl font-black text-base shadow-xl shadow-amber-500/20">
                    Go Elite <span className="ml-2">👑</span>
                </Button>
                <button onClick={() => setModalState('idle')} className="w-full py-2 text-text-muted text-xs font-black uppercase tracking-widest hover:text-white transition-colors">
                  Continue as Free Member
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Error Modal */}
        {modalState === 'error' && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setModalState('idle')}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="relative bg-background border border-rose-500/30 rounded-[2.5rem] p-8 max-w-sm w-full text-center shadow-2xl"
            >
              <div className="w-14 h-14 bg-rose-500/10 text-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={30} />
              </div>
              <h3 className="text-xl font-black text-white mb-2 tracking-tight">Strategy Failed</h3>
              <p className="text-text-secondary text-sm font-medium mb-8 leading-relaxed">{errorMsg}</p>
              <Button onClick={() => setModalState('idle')} variant="secondary" className="w-full rounded-xl font-black text-xs uppercase h-12">
                Understood
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};

export default ApplyWithAIBtn;
