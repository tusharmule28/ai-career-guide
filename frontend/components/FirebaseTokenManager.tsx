'use client';

import { useEffect, useState } from 'react';
import { messaging } from '@/lib/firebase-config';
import { getToken, onMessage } from 'firebase/messaging';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';
import { useAuth } from '@/lib/auth-context';

export default function FirebaseTokenManager() {
  const { user } = useAuth();
  const [permission, setPermission] = useState<NotificationPermission>(
    typeof window !== 'undefined' ? Notification.permission : 'default'
  );

  useEffect(() => {
    if (!user || typeof window === 'undefined' || !messaging) return;

    const setupNotifications = async () => {
      // 1. Check/Request permission
      if (Notification.permission === 'default') {
        const status = await Notification.requestPermission();
        setPermission(status);
        if (status !== 'granted') return;
      }

      try {
        // 2. Get FCM token
        if (!messaging) return;
        
        const token = await getToken(messaging, {
          vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY
        });

        if (token) {
          console.log('[FCM] Token generated:', token);
          // 3. Register with backend
          await api.post('/notifications/token', { token });
        } else {
          console.warn('[FCM] No registration token available.');
        }
      } catch (err) {
        console.error('[FCM] Error retrieving token:', err);
      }
    };

    if (permission === 'granted' || permission === 'default') {
      setupNotifications();
    }

    // 4. Handle foreground messages
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('[FCM] Foreground message received:', payload);
      
      // Show a premium toast for foreground notifications
      toast.custom((t) => (
        <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-surface/90 backdrop-blur-md border border-primary-500/30 shadow-glow rounded-2xl pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
          <div className="flex-1 w-0 p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <div className="h-10 w-10 rounded-xl bg-primary-500/20 flex items-center justify-center text-primary-400">
                  <span className="text-xl">🚀</span>
                </div>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm font-black text-white">
                  {payload.notification?.title || 'New Alert'}
                </p>
                <p className="mt-1 text-[11px] font-medium text-text-secondary leading-snug">
                  {payload.notification?.body || 'Check your notifications for updates.'}
                </p>
              </div>
            </div>
          </div>
          <div className="flex border-l border-border/50">
            <button
              onClick={() => {
                  toast.dismiss(t.id);
                  if (payload.data?.url) window.location.href = payload.data.url;
              }}
              className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-xs font-black text-primary-400 hover:text-primary-300 focus:outline-none"
            >
              VIEW
            </button>
          </div>
        </div>
      ), { duration: 6000 });
    });

    return () => unsubscribe();
  }, [user, permission]);

  return null;
}
