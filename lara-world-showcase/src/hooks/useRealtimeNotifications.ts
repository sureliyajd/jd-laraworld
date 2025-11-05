import { useEffect, useState, useRef } from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { toast } from 'sonner';
import { AUTH_CONFIG } from '../config/auth';

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
  onNotificationReceived?: () => void;
}

export const useRealtimeNotifications = ({ 
  userId, 
  enabled = true,
  onNotificationClick,
  onNotificationReceived
}: UseRealtimeNotificationsProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const onClickRef = useRef(onNotificationClick);
  const onReceivedRef = useRef(onNotificationReceived);

  useEffect(() => {
    onClickRef.current = onNotificationClick;
  }, [onNotificationClick]);

  useEffect(() => {
    onReceivedRef.current = onNotificationReceived;
  }, [onNotificationReceived]);

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
      // Use API_BASE from config (without /api suffix)
      const backendBase = AUTH_CONFIG.API_BASE;
      const accessToken = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);

      // Initialize Echo with Pusher configuration

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

      // Attach connection diagnostics
      try {
        const pusherConn = (window.Echo as any)?.connector?.pusher?.connection;
        if (pusherConn) {
          pusherConn.bind('state_change', (states: any) => {
            console.log('[RT] Connection state change', states);
          });
          pusherConn.bind('connected', () => {
            const socketId = (window.Echo as any)?.connector?.pusher?.connection?.socket_id;
            console.log('[RT] Connected to Pusher', { socketId });
          });
          pusherConn.bind('disconnected', () => {
            console.log('[RT] Disconnected from Pusher');
          });
          pusherConn.bind('unavailable', () => {
            console.warn('[RT] Pusher connection unavailable');
          });
          pusherConn.bind('failed', () => {
            console.error('[RT] Pusher connection failed');
          });
          pusherConn.bind('error', (err: any) => {
            console.error('[RT] Pusher connection error', err);
          });
        }
      } catch (e) {
        console.warn('[RT] Failed wiring connection diagnostics', e);
      }
    } else {
      // Demo mode - simulate connection
      console.log('🔔 Demo Mode: Real-time notifications disabled (Pusher not configured)');
      console.log('💡 To enable real-time notifications, configure Pusher credentials');
      setIsConnected(true); // Simulate connected state
    }

    if (hasPusherConfig) {
      const subscribeToChannels = () => {
        const channelName = `user.${userId}`;
        const channel = window.Echo.private(channelName);

        // Log subscription outcomes
        try {
          const underlying = (channel as any)?.subscription;
          if (underlying?.bind) {
            underlying.bind('pusher:subscription_succeeded', () => {
              console.log('[RT] Subscription succeeded', { channel: channelName });
            });
            underlying.bind('pusher:subscription_error', (status: any) => {
              console.error('[RT] Subscription error', { channel: channelName, status });
            });
          }
        } catch (e) {
          console.warn('[RT] Unable to bind subscription events', e);
        }

        channel.listen('.task.assigned', (data: any) => {
          toast.success('New Task Assignment', {
            description: data.message,
            action: {
              label: 'View',
              onClick: () => {
                if (onClickRef.current) {
                  onClickRef.current();
                }
              },
            },
          });
          // Notify context to refresh stats
          if (onReceivedRef.current) {
            onReceivedRef.current();
          }
        });

        channel.listen('.task.updated', (data: any) => {
          toast.info('Task Updated', {
            description: data.message,
            action: {
              label: 'View',
              onClick: () => {
                if (onClickRef.current) {
                  onClickRef.current();
                }
              },
            },
          });
          // Notify context to refresh stats
          if (onReceivedRef.current) {
            onReceivedRef.current();
          }
        });
      };

      // Listen for connection events
      let subscribed = false;
      
      window.Echo.connector.pusher.connection.bind('connected', () => {
        setIsConnected(true);
        if (!subscribed) {
          subscribeToChannels();
          subscribed = true;
        }
      });

      window.Echo.connector.pusher.connection.bind('disconnected', () => {
        setIsConnected(false);
        if (subscribed) {
          try {
            window.Echo.leave(`user.${userId}`);
          } catch (_) {}
          subscribed = false;
        }
      });

      // If already connected, subscribe immediately
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


  return {
    isConnected,
  };
};
