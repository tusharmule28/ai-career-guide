import React, { useEffect } from 'react';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children, maxWidth = 'max-w-4xl' }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 drop-shadow-2xl">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal Container */}
      <div 
        className={`relative w-full ${maxWidth} bg-background rounded-[2.5rem] shadow-2xl overflow-hidden animate-slide-up border border-white/10`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 sm:p-8 border-b border-border bg-surface/50">
          <h3 className="text-xl font-extrabold text-white tracking-tight">
            {title}
          </h3>
          <button 
            onClick={onClose}
            className="p-2 rounded-xl text-text-secondary hover:bg-surface hover:text-text transition-smooth border border-transparent hover:border-border"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[calc(100vh-200px)] overflow-y-auto custom-scrollbar">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
