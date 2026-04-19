'use client';

import React, { useEffect, useState } from 'react';
import { CheckCircle2, XCircle, TrendingUp, Sparkles } from 'lucide-react';
import { api } from '@/lib/api';
import { cn } from '@/components/ui/Button';
import { motion } from 'framer-motion';

interface SkillData {
  matched: string[];
  missing: string[];
  total_required: number;
}

export default function SkillGapInsights() {
  const [data, setData] = useState<SkillData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    api.get('/dashboard/skill-gap')
      .then((res) => {
        if (res && (res.matched || res.missing)) {
          setData(res);
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  if (error && !loading) return null;

  const matchRatio = data
    ? Math.round((data.matched.length / Math.max(data.total_required || (data.matched.length + data.missing.length), 1)) * 100)
    : 0;

  const barColor =
    matchRatio >= 75 ? 'from-emerald-500 to-green-400' :
    matchRatio >= 50 ? 'from-amber-500 to-yellow-400' :
    'from-rose-500 to-red-400';

  return (
    <div className="p-6 bg-surface/30 border border-border/50 rounded-[2rem] space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2.5">
        <div className="w-9 h-9 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-xl flex items-center justify-center shrink-0">
          <TrendingUp size={17} strokeWidth={2.5} />
        </div>
        <div>
          <h3 className="text-sm font-black text-white tracking-tight leading-none">Skill Gap Insights</h3>
          <p className="text-[10px] text-text-muted font-bold mt-0.5">Based on your top matches</p>
        </div>
        <div className="ml-auto">
          <Sparkles size={14} className="text-violet-400 animate-pulse" />
        </div>
      </div>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-2 bg-white/5 rounded-full" />
          <div className="flex flex-wrap gap-1.5">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-6 w-16 bg-white/5 rounded-lg" />
            ))}
          </div>
        </div>
      ) : data ? (
        <>
          {/* Progress bar */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-black text-text-muted uppercase tracking-widest">Skill Coverage</span>
              <span className={cn(
                "text-xs font-black tabular-nums",
                matchRatio >= 75 ? 'text-emerald-400' : matchRatio >= 50 ? 'text-amber-400' : 'text-rose-400'
              )}>
                {matchRatio}%
              </span>
            </div>
            <div className="h-2 bg-slate-800/60 rounded-full overflow-hidden border border-white/5">
              <motion.div
                className={cn("h-full rounded-full bg-gradient-to-r", barColor)}
                initial={{ width: 0 }}
                animate={{ width: `${matchRatio}%` }}
                transition={{ duration: 1.0, ease: 'easeOut', delay: 0.2 }}
              />
            </div>
          </div>

          {/* Matched skills */}
          {data.matched.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <CheckCircle2 size={12} className="text-emerald-400" />
                <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">You Have ({data.matched.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {data.matched.slice(0, 6).map((skill, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.05 * i }}
                    className="px-2.5 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-bold rounded-lg tracking-wide"
                  >
                    {skill}
                  </motion.span>
                ))}
                {data.matched.length > 6 && (
                  <span className="text-[10px] text-text-muted font-bold self-center">+{data.matched.length - 6}</span>
                )}
              </div>
            </div>
          )}

          {/* Missing skills */}
          {data.missing.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 mb-2">
                <XCircle size={12} className="text-rose-400" />
                <span className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Gap Skills ({data.missing.length})</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {data.missing.slice(0, 5).map((skill, i) => (
                  <motion.span
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.05 * i + 0.2 }}
                    className="px-2.5 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-300 text-[10px] font-bold rounded-lg tracking-wide"
                  >
                    {skill}
                  </motion.span>
                ))}
                {data.missing.length > 5 && (
                  <span className="text-[10px] text-text-muted font-bold self-center">+{data.missing.length - 5} more</span>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        <p className="text-[10px] text-text-muted font-bold italic">
          Upload your resume to see skill gap analysis.
        </p>
      )}
    </div>
  );
}
