import React from 'react';
import { Sparkles } from 'lucide-react';

const ScoreBadge = ({ score, size = 'md' }) => {
  const getColors = (s) => {
    if (s >= 80) return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    if (s >= 60) return 'bg-amber-50 text-amber-700 border-amber-100';
    return 'bg-rose-50 text-rose-700 border-rose-100';
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs font-bold',
    lg: 'px-4 py-1.5 text-sm font-extrabold',
  };

  return (
    <div className={`
      inline-flex items-center gap-1.5 rounded-xl border shadow-sm
      ${getColors(score)} 
      ${sizes[size]}
    `}>
      <Sparkles size={size === 'lg' ? 14 : 12} className="opacity-70" />
      {score}% Match
    </div>
  );
};

export default ScoreBadge;
