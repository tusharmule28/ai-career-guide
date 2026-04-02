import React from 'react';

const Input = ({ label, error, className = '', icon: Icon, ...props }) => {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-gray-700 ml-0.5">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-smooth">
            <Icon size={18} />
          </div>
        )}
        <input
          className={`
            w-full bg-white border border-gray-200 rounded-lg py-2.5 px-4
            ${Icon ? 'pl-10' : ''}
            text-gray-900 placeholder:text-gray-400
            focus:ring-2 focus:ring-primary/10 focus:border-primary
            outline-none transition-smooth
            ${error ? 'border-red-500 focus:ring-red-500/10 focus:border-red-500' : ''}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-xs font-medium text-red-500 ml-0.5 mt-0.5">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
