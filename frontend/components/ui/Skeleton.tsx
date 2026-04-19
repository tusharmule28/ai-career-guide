import React from 'react';
import { cn } from './Button';

/* ─── Generic shimmer base ─── */
const Shimmer = ({ className }: { className?: string }) => (
  <div className={cn('skeleton-pulse rounded-xl bg-surface/40', className)} />
);

/* ─── JobCard skeleton ─── */
export const JobCardSkeleton = () => (
  <div className="rounded-[1.75rem] border border-border/30 bg-surface/20 p-6 flex flex-col gap-4 h-[280px]">
    {/* Header */}
    <div className="flex justify-between items-start gap-3">
      <div className="flex-1 space-y-2">
        <Shimmer className="h-3.5 w-16 rounded-md" />
        <Shimmer className="h-5 w-3/4" />
        <Shimmer className="h-3 w-1/2" />
      </div>
      {/* Circular score placeholder */}
      <div className="w-12 h-12 rounded-full skeleton-pulse bg-surface/40 shrink-0" />
    </div>
    {/* Match bar */}
    <Shimmer className="h-1.5 w-full rounded-full" />
    {/* Skills chips */}
    <div className="flex gap-1.5">
      <Shimmer className="h-5 w-14 rounded-lg" />
      <Shimmer className="h-5 w-16 rounded-lg" />
      <Shimmer className="h-5 w-12 rounded-lg" />
    </div>
    {/* Meta */}
    <div className="flex gap-3 mt-auto">
      <Shimmer className="h-3 w-20" />
      <Shimmer className="h-3 w-16" />
    </div>
    {/* Action row */}
    <div className="border-t border-border/20 pt-3 flex justify-between">
      <Shimmer className="h-8 w-24 rounded-xl" />
      <Shimmer className="h-8 w-20 rounded-xl" />
    </div>
  </div>
);

/* ─── Stat card skeleton ─── */
export const StatCardSkeleton = () => (
  <div className="rounded-[2rem] border border-border/30 bg-surface/20 p-8 flex items-center gap-6 h-full">
    <Shimmer className="w-16 h-16 rounded-2xl shrink-0" />
    <div className="space-y-2 flex-1">
      <Shimmer className="h-3 w-24" />
      <Shimmer className="h-7 w-16" />
    </div>
  </div>
);

/* ─── Skill chip skeleton ─── */
export const SkillChipSkeleton = () => (
  <div className="flex flex-wrap gap-1.5">
    {[...Array(6)].map((_, i) => (
      <Shimmer key={i} className={`h-6 rounded-lg ${i % 3 === 0 ? 'w-20' : i % 2 === 0 ? 'w-14' : 'w-16'}`} />
    ))}
  </div>
);

/* ─── Profile avatar skeleton ─── */
export const ProfileSkeleton = () => (
  <div className="flex items-center gap-4">
    <Shimmer className="w-12 h-12 rounded-full shrink-0" />
    <div className="space-y-2 flex-1">
      <Shimmer className="h-4 w-32" />
      <Shimmer className="h-3 w-24" />
    </div>
  </div>
);

/* ─── Dashboard hero skeleton ─── */
export const DashboardHeroSkeleton = () => (
  <div className="rounded-[2.5rem] border border-border/30 bg-surface/20 px-8 py-12 mb-12 space-y-6">
    <Shimmer className="h-4 w-40 rounded-full" />
    <Shimmer className="h-12 w-3/4" />
    <Shimmer className="h-5 w-2/3" />
    <div className="flex gap-3">
      <Shimmer className="h-14 w-40 rounded-2xl" />
      <Shimmer className="h-14 w-36 rounded-2xl" />
    </div>
  </div>
);
