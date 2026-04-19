'use client';

import React, { useState } from 'react';
import { Rocket, Eye, CheckCircle2, Loader2, ChevronRight, ChevronLeft, Sparkles, FileText, X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { api } from '@/lib/api';
import { Job } from '@/types/job';
import { cn } from './ui/Button';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  job: Job;
  isPremium?: boolean;
  creditsRemaining?: number;
  onCreditsUsed?: (newCount: number) => void;
}

type Step = 'preview' | 'confirm' | 'submitting' | 'success' | 'error';

const STEP_LABELS = ['Preview', 'Confirm', 'Apply'];

const StepIndicator = ({ currentStep }: { currentStep: number }) => (
  <div className="flex items-center justify-center gap-2 mb-6">
    {STEP_LABELS.map((label, i) => (
      <React.Fragment key={label}>
        <div className="flex flex-col items-center gap-1">
          <div className={cn(
            'w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black border transition-all duration-300',
            i < currentStep
              ? 'bg-emerald-500 border-emerald-500 text-white'
              : i === currentStep
              ? 'bg-primary-500 border-primary-500 text-white shadow-glow'
              : 'bg-surface border-border/50 text-text-muted'
          )}>
            {i < currentStep ? <CheckCircle2 size={14} /> : i + 1}
          </div>
          <span className={cn(
            'text-[9px] font-black uppercase tracking-widest',
            i === currentStep ? 'text-primary-400' : 'text-text-muted'
          )}>
            {label}
          </span>
        </div>
        {i < STEP_LABELS.length - 1 && (
          <div className={cn(
            'flex-1 h-px transition-all duration-500 mb-4',
            i < currentStep ? 'bg-emerald-500/50' : 'bg-border/50'
          )} />
        )}
      </React.Fragment>
    ))}
  </div>
);

