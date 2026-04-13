import React from 'react';

const Card = ({ children, className = '', hover = true, padding = true }) => {
  return (
    <div className={`
      bg-white/90 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-soft
      ${hover ? 'hover:shadow-premium hover:-translate-y-0.5 transition-all duration-300' : ''}
      ${padding ? 'p-6' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
};

export default Card;
