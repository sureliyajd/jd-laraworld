import { useEffect, useState, useRef } from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { toast } from 'sonner';
import { AUTH_CONFIG } from '../config/auth';
import { taskService, type Task } from '../services/taskService';

// Extend Window interface for Echo
declare global {
  interface Window {
    Echo: Echo<any>;
    Pusher: any;
  }
}

interface RealtimeEventCallbacks {
  /** Called when a new notification is received (for badge counter updates) */
  onNotificationReceived?: () => void;
  /** Called when a task is assigned (for adding task to list) */
  onTaskAssigned?: (taskId: number, eventData: any) => void;
  /** Called when a task is updated (for updating task in list) */
  onTaskUpdated?: (taskId: number, eventData: any) => void;
}

interface UseRealtimeNotificationsProps {
  userId: string;
  enabled?: boolean;
  callbacks?: RealtimeEventCallbacks;
}

export const useRealtimeNotifications = ({ 
  userId, 
  enabled = true,
  callbacks = {}
}: UseRealtimeNotificationsProps) => {
  const [isConnected, setIsConnected] = useState(false);
  const callbacksRef = useRef(callbacks);
  const echoInstanceRef = useRef<Echo<any> | null>(null);

  // Update callbacks ref when they change
  useEffect(() => {
    callbacksRef.current = callbacks;
  }, [callbacks]);

  // Initialize Echo connection
  useEffect(() => {
    if (!enabled || !userId) return;

    // Check if Pusher is configured
    const hasPusherConfig = import.meta.env.VITE_PUSHER_APP_KEY && 
                           import.meta.env.VITE_PUSHER_APP_KEY !== 'demo-key';

    if (!hasPusherConfig) {
      // Demo mode - simulate connection
      console.log('🔔 Demo Mode: Real-time notifications disabled (Pusher not configured)');
      console.log('💡 To enable real-time notifications, configure Pusher credentials');
      setIsConnected(true); // Simulate connected state
      return;
    }

    // Configure Pusher on window for Echo
    window.Pusher = Pusher;

    // Initialize Echo
    const backendBase = AUTH_CONFIG.API_BASE;
    const accessToken = localStorage.getItem(AUTH_CONFIG.STORAGE_KEYS.ACCESS_TOKEN);

    const echo = new Echo({
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

    echoInstanceRef.current = echo;
    window.Echo = echo;

    // Setup connection diagnostics
    try {
      const pusherConn = (echo as any)?.connector?.pusher?.connection;
      if (pusherConn) {
        pusherConn.bind('state_change', (states: any) => {
          console.log('[RT] Connection state change', states);
        });
        pusherConn.bind('connected', () => {
          const socketId = (echo as any)?.connector?.pusher?.connection?.socket_id;
          console.log('[RT] Connected to Pusher', { socketId });
          setIsConnected(true);
        });
        pusherConn.bind('disconnected', () => {
          console.log('[RT] Disconnected from Pusher');
          setIsConnected(false);
        });
        pusherConn.bind('unavailable', () => {
          console.warn('[RT] Pusher connection unavailable');
          setIsConnected(false);
        });
        pusherConn.bind('failed', () => {
          console.error('[RT] Pusher connection failed');
          setIsConnected(false);
        });
        pusherConn.bind('error', (err: any) => {
          console.error('[RT] Pusher connection error', err);
          setIsConnected(false);
        });
      }
    } catch (e) {
      console.warn('[RT] Failed wiring connection diagnostics', e);
    }

    // Subscribe to user channel
    const channelName = `user.${userId}`;
    const channel = echo.private(channelName);

    // Setup subscription event handlers
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

    // Handle task.assigned event
    channel.listen('.task.assigned', async (data: any) => {
      console.log('[RT] Task assigned event received', data);
      
      const taskId = data.task?.id;
      if (!taskId) {
        console.warn('[RT] Task assigned event missing task ID');
        return;
      }

      // Show toast notification
      toast.success('New Task Assignment', {
        description: data.message || `Task "${data.task?.title}" has been assigned to you`,
        action: {
          label: 'View',
          onClick: () => {
            // Optional: Navigate to task or open modal
          },
        },
      });

      // Notify callback for badge counter update
      if (callbacksRef.current.onNotificationReceived) {
        callbacksRef.current.onNotificationReceived();
      }

      // Add task to list via TaskService
      try {
        await taskService.addTaskFromEvent(taskId);
        console.log('[RT] Task added to list', taskId);
      } catch (error) {
        console.error('[RT] Failed to add task to list', error);
      }

      // Call custom callback if provided
      if (callbacksRef.current.onTaskAssigned) {
        callbacksRef.current.onTaskAssigned(taskId, data);
      }
    });

    // Handle task.updated event
    channel.listen('.task.updated', async (data: any) => {
      console.log('[RT] Task updated event received', data);
      
      const taskId = data.task?.id;
      if (!taskId) {
        console.warn('[RT] Task updated event missing task ID');
        return;
      }

      // Show toast notification
      toast.info('Task Updated', {
        description: data.message || `Task "${data.task?.title}" has been updated`,
        action: {
          label: 'View',
          onClick: () => {
            // Optional: Navigate to task or open modal
          },
        },
      });

      // Notify callback for badge counter update
      if (callbacksRef.current.onNotificationReceived) {
        callbacksRef.current.onNotificationReceived();
      }

      // Update task in list via TaskService
      try {
        // Map event data to Task format
        const updateData: Partial<Task> = {
          status: data.task?.status,
          priority: data.task?.priority,
          title: data.task?.title,
          due_date: data.task?.due_date,
        };

        taskService.updateTaskFromEvent(taskId, updateData);
        console.log('[RT] Task updated in list', taskId, updateData);
      } catch (error) {
        console.error('[RT] Failed to update task in list', error);
      }

      // Call custom callback if provided
      if (callbacksRef.current.onTaskUpdated) {
        callbacksRef.current.onTaskUpdated(taskId, data);
      }
    });

    // Cleanup function
    return () => {
      if (echo) {
        try {
          echo.leave(channelName);
        } catch (_) {}
        echo.disconnect();
      }
      echoInstanceRef.current = null;
    };
  }, [userId, enabled]);

  return {
    isConnected,
  };
};
