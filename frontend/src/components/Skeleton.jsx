import React from 'react';

const Skeleton = ({ className = '', variant = 'rectangular' }) => {
  const baseStyles = 'bg-gray-100 animate-pulse';
  
  const variants = {
    rectangular: 'rounded-lg',
    circular: 'rounded-full',
    text: 'rounded h-4 w-full',
  };

  return (
    <div className={`${baseStyles} ${variants[variant]} ${className}`} />
  );
};

export const JobCardSkeleton = () => (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm animate-pulse">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <Skeleton className="h-6 w-16 circular" />
      </div>
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
        <div className="flex -space-x-2">
            <Skeleton className="w-6 h-6 circular" />
            <Skeleton className="w-6 h-6 circular" />
        </div>
        <Skeleton className="h-8 w-24" />
      </div>
    </div>
);

export default Skeleton;
