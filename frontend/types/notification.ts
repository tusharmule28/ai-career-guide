export type NotificationCategory = 'jobs' | 'applications' | 'suggestions' | 'system';
export type NotificationPriority = 'high' | 'medium' | 'low';

export interface Notification {
  id: number;
  title: string;
  message: string;
  link?: string;
  category: NotificationCategory;
  priority: NotificationPriority;
  metadata?: Record<string, any>;
  is_read: boolean;
  created_at: string;
}

export interface NotificationResponse {
  notifications: Notification[];
  total: number;
  unread_count: number;
}
