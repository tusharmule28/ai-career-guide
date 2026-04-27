import React from 'react';
import { motion } from 'framer-motion';
import { cn } from './Button';

interface MatchPotencyMeterProps {
  score: number;
  size?: number;
  strokeWidth?: number;
}

const MatchPotencyMeter: React.FC<MatchPotencyMeterProps> = ({ 
  score, 
  size = 120, 
  strokeWidth = 8 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  // Semicircle
  const arcLength = circumference / 2;
  const strokeDashoffset = arcLength - (score / 100) * arcLength;

  const getColor = (s: number) => {
    if (s >= 80) return '#34d399'; // emerald-400
    if (s >= 60) return '#fbbf24'; // amber-400
    return '#fb7185'; // rose-400
  };

  const getLabel = (s: number) => {
    if (s >= 80) return 'High Potency';
    if (s >= 60) return 'Average Match';
    return 'Low Synergy';
  };

  const color = getColor(score);

  return (
    <div className="relative flex flex-col items-center justify-center group" style={{ width: size, height: size / 2 + 20 }}>
      {/* SVG Meter */}
      <svg 
        width={size} 
        height={size / 2} 
        viewBox={`0 0 ${size} ${size / 2}`}
        className="overflow-visible"
      >
        {/* Background Arc */}
        <path
          d={`M ${strokeWidth/2} ${size/2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth/2} ${size/2}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-slate-800"
          strokeLinecap="round"
        />
        
        {/* Progress Arc */}
        <motion.path
          d={`M ${strokeWidth/2} ${size/2} A ${radius} ${radius} 0 0 1 ${size - strokeWidth/2} ${size/2}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={arcLength}
          initial={{ strokeDashoffset: arcLength }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          style={{
            filter: `drop-shadow(0 0 8px ${color}80)`
          }}
        />
      </svg>

      {/* Center Value */}
      <div className="absolute bottom-4 flex flex-col items-center">
        <span className="text-3xl font-black text-white tracking-tighter" style={{ textShadow: `0 0 20px ${color}40` }}>
          {Math.round(score)}<span className="text-sm text-text-muted">%</span>
        </span>
      </div>

      {/* Label */}
      <div className="absolute -bottom-6">
        <span 
          className="text-[9px] font-black uppercase tracking-[0.2em] px-2.5 py-0.5 rounded-md border shadow-sm"
          style={{ 
            color: color, 
            backgroundColor: `${color}10`,
            borderColor: `${color}20`
          }}
        >
          {getLabel(score)}
        </span>
      </div>
    </div>
  );
};

export default MatchPotencyMeter;
