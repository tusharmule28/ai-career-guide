import React from 'react';
import { Search, Inbox, Sparkles } from 'lucide-react';
import Button from './Button';

const EmptyState = ({ 
  icon: Icon = Inbox, 
  title = "No data found", 
  description = "We couldn't find what you were looking for.", 
  actionText, 
  onAction 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-surface/30 border-2 border-dashed border-border rounded-[2.5rem] animate-fade-in">
      <div className="w-20 h-20 bg-surface rounded-full flex items-center justify-center text-text-muted mb-6 animate-float">
        <Icon size={40} strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-bold text-text mb-2">{title}</h3>
      <p className="text-sm text-text-secondary max-w-xs mb-8 mx-auto font-medium leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <Button onClick={onAction} variant="outline" className="font-bold border-border text-text-secondary hover:bg-surface h-10 px-6 rounded-xl transition-smooth">
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
