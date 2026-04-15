import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Zap, Search, Sparkles, MapPin, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SyncStatusOverlayProps {
    isVisible: boolean;
}

const STAGES = [
    { id: 'init', label: 'Initializing Neural Uplink', icon: Zap },
    { id: 'search', label: 'Scanning Targeted Sectors', icon: MapPin },
    { id: 'matching', label: 'Aggregating Market Intelligence', icon: Search },
    { id: 'scoring', label: 'AI Synthesis & Scoring', icon: Sparkles },
    { id: 'finish', label: 'Match Matrix Recalibrated', icon: CheckCircle2 },
];

export const SyncStatusOverlay: React.FC<SyncStatusOverlayProps> = ({ isVisible }) => {
    const [stageIndex, setStageIndex] = useState(0);

    useEffect(() => {
        if (isVisible) {
            setStageIndex(0);
            const interval = setInterval(() => {
                setStageIndex((prev) => (prev < STAGES.length - 1 ? prev + 1 : prev));
            }, 3500);
            return () => clearInterval(interval);
        }
    }, [isVisible]);

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-md"
                >
                    <div className="max-w-md w-full bg-slate-900 border border-white/10 rounded-[2.5rem] p-10 shadow-22xl relative overflow-hidden text-center">
                        {/* Background Decoration */}
                        <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" />
                        <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-violet-500/10 rounded-full blur-3xl animate-pulse" />

                        <div className="relative z-10 flex flex-col items-center">
                            <div className="mb-8 relative">
                                <div className="absolute inset-0 bg-indigo-500/20 blur-xl rounded-full" />
                                <div className="relative w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center shadow-glow-indigo animate-float">
                                    <Loader2 className="text-white animate-spin" size={32} />
                                </div>
                            </div>

                            <motion.h2 
                                key={STAGES[stageIndex].id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-2xl font-black text-white tracking-tighter mb-4"
                            >
                                {STAGES[stageIndex].label}
                            </motion.h2>

                            <p className="text-text-muted text-xs font-bold uppercase tracking-[0.2em] mb-10">
                                Segment {stageIndex + 1} of {STAGES.length}
                            </p>

                            <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-10">
                                <motion.div 
                                    className="h-full bg-indigo-500 shadow-glow-indigo"
                                    initial={{ width: '0%' }}
                                    animate={{ width: `${((stageIndex + 1) / STAGES.length) * 100}%` }}
                                    transition={{ duration: 0.5 }}
                                />
                            </div>

                            <div className="flex flex-col gap-4 w-full">
                                {STAGES.map((stage, idx) => (
                                    <div 
                                        key={stage.id} 
                                        className={cn(
                                            "flex items-center gap-4 transition-all duration-500",
                                            idx === stageIndex ? "opacity-100 translate-x-1" : 
                                            idx < stageIndex ? "opacity-40" : "opacity-20"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-8 h-8 rounded-lg flex items-center justify-center border",
                                            idx === stageIndex ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-400 shadow-glow-indigo" :
                                            idx < stageIndex ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-white/5 border-white/5 text-text-muted"
                                        )}>
                                            <stage.icon size={14} />
                                        </div>
                                        <span className={cn(
                                            "text-[10px] font-black uppercase tracking-widest",
                                            idx === stageIndex ? "text-white" : "text-text-muted"
                                        )}>
                                            {stage.label}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="mt-12 pt-8 border-t border-white/5">
                            <p className="text-[10px] font-bold text-text-muted italic">
                                "Optimizing for low-resource environments. This may take up to 60 seconds."
                            </p>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
