import React from 'react';

const Card = ({ children, className = '', hover = true, padding = true }) => {
  return (
    <div className={`
      bg-white rounded-xl border border-gray-100 shadow-card 
      ${hover ? 'hover:shadow-card-hover transition-smooth' : ''}
      ${padding ? 'p-6' : ''}
      ${className}
    `}>
      {children}
    </div>
  );
};

export default Card;
