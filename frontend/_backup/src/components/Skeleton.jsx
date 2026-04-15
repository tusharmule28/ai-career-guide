import React from 'react';

const Skeleton = ({ className = '', variant = 'rectangular' }) => {
  const baseStyles = 'skeleton-pulse';
  
  const variants = {
    rectangular: 'rounded-xl',
    circular: 'rounded-full',
    text: 'rounded h-4 w-full',
  };

  return (
    <div className={`${baseStyles} ${variants[variant]} ${className}`} />
  );
};

export const JobCardSkeleton = () => (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/50 p-6 shadow-soft overflow-hidden">
      <div className="flex justify-between items-start mb-5">
        <div className="space-y-3 flex-1">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <Skeleton className="h-8 w-16" variant="rectangular" />
      </div>
      <div className="flex gap-3 mb-6">
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-24" />
      </div>
      <div className="flex items-center justify-between mt-auto pt-5 border-t border-slate-50">
        <div className="flex gap-2">
            <Skeleton className="w-8 h-8 rounded-lg" />
            <Skeleton className="w-8 h-8 rounded-lg" />
        </div>
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>
    </div>
);

export default Skeleton;
