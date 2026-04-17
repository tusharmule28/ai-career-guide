'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles, Check, Zap, Rocket, ShieldCheck } from 'lucide-react';
import Button from './ui/Button';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UpgradeModal({ isOpen, onClose }: UpgradeModalProps) {
  const benefits = [
    { title: 'Unlimited AI Applications', icon: Zap, color: 'text-amber-400' },
    { title: 'Priority Neural Matching', icon: Sparkles, color: 'text-indigo-400' },
    { title: 'Ghost-Writing AI Agent', icon: ShieldCheck, color: 'text-emerald-400' },
    { title: 'Direct Recruiter Referrals', icon: Rocket, color: 'text-violet-400' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-lg bg-surface border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden isolate"
          >
            {/* Background Glows */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-indigo-500/20 rounded-full blur-[80px] -z-10" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-violet-500/20 rounded-full blur-[80px] -z-10" />

            <div className="p-8 md:p-12">
              <button
                onClick={onClose}
                className="absolute top-8 right-8 text-text-muted hover:text-white transition-colors"
              >
                <X size={24} />
              </button>

              <div className="mb-10 text-center">
                <div className="w-20 h-20 bg-indigo-500/10 text-indigo-400 rounded-[2rem] flex items-center justify-center mx-auto mb-6 shadow-xl border border-indigo-500/20">
                  <Sparkles size={40} className="animate-pulse" />
                </div>
                <h2 className="text-4xl font-black text-white tracking-tighter mb-4">Elevate Your Trajectory</h2>
                <p className="text-text-secondary font-bold text-lg leading-relaxed">
                  Your free trial has provided max synergy. Upgrade to <span className="text-white">Elite Tier</span> for unlimited mission execution.
                </p>
              </div>

              <div className="space-y-4 mb-12">
                {benefits.map((benefit, i) => (
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 * i }}
                    key={i}
                    className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl border border-white/5 group hover:bg-white/10 transition-all cursor-default"
                  >
                    <div className={`w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center shrink-0 shadow-inner ${benefit.color}`}>
                      <benefit.icon size={20} />
                    </div>
                    <span className="text-sm font-black text-white tracking-tight">{benefit.title}</span>
                    <Check size={18} className="ml-auto text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-col gap-4">
                <Button size="lg" className="h-16 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 font-extrabold text-white shadow-glow-indigo border-none hover:scale-[1.02] transition-transform">
                  UPGRADE TO ELITE — $29/mo
                </Button>
                <p className="text-[10px] text-center text-text-muted font-black uppercase tracking-[0.2em]">
                  Join 1,200+ elite professionals
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
