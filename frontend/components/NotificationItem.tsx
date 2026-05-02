import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { 
  Briefcase, 
  FileText, 
  Bell, 
  Lightbulb, 
  Circle,
  ExternalLink,
  Check
} from 'lucide-react';
import { Notification, NotificationCategory } from '@/types/notification';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: number) => void;
  onClick?: () => void;
}

const getIcon = (category: NotificationCategory) => {
  switch (category) {
    case 'jobs':
      return <Briefcase className="w-4 h-4 text-primary-400" />;
    case 'applications':
      return <FileText className="w-4 h-4 text-emerald-400" />;
    case 'suggestions':
      return <Lightbulb className="w-4 h-4 text-amber-400" />;
    default:
      return <Bell className="w-4 h-4 text-text-muted" />;
  }
};

const getPriorityStyles = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'border-l-2 border-l-danger';
    case 'medium':
      return 'border-l-2 border-l-primary-500';
    default:
      return 'border-l-2 border-l-border';
  }
};

export const NotificationItem: React.FC<NotificationItemProps> = ({ 
  notification, 
  onMarkAsRead,
  onClick 
}) => {
  const isRead = notification.is_read;

  return (
    <div 
      className={cn(
        "group relative flex items-start gap-4 p-4 transition-all hover:bg-background border-b border-border/50",
        !isRead && "bg-primary-500/5",
        getPriorityStyles(notification.priority)
      )}
      onClick={onClick}
    >
      <div className="flex-shrink-0 mt-1">
        <div className="relative">
          {getIcon(notification.category)}
          {!isRead && (
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary-500"></span>
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <h4 className={cn(
            "text-sm font-semibold truncate pr-6",
            isRead ? "text-text-secondary" : "text-text"
          )}>
            {notification.title}
          </h4>
          <span className="text-[10px] text-text-muted whitespace-nowrap font-medium">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </span>
        </div>
        
        <p className={cn(
          "text-xs leading-relaxed mb-3 line-clamp-2",
          isRead ? "text-text-muted" : "text-text-secondary"
        )}>
          {notification.message}
        </p>

        <div className="flex items-center gap-3">
          {notification.link && (
            <Link 
              href={notification.link}
              className="text-xs font-bold text-primary-400 hover:text-primary-300 flex items-center gap-1"
            >
              View Details <ExternalLink className="w-3 h-3" />
            </Link>
          )}
          
          {!isRead && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead(notification.id);
              }}
              className="text-[10px] font-bold text-text-muted hover:text-text-secondary flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-wider"
            >
              Mark as read <Check className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
