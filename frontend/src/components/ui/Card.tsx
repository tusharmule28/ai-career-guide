import React, { HTMLAttributes } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  padding?: boolean;
}

const Card: React.FC<CardProps> = ({ children, className = '', hover = true, padding = true, ...props }) => {
  return (
    <div 
      className={`
        bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-soft
        ${hover ? 'hover:shadow-premium hover:-translate-y-0.5 transition-all duration-300' : ''}
        ${padding ? 'p-6' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
