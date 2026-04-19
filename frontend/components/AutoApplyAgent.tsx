'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Sparkles, 
  Zap, 
  CheckCircle2, 
  Search, 
  Send, 
  Bot, 
  AlertCircle,
  ChevronRight,
  Rocket
} from 'lucide-react';
import Card from './ui/Card';
import Button from './ui/Button';
import { api } from '@/lib/api';
import UpgradeModal from './UpgradeModal';
import { useAuth } from '@/lib/auth-context';

export default function AutoApplyAgent() {
  const { user, updateUser } = useAuth();
  const [status, setStatus] = useState<'idle' | 'analyzing' | 'matching' | 'applying' | 'completed'>('idle');
  const [results, setResults] = useState<{ jobs_applied: number, message: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const steps = [
    { id: 'analyzing', label: 'Analyzing Neural Resume', icon: Bot, color: 'text-indigo-400' },
    { id: 'matching', label: 'Matching High-Synergy Roles', icon: Search, color: 'text-violet-400' },
    { id: 'applying', label: 'Executing Mission Protocols', icon: Send, color: 'text-emerald-400' },
  ];

  const handleStartAgent = async () => {
    if (!user?.is_premium && (user?.trial_remaining ?? 0) <= 0) {
      setIsUpgradeModalOpen(true);
      return;
    }

    setStatus('analyzing');
    setError(null);

    try {
      // The backend adds delays locally for realism, so we just trigger the steps on specific intervals
      // to match the backend's behavior
      
      const res = await api.post('/agent/auto-apply', {});
      
      // Artificial delays for UI smoothness (total ~3.3s from backend + these)
      setTimeout(() => setStatus('matching'), 1500);
      setTimeout(() => setStatus('applying'), 2500);
      setTimeout(() => {
        setResults(res);
        setStatus('completed');
        // Re-sync user to reflect updated trial credits
        if (res?.trial_remaining !== undefined) {
          updateUser({ trial_remaining: res.trial_remaining });
        }
      }, 4000);

    } catch (err: any) {
      console.error("Agent failure:", err);
      if (err.status === 402) {
        setIsUpgradeModalOpen(true);
        setStatus('idle');
      } else {
        setError(err.message || "Neuro-link interference. Please retry.");
        setStatus('idle');
      }
    }
  };

  const resetAgent = () => {
    setStatus('idle');
    setResults(null);
  };

  return (
    <>
      <Card className="p-10 border-none bg-indigo-950/40 backdrop-blur-3xl border border-white/5 text-white rounded-[3rem] shadow-2xl relative overflow-hidden group isolate min-h-[400px] flex flex-col justify-center">
        <AnimatePresence mode="wait">
          {status === 'idle' && (
            <motion.div
              key="idle"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="relative z-10"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-14 h-14 bg-indigo-500/10 backdrop-blur-md rounded-2xl flex items-center justify-center shadow-inner border border-indigo-500/20 group-hover:scale-110 transition-transform duration-500">
                  <Sparkles size={28} className="text-indigo-400 animate-pulse" />
                </div>
                <div>
                   <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 block mb-1">Elite Protocol</span>
                   <h3 className="text-2xl font-black text-white leading-tight">AI Auto-Apply Agent</h3>
                </div>
              </div>
              
              <p className="text-white/70 text-sm font-medium mb-10 leading-relaxed max-w-sm">
                Enable our neural agent to monitor your trajectory and execute applications for high-synergy roles automatically.
              </p>

              <div className="flex items-center gap-4 mb-10">
                 <div className="flex -space-x-3">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-10 h-10 rounded-full border-2 border-indigo-900 bg-slate-800 flex items-center justify-center shadow-lg">
                        <Bot size={16} className="text-white/50" />
                      </div>
                    ))}
                 </div>
                 <p className="text-xs font-black text-white/40 uppercase tracking-widest">3 agents standby</p>
              </div>

              <div className="flex flex-col gap-4">
                <Button 
                  onClick={handleStartAgent}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-black h-16 rounded-2xl transition-all shadow-glow-indigo border-none group/btn"
                >
                  <span className="flex items-center justify-center gap-3">
                    ENABLE NEURAL AGENT <Zap size={18} className="group-hover:fill-current" />
                  </span>
                </Button>
                
                {!user?.is_premium && (
                  <p className="text-[10px] text-center text-text-muted font-black uppercase tracking-[0.2em]">
                    {user?.trial_remaining ?? 5} TRIAL RUNS REMAINING
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {status !== 'idle' && status !== 'completed' && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="relative z-10 space-y-12"
            >
              <div className="flex flex-col items-center text-center">
                <div className="relative mb-12">
                   <div className="w-24 h-24 bg-indigo-500/20 rounded-full animate-ping absolute inset-0" />
                   <div className="w-24 h-24 bg-indigo-500/10 backdrop-blur-xl rounded-full border-2 border-indigo-500/20 flex items-center justify-center relative shadow-2xl">
                     <Bot size={40} className="text-indigo-400" />
                   </div>
                </div>
                <h3 className="text-2xl font-black text-white mb-2">Neural Link Active</h3>
                <p className="text-text-muted text-xs font-bold uppercase tracking-widest">Processing mission parameters...</p>
              </div>

              <div className="space-y-6">
                {steps.map((step, i) => {
                  const isActive = status === step.id;
                  const isPast = steps.findIndex(s => s.id === status) > i;
                  
                  return (
                    <div key={step.id} className={`flex items-center gap-4 transition-all duration-500 ${isActive ? 'scale-105' : (isPast ? 'opacity-50' : 'opacity-30')}`}>
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${isActive || isPast ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-white/5 border-white/5'}`}>
                         {isPast ? <CheckCircle2 size={20} className="text-emerald-400" /> : <step.icon size={20} className={isActive ? step.color : 'text-white/20'} />}
                      </div>
                      <span className={`text-sm font-black tracking-tight ${isActive ? 'text-white' : 'text-white/60'}`}>{step.label}</span>
                      {isActive && <div className="ml-auto w-4 h-4 rounded-full border-2 border-t-indigo-400 border-white/10 animate-spin" />}
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {status === 'completed' && (
            <motion.div
              key="completed"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative z-10 text-center"
            >
              <div className="w-24 h-24 bg-emerald-500/20 rounded-full border-2 border-emerald-500/30 flex items-center justify-center mx-auto mb-8 shadow-glow-emerald">
                 <Rocket size={44} className="text-emerald-400" />
              </div>
              
              <h3 className="text-3xl font-black text-white mb-4">Mission Executed</h3>
              <p className="text-text-secondary font-bold text-lg mb-10 leading-relaxed mx-auto max-w-[280px]">
                {results?.message || `Successfully applied to ${results?.jobs_applied || 0} roles.`}
              </p>

              <div className="grid grid-cols-2 gap-4 mb-10">
                 <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Applied</p>
                    <p className="text-2xl font-black text-white">{results?.jobs_applied || 0}</p>
                 </div>
                 <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Matches</p>
                    <p className="text-2xl font-black text-white">88%</p>
                 </div>
              </div>

              <Button 
                onClick={resetAgent}
                variant="ghost"
                className="w-full h-14 rounded-2xl text-text-muted hover:text-white hover:bg-white/5 transition-all font-black text-xs uppercase tracking-[0.2em]"
              >
                Return to Command
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <div className="absolute bottom-8 left-8 right-8 p-4 bg-danger/10 border border-danger/20 rounded-2xl flex items-center gap-3">
            <AlertCircle size={20} className="text-danger shrink-0" />
            <p className="text-[10px] font-black text-danger uppercase tracking-wider">{error}</p>
          </div>
        )}

        {/* Shapes */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px] -z-10 group-hover:bg-indigo-500/20 transition-all duration-1000" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-violet-500/10 rounded-full blur-[80px] -z-10 group-hover:bg-violet-500/20 transition-all duration-1000" />
      </Card>

      <UpgradeModal 
        isOpen={isUpgradeModalOpen} 
        onClose={() => setIsUpgradeModalOpen(false)} 
      />
    </>
  );
}
