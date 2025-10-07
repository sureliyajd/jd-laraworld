import { useEffect, useState, useCallback, useRef } from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { toast } from 'sonner';
import { AUTH_CONFIG } from '../config/auth';
import { notificationService, Notification } from '../services/notificationService';

// Extend Window interface for Echo
declare global {
  interface Window {
    Echo: Echo<any>;
    Pusher: any;
  }
}

interface UseRealtimeNotificationsProps {
  userId: string;
  enabled?: boolean;
  onNotificationClick?: () => void;
}

export const useRealtimeNotifications = ({ 
  userId, 
  enabled = true,
  onNotificationClick
}: UseRealtimeNotificationsProps) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const previousUnreadRef = useRef(0);
  const onClickRef = useRef(onNotificationClick);

  useEffect(() => {
    onClickRef.current = onNotificationClick;
  }, [onNotificationClick]);


  // Refresh notifications from server
  const refreshNotifications = useCallback(async () => {
    try {
      const stats = await notificationService.getStatistics();
      const previousCount = previousUnreadRef.current;
      setUnreadCount(stats.unread);
      previousUnreadRef.current = stats.unread;
      
      // Show toast notification for new unread count
      if (stats.unread > previousCount) {
        const newCount = stats.unread - previousCount;
        toast.success('New Notification', {
          description: `You have ${newCount} new notification${newCount > 1 ? 's' : ''}`,
          action: {
            label: 'View',
            onClick: () => {
              if (onClickRef.current) {
                onClickRef.current();
              }
            },
          },
        });
      }
    } catch (error) {
      console.error('Failed to refresh notifications:', error);
    }
  }, []);

  // Load initial notifications
  useEffect(() => {
    if (userId) {
      refreshNotifications();
    }
  }, [userId]);

  // Initialize Echo (Demo Mode - No Pusher Required)
  useEffect(() => {
    if (!enabled || !userId) return;

    // Check if Pusher is configured
    const hasPusherConfig = import.meta.env.VITE_PUSHER_APP_KEY && 
                           import.meta.env.VITE_PUSHER_APP_KEY !== 'demo-key';

    if (hasPusherConfig) {
      // Configure Pusher on window for Echo
      window.Pusher = Pusher;

      // Initialize Echo - let Pusher compute correct ws host via cluster
      const apiBase = AUTH_CONFIG.API_BASE_URL; // e.g., http://127.0.0.1:8000/api
      const backendBase = apiBase.replace(/\/api\/?$/, '');
      const accessToken = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);

      window.Echo = new Echo({
        broadcaster: 'pusher',
        key: import.meta.env.VITE_PUSHER_APP_KEY,
        cluster: import.meta.env.VITE_PUSHER_APP_CLUSTER || 'mt1',
        forceTLS: true,
        enabledTransports: ['wss', 'ws'],
        authEndpoint: `${backendBase}/broadcasting/auth`,
        auth: {
          headers: {
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
        },
      });
    } else {
      // Demo mode - simulate connection
      console.log('🔔 Demo Mode: Real-time notifications disabled (Pusher not configured)');
      console.log('💡 To enable real-time notifications, configure Pusher credentials');
      setIsConnected(true); // Simulate connected state
    }

    if (hasPusherConfig) {
      let subscribed = false;
      const subscribeToChannels = () => {
        const channel = window.Echo.private(`user.${userId}`);

        channel.listen('task.assigned', (data: any) => {
          console.log('Task assigned notification received:', data);
          toast.success('New Task Assignment', {
            description: data.message,
            action: {
              label: 'View',
              onClick: () => {
                if (onNotificationClick) {
                  onNotificationClick();
                }
              },
            },
          });
          refreshNotifications();
        });

        channel.listen('task.updated', (data: any) => {
          console.log('Task updated notification received:', data);
          toast.info('Task Updated', {
            description: data.message,
            action: {
              label: 'View',
              onClick: () => {
                if (onNotificationClick) {
                  onNotificationClick();
                }
              },
            },
          });
          refreshNotifications();
        });
      };

      // Listen for connection events
      window.Echo.connector.pusher.connection.bind('connected', () => {
        setIsConnected(true);
        console.log('Connected to Pusher');
        if (!subscribed) {
          subscribeToChannels();
          subscribed = true;
        }
      });

      window.Echo.connector.pusher.connection.bind('disconnected', () => {
        setIsConnected(false);
        console.log('Disconnected from Pusher');
        if (subscribed) {
          try {
            window.Echo.leave(`user.${userId}`);
          } catch (_) {}
          subscribed = false;
        }
      });

      // If already connected (fast reconnect), subscribe immediately
      const currentState = window.Echo.connector.pusher.connection.state;
      if (currentState === 'connected' && !subscribed) {
        subscribeToChannels();
        subscribed = true;
      }
    }

    return () => {
      if (window.Echo) {
        try {
          window.Echo.leave(`user.${userId}`);
        } catch (_) {}
        window.Echo.disconnect();
      }
    };
  }, [userId, enabled]);


  // Mark notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, []);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  }, []);

  return {
    notifications,
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  };
};