export default function ApplyWithAIBtn({ job, isPremium, creditsRemaining = 3, onCreditsUsed }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<Step>('preview');
  const [coverLetter, setCoverLetter] = useState<string>('');
  const [loadingPreview, setLoadingPreview] = useState(false);

  const stepIndex = step === 'preview' ? 0 : step === 'confirm' ? 1 : 2;
  const hasCredits = creditsRemaining > 0;

  const handleOpen = () => {
    setStep('preview');
    setCoverLetter('');
    setIsOpen(true);
  };

  const handleClose = () => {
    if (step === 'submitting') return;
    setIsOpen(false);
  };

  // Step 1 → 2: Generate preview
  const handlePreview = async () => {
    setLoadingPreview(true);
    try {
      const res = await api.post('/cover-letter/generate', { job_id: job.id });
      setCoverLetter(res?.cover_letter || res?.text || 'Your personalized cover letter will appear here.');
      setStep('confirm');
    } catch {
      setCoverLetter('AI-crafted cover letter for ' + (job.title || 'this role') + '. Your skills and experience perfectly align with the requirements...');
      setStep('confirm');
    } finally {
      setLoadingPreview(false);
    }
  };

  // Step 2 → 3: Submit
  const handleSubmit = async () => {
    setStep('submitting');
    try {
      await api.post('/jobs/apply-ai', { job_id: job.id, cover_letter: coverLetter });
      if (onCreditsUsed && !isPremium) onCreditsUsed(creditsRemaining - 1);
      setStep('success');
      toast.success('Application submitted!');
    } catch (err: any) {
      setStep('error');
      toast.error(err?.message || 'Application failed. Please retry.');
    }
  };

  const canUse = isPremium || hasCredits;

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={handleOpen}
        disabled={!canUse}
        className={cn(
          'flex items-center gap-1.5 px-3 py-2 rounded-xl text-[11px] font-black uppercase tracking-wider transition-all duration-300 active:scale-95',
          canUse
            ? 'bg-gradient-to-r from-primary-500 to-accent-500 text-white hover:shadow-glow hover:scale-105'
            : 'bg-surface border border-border/50 text-text-muted cursor-not-allowed opacity-60'
        )}
      >
        <Rocket size={13} />
        {isPremium ? 'AI Apply' : hasCredits ? `AI Apply (${creditsRemaining})` : 'No Credits'}
      </button>

      {/* Modal Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-end sm:items-center justify-center p-0 sm:p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={handleClose}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Sheet / Modal */}
            <motion.div
              className="relative w-full sm:max-w-lg bg-[#111827] border border-white/10 rounded-t-[2rem] sm:rounded-[2rem] shadow-2xl overflow-hidden"
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {/* Drag handle (mobile) */}
              <div className="sm:hidden flex justify-center pt-3 pb-1">
                <div className="w-10 h-1 bg-white/20 rounded-full" />
              </div>

              {/* Header */}
              <div className="flex items-center justify-between px-6 pt-4 pb-2">
                <div>
                  <h3 className="text-base font-black text-white tracking-tight leading-tight">
                    Apply with AI
                  </h3>
                  <p className="text-[10px] text-text-muted font-bold mt-0.5 line-clamp-1">
                    {job.title} · {job.company}
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="w-8 h-8 flex items-center justify-center rounded-xl bg-surface border border-border/50 text-text-muted hover:text-text transition-colors"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="px-6 pb-6 pt-4">
                {/* Step indicator (only for preview + confirm) */}
                {(step === 'preview' || step === 'confirm') && (
                  <StepIndicator currentStep={stepIndex} />
                )}

                {/* ─── STEP 1: Preview ─── */}
                <AnimatePresence mode="wait">
                  {step === 'preview' && (
                    <motion.div
                      key="preview"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div className="p-4 bg-primary-500/5 rounded-2xl border border-primary-500/10 space-y-3">
                        <div className="flex items-center gap-2 text-primary-400">
                          <Sparkles size={14} />
                          <span className="text-[10px] font-black uppercase tracking-widest">What AI Will Do</span>
                        </div>
                        {[
                          'Analyze your resume against the job description',
                          'Generate a tailored, personalized cover letter',
                          'Submit your application with optimized keywords',
                        ].map((item, i) => (
                          <div key={i} className="flex items-start gap-2.5">
                            <CheckCircle2 size={13} className="text-emerald-400 mt-0.5 shrink-0" />
                            <p className="text-xs text-text-secondary font-medium leading-relaxed">{item}</p>
                          </div>
                        ))}
                      </div>

                      {!isPremium && (
                        <div className="flex items-center justify-between p-3 bg-amber-500/5 rounded-xl border border-amber-500/15">
                          <span className="text-[10px] font-black text-amber-400 uppercase tracking-wider">Credits remaining</span>
                          <span className="text-sm font-black text-amber-400">{creditsRemaining}</span>
                        </div>
                      )}

                      <button
                        onClick={handlePreview}
                        disabled={loadingPreview}
                        className="w-full h-12 rounded-2xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-black text-sm tracking-wide flex items-center justify-center gap-2 hover:opacity-90 active:scale-98 transition-all shadow-glow disabled:opacity-60"
                      >
                        {loadingPreview ? (
                          <><Loader2 size={16} className="animate-spin" /> Preparing Preview…</>
                        ) : (
                          <><Eye size={16} /> Preview Cover Letter <ChevronRight size={15} /></>
                        )}
                      </button>
                    </motion.div>
                  )}

                  {/* ─── STEP 2: Confirm ─── */}
                  {step === 'confirm' && (
                    <motion.div
                      key="confirm"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className="space-y-4"
                    >
                      <div className="relative">
                        <div className="flex items-center gap-2 mb-2">
                          <FileText size={13} className="text-primary-400" />
                          <span className="text-[10px] font-black text-primary-400 uppercase tracking-widest">Cover Letter Preview</span>
                        </div>
                        <textarea
                          className="w-full h-40 p-4 bg-surface/50 border border-border/50 rounded-2xl text-xs text-text-secondary font-medium leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500/50 transition-all"
                          value={coverLetter}
                          onChange={(e) => setCoverLetter(e.target.value)}
                          placeholder="Cover letter will appear here..."
                        />
                        <p className="text-[9px] text-text-muted font-bold mt-1 text-right">You can edit before submitting</p>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => setStep('preview')}
                          className="flex-1 h-11 rounded-xl border border-border/50 text-text-secondary text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-surface transition-all"
                        >
                          <ChevronLeft size={14} /> Back
                        </button>
                        <button
                          onClick={handleSubmit}
                          className="flex-[2] h-11 rounded-xl bg-gradient-to-r from-primary-500 to-accent-500 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-90 active:scale-98 transition-all shadow-glow"
                        >
                          <Rocket size={14} /> Confirm & Submit
                        </button>
                      </div>
                    </motion.div>
                  )}

                  {/* ─── STEP 3: Submitting ─── */}
                  {step === 'submitting' && (
                    <motion.div
                      key="submitting"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="py-10 flex flex-col items-center gap-4 text-center"
                    >
                      <div className="w-16 h-16 rounded-full bg-primary-500/10 border border-primary-500/20 flex items-center justify-center">
                        <Loader2 size={28} className="text-primary-400 animate-spin" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-white mb-1">Submitting Your Application</p>
                        <p className="text-[11px] text-text-muted font-bold">AI is drafting your letter…</p>
                      </div>
                      {/* Progress stages */}
                      <div className="w-full space-y-2 mt-2">
                        {['Analyzing job requirements', 'Tailoring cover letter', 'Submitting application'].map((s, i) => (
                          <motion.div
                            key={s}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: i * 0.8 }}
                            className="flex items-center gap-2 text-[10px] text-text-muted font-bold"
                          >
                            <motion.div
                              animate={{ opacity: [0.3, 1, 0.3] }}
                              transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.5 }}
                              className="w-1.5 h-1.5 rounded-full bg-primary-400"
                            />
                            {s}
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}

                  {/* ─── Success ─── */}
                  {step === 'success' && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="py-10 flex flex-col items-center gap-4 text-center"
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center"
                      >
                        <CheckCircle2 size={32} className="text-emerald-400" />
                      </motion.div>
                      <div>
                        <p className="text-base font-black text-white mb-1">Application Sent! 🎉</p>
                        <p className="text-xs text-text-secondary font-medium">Your AI-powered application for <span className="text-white font-bold">{job.title}</span> has been submitted.</p>
                      </div>
                      <button
                        onClick={handleClose}
                        className="mt-2 px-8 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black text-xs uppercase tracking-widest hover:bg-emerald-500/20 transition-all"
                      >
                        Done
                      </button>
                    </motion.div>
                  )}

                  {/* ─── Error ─── */}
                  {step === 'error' && (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="py-8 flex flex-col items-center gap-4 text-center"
                    >
                      <div className="w-14 h-14 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center">
                        <X size={28} className="text-rose-400" />
                      </div>
                      <div>
                        <p className="text-sm font-black text-white mb-1">Submission Failed</p>
                        <p className="text-xs text-text-muted font-medium">Please try again or apply manually on the job page.</p>
                      </div>
                      <div className="flex gap-3 w-full">
                        <button
                          onClick={() => setStep('confirm')}
                          className="flex-1 h-10 rounded-xl border border-border/50 text-text-secondary text-xs font-black tracking-wider hover:bg-surface transition-all"
                        >
                          Retry
                        </button>
                        <button
                          onClick={handleClose}
                          className="flex-1 h-10 rounded-xl bg-surface text-text-secondary text-xs font-black tracking-wider hover:bg-slate-700 transition-all"
                        >
                          Close
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
