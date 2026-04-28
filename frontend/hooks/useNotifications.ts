import { useEffect, useRef } from 'react';
import { useNotificationStore } from '@/lib/store/notificationStore';
import { getToken } from '@/lib/auth';
import { BASE_URL } from '@/lib/api';

export const useNotifications = () => {
  const { addNotification, fetchNotifications } = useNotificationStore();
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    // Initial fetch
    fetchNotifications();

    const connectSSE = () => {
      const token = getToken();
      if (!token) return;

      // Close existing connection if any
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }

      // We need to pass the token. Since standard EventSource doesn't support headers,
      // we usually pass it as a query param if the backend supports it, 
      // or use a polyfill like event-source-polyfill.
      // For now, let's assume the backend supports a token param for this specific endpoint
      // or we can just try to see if it works with cookies (if used).
      // Based on our FastAPI setup, it uses Bearer token in headers.
      // A common trick is to use a custom polyfill or just pass token in URL.
      // Let's update the backend to support token in query param for /stream if needed.
      
      const streamUrl = `${BASE_URL}/notifications/stream?token=${token}`;
      const eventSource = new EventSource(streamUrl);

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          addNotification(data);
        } catch (error) {
          console.error('Failed to parse SSE message:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('SSE Error:', error);
        eventSource.close();
        // Try to reconnect after 5 seconds
        setTimeout(connectSSE, 5000);
      };

      eventSourceRef.current = eventSource;
    };

    connectSSE();

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, [addNotification, fetchNotifications]);

  return {
    // We can return more helpers if needed
  };
};
