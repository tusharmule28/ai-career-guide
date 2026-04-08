import React from 'react';

const Card = ({ children, className = '', hover = true, padding = true }) => {
  return (
    <div className={`
      bg-white rounded-[2.5rem] border border-slate-100 shadow-sm
      ${hover ? 'hover:shadow-premium transition-smooth' : ''}
      ${padding ? 'p-6' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
};

export default Card;
