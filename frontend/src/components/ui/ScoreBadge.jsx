import React from 'react';

const ScoreBadge = ({ score, size = 'md' }) => {
  const getColors = (s) => {
    if (s >= 80) return 'bg-green-100 text-green-700 border-green-200';
    if (s >= 60) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-red-100 text-red-700 border-red-200';
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-sm font-semibold',
    lg: 'px-4 py-1.5 text-base font-bold',
  };

  return (
    <div className={`
      inline-flex items-center rounded-full border 
      ${getColors(score)} 
      ${sizes[size]}
    `}>
      {score}% Match
    </div>
  );
};

export default ScoreBadge;
