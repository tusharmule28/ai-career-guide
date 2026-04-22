import React, { HTMLAttributes } from 'react';
import { cn } from './Button';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', hover = true, padding = true, ...props }) => {
  return (
    <div 
      className={cn(
        "bg-surface/80 backdrop-blur-sm rounded-2xl border border-border/50 shadow-soft overflow-hidden",
        hover && "hover:shadow-premium hover:-translate-y-0.5 transition-all duration-300 transform-gpu",
        padding && "p-4 sm:p-6",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
