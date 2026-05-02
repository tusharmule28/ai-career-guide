import React from 'react';
import { Inbox, LucideIcon, Sparkles } from 'lucide-react';
import Button, { cn } from './Button';
import { motion } from 'framer-motion';

interface EmptyStateProps {
  icon?: LucideIcon;
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon: Icon = Inbox, 
  title = "No data found", 
  description = "We couldn't find what you were looking for.", 
  actionText, 
  onAction,
  className
}) => {
  return (
    <div className={cn(
      "flex flex-col items-center justify-center py-16 px-6 text-center bg-surface/30 border border-border/50 rounded-3xl shadow-sm backdrop-blur-sm relative overflow-hidden group",
      className
    )}>
      {/* Background Glow */}
      <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -z-10" />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        className="relative mb-8 group-hover:scale-105 transition-transform duration-500"
      >
        {/* Abstract SVG Illustration */}
        <svg width="160" height="160" viewBox="0 0 160 160" className="mx-auto drop-shadow-2xl">
          <defs>
            <linearGradient id="empty-grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.2" />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity="0.05" />
            </linearGradient>
            <linearGradient id="empty-ring" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#818cf8" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#a78bfa" stopOpacity="0.1" />
            </linearGradient>
          </defs>
          
          <circle cx="80" cy="80" r="70" fill="url(#empty-grad)" className="animate-pulse" style={{ animationDuration: '4s' }} />
          <circle cx="80" cy="80" r="60" fill="none" stroke="url(#empty-ring)" strokeWidth="1" strokeDasharray="4 8" className="origin-center animate-[spin_20s_linear_infinite]" />
          <circle cx="80" cy="80" r="45" fill="none" stroke="url(#empty-ring)" strokeWidth="0.5" strokeDasharray="12 4" className="origin-center animate-[spin_30s_linear_infinite_reverse]" />
          
          <rect x="55" y="55" width="50" height="50" rx="16" fill="#1e293b" className="shadow-inner drop-shadow-xl border border-white/5" />
          
          {/* Icon injected in the center */}
          <foreignObject x="64" y="64" width="32" height="32">
             <div className="w-full h-full flex items-center justify-center text-indigo-400">
                <Icon size={24} strokeWidth={1.5} />
             </div>
          </foreignObject>

          <circle cx="105" cy="55" r="4" fill="#38bdf8" className="animate-bounce" style={{ animationDelay: '0.1s' }} />
          <circle cx="55" cy="105" r="3" fill="#a78bfa" className="animate-bounce" style={{ animationDelay: '0.5s' }} />
        </svg>

        <div className="absolute -top-2 -right-2 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
            <Sparkles size={20} className="animate-pulse drop-shadow-[0_0_8px_rgba(129,140,248,0.8)]" />
        </div>
      </motion.div>

      <h3 className="text-xl md:text-2xl font-bold text-white mb-2 tracking-tight">{title}</h3>
      <p className="text-sm text-text-secondary max-w-sm mb-8 mx-auto leading-relaxed">
        {description}
      </p>

      {actionText && onAction && (
        <Button 
            onClick={onAction} 
            variant="secondary" 
            className="px-8 h-12 rounded-xl"
        >
          {actionText}
        </Button>
      )}

      {/* Shapes */}
      <div className="absolute -right-12 -bottom-12 w-32 h-32 bg-indigo-500/5 rounded-full blur-[60px] -z-10" />
      <div className="absolute -left-12 -top-12 w-32 h-32 bg-violet-500/5 rounded-full blur-[60px] -z-10" />
    </div>
  );
};

export default EmptyState;
