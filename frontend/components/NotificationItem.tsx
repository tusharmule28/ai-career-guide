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
      return <Briefcase className="w-5 h-5 text-blue-500" />;
    case 'applications':
      return <FileText className="w-5 h-5 text-green-500" />;
    case 'suggestions':
      return <Lightbulb className="w-5 h-5 text-amber-500" />;
    default:
      return <Bell className="w-5 h-5 text-gray-500" />;
  }
};

const getPriorityStyles = (priority: string) => {
  switch (priority) {
    case 'high':
      return 'border-l-4 border-l-rose-500';
    case 'medium':
      return 'border-l-4 border-l-blue-400';
    default:
      return 'border-l-4 border-l-gray-300';
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
        "group relative flex items-start gap-4 p-4 transition-all hover:bg-gray-50 border-b border-gray-100",
        !isRead && "bg-blue-50/30",
        getPriorityStyles(notification.priority)
      )}
      onClick={onClick}
    >
      <div className="flex-shrink-0 mt-1">
        <div className="relative">
          {getIcon(notification.category)}
          {!isRead && (
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start mb-1">
          <h4 className={cn(
            "text-sm font-semibold truncate pr-6",
            isRead ? "text-gray-700" : "text-gray-900"
          )}>
            {notification.title}
          </h4>
          <span className="text-xs text-gray-400 whitespace-nowrap">
            {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
          </span>
        </div>
        
        <p className={cn(
          "text-sm leading-relaxed mb-2 line-clamp-2",
          isRead ? "text-gray-500" : "text-gray-600"
        )}>
          {notification.message}
        </p>

        <div className="flex items-center gap-3">
          {notification.link && (
            <Link 
              href={notification.link}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              Take Action <ExternalLink className="w-3 h-3" />
            </Link>
          )}
          
          {!isRead && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onMarkAsRead(notification.id);
              }}
              className="text-xs font-medium text-gray-400 hover:text-gray-600 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              Mark as read <Check className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
