'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { cn } from './Button';

interface CircularScoreProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
  showLabel?: boolean;
}

const CircularScore: React.FC<CircularScoreProps> = ({
  score,
  size = 56,
  strokeWidth = 4,
  className,
  showLabel = true,
}) => {
  const clampedScore = Math.min(Math.max(score, 0), 100);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedScore / 100) * circumference;

  const colorClass =
    clampedScore >= 80
      ? { stroke: '#10B981', text: 'text-emerald-400', glow: 'drop-shadow-[0_0_6px_rgba(16,185,129,0.6)]' }
      : clampedScore >= 60
      ? { stroke: '#F59E0B', text: 'text-amber-400', glow: 'drop-shadow-[0_0_6px_rgba(245,158,11,0.5)]' }
      : { stroke: '#EF4444', text: 'text-rose-400',  glow: 'drop-shadow-[0_0_6px_rgba(239,68,68,0.5)]'  };

  return (
    <div className={cn('relative shrink-0 flex items-center justify-center', className)} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        className={cn('rotate-[-90deg]', colorClass.glow)}
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colorClass.stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.1, ease: 'easeOut', delay: 0.15 }}
        />
      </svg>

      {showLabel && (
        <span
          className={cn(
            'absolute inset-0 flex items-center justify-center font-black tabular-nums leading-none',
            colorClass.text
          )}
          style={{ fontSize: size * 0.22 }}
        >
          {clampedScore}%
        </span>
      )}
    </div>
  );
};

export default CircularScore;
