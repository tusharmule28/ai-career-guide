import React from 'react';

const Input = ({ label, error, className = '', icon: Icon, ...props }) => {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">
          {label}
        </label>
      )}
      <div className="relative group">
        {Icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-accent-600 transition-smooth">
            <Icon size={18} />
          </div>
        )}
        <input
          className={`
            w-full bg-surface border border-border rounded-xl py-3 px-4
            ${Icon ? 'pl-11' : ''}
            text-sm font-bold text-text placeholder:text-text-muted
            focus:bg-surface focus:ring-4 focus:ring-primary-400/10 focus:border-primary-400
            outline-none transition-smooth shadow-sm
            ${error ? 'border-rose-500 focus:ring-rose-500/10 focus:border-rose-500' : ''}
          `}
          {...props}
        />
      </div>
      {error && (
        <p className="text-[10px] font-bold text-rose-500 ml-1 mt-0.5">
          {error}
        </p>
      )}
    </div>
  );
};

export default Input;
