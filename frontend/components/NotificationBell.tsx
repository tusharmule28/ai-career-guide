import React, { useState, useRef, useEffect } from 'react';
import { Bell, CheckCheck, Settings, Filter, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotificationStore } from '@/lib/store/notificationStore';
import { NotificationItem } from './NotificationItem';
import { cn } from '@/lib/utils';
import { useNotifications } from '@/hooks/useNotifications';

export const NotificationBell: React.FC = () => {
  // Initialize SSE and initial fetch
  useNotifications();
  
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'jobs' | 'applications'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  const { 
    notifications, 
    unreadCount, 
    loading, 
    markAsRead, 
    markAllAsRead,
    fetchNotifications 
  } = useNotificationStore();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredNotifications = notifications.filter(n => {
    if (activeTab === 'all') return true;
    return n.category === activeTab;
  });

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "relative p-2 rounded-xl transition-all duration-200",
          isOpen ? "bg-primary-500/10 text-primary-400" : "hover:bg-surface text-text-secondary hover:text-text"
        )}
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center h-4 min-w-[16px] px-1 text-[9px] font-bold text-white bg-primary-500 rounded-full border-2 border-background shadow-sm">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-3 w-80 sm:w-96 bg-surface border border-border rounded-2xl shadow-premium overflow-hidden z-50 origin-top-right"
          >
            {/* Header */}
            <div className="p-4 border-b border-border flex items-center justify-between bg-surface sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-text">Notifications</h3>
                {unreadCount > 0 && (
                  <span className="text-[10px] font-bold px-2 py-0.5 bg-primary-500/10 text-primary-400 rounded-full border border-primary-500/20">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button 
                  onClick={() => markAllAsRead()}
                  className="p-1.5 text-text-muted hover:text-primary-400 hover:bg-primary-500/10 rounded-lg transition-colors group"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 text-text-muted hover:text-text hover:bg-background rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex p-1 bg-background/50 border-b border-border">
              {(['all', 'jobs', 'applications'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all",
                    activeTab === tab 
                      ? "bg-surface text-primary-400 shadow-sm border border-white/5" 
                      : "text-text-muted hover:text-text-secondary"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Content Area */}
            <div className="max-h-[450px] overflow-y-auto custom-scrollbar scroll-smooth">
              {loading && filteredNotifications.length === 0 ? (
                // Skeleton Loaders
                Array(4).fill(0).map((_, i) => (
                  <div key={i} className="p-4 border-b border-gray-50 animate-pulse flex gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4" />
                      <div className="h-3 bg-gray-200 rounded w-full" />
                      <div className="h-3 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))
              ) : filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                  <NotificationItem 
                    key={notification.id} 
                    notification={notification} 
                    onMarkAsRead={markAsRead}
                  />
                ))
              ) : (
                <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                  <div className="w-14 h-14 bg-surface rounded-full flex items-center justify-center mb-4 border border-border">
                    <Bell className="w-6 h-6 text-text-muted" />
                  </div>
                  <h4 className="text-sm font-semibold text-text mb-1">No notifications</h4>
                  <p className="text-xs text-text-secondary max-w-[200px]">
                    We'll notify you when there are new matches or updates.
                  </p>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 bg-background border-t border-border flex justify-center">
              <button className="text-xs font-bold text-primary-400 hover:text-primary-300 transition-colors uppercase tracking-wider">
                View all notifications
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
