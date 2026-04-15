import React, { ButtonHTMLAttributes } from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  icon?: React.ElementType;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  loading = false, 
  icon: Icon,
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-bold tracking-tight transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed select-none active:scale-[0.96] hover:scale-[1.02] transform-gpu';
  
  const variants = {
    primary: 'bg-primary-500 text-white hover:bg-primary-400 shadow-soft hover:shadow-glow',
    accent: 'premium-gradient text-white shadow-soft hover:shadow-glow',
    secondary: 'bg-surface text-text hover:bg-slate-700 border border-border/50',
    outline: 'bg-transparent text-text border-2 border-border hover:border-primary-400/30 hover:bg-primary/10',
    ghost: 'bg-transparent text-text-secondary hover:bg-surface hover:text-text',
    danger: 'bg-rose-500 text-white hover:bg-rose-600 shadow-soft',
    dark: 'bg-slate-950 text-white hover:bg-slate-900 shadow-lg border border-white/5',
  };

  const sizes = {
    sm: 'px-4 py-2 text-xs rounded-xl',
    md: 'px-6 py-2.5 text-sm rounded-xl',
    lg: 'px-8 py-3.5 text-base rounded-2xl',
  };

  return (
    <button 
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin -ml-1 mr-2.5 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : Icon && <Icon className="mr-2 h-4 w-4" strokeWidth={2.5} />}
      {children}
    </button>
  );
};

export default Button;
export { cn };
