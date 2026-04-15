import React from 'react';
import { Sparkles } from 'lucide-react';
import { cn } from './Button';

interface ScoreBadgeProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
}

const ScoreBadge: React.FC<ScoreBadgeProps> = ({ score, size = 'md' }) => {
  const getColors = (s: number) => {
    if (s >= 80) return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-500/5';
    if (s >= 60) return 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-amber-500/5';
    return 'bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-rose-500/5';
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs font-bold',
    lg: 'px-4 py-1.5 text-sm font-extrabold',
  };

  return (
    <div className={cn(
      "inline-flex items-center gap-1.5 rounded-xl border shadow-sm",
      getColors(score),
      sizes[size]
    )}>
      <Sparkles size={size === 'lg' ? 14 : 12} className="opacity-70" />
      {score}% Match
    </div>
  );
};

export default ScoreBadge;
