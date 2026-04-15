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
      "flex flex-col items-center justify-center py-20 px-8 text-center bg-surface/20 border border-border/50 rounded-[3rem] shadow-inner backdrop-blur-sm relative overflow-hidden group",
      className
    )}>
      {/* Background Glow */}
      <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 -z-10" />
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        className="w-24 h-24 bg-surface rounded-[2rem] flex items-center justify-center text-text-muted mb-8 shadow-2xl border border-white/5 relative group-hover:rotate-6 transition-transform"
      >
        <Icon size={44} strokeWidth={1} />
        <div className="absolute -top-2 -right-2 text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
            <Sparkles size={16} className="animate-pulse" />
        </div>
      </motion.div>

      <h3 className="text-2xl font-black text-white mb-3 tracking-tighter tracking-tight">{title}</h3>
      <p className="text-sm text-text-secondary max-w-sm mb-10 mx-auto font-medium leading-relaxed italic opacity-80">
        {description}
      </p>

      {actionText && onAction && (
        <Button 
            onClick={onAction} 
            variant="dark" 
            className="font-black text-[10px] uppercase tracking-[0.2em] px-10 h-14 rounded-2xl border border-indigo-500/20 bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 shadow-soft transition-all"
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
