import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useRealtimeNotifications } from '../hooks/useRealtimeNotifications';
import { notificationService, NotificationStats } from '../services/notificationService';

interface NotificationContextType {
  unreadCount: number;
  totalCount: number;
  stats: NotificationStats | null;
  isConnected: boolean;
  refreshStats: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (notificationId: string) => Promise<void>;
  openNotificationCenter: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

interface NotificationProviderProps {
  children: React.ReactNode;
  userId: string;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
  userId,
}) => {
  // Centralized state - single source of truth
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Real-time connection status
  const { isConnected } = useRealtimeNotifications({ 
    userId,
    onNotificationReceived: () => {
      // When new notification arrives, refresh stats
      refreshStats();
    }
  });

  // Centralized stats refresh function
  const refreshStats = useCallback(async () => {
    try {
      const notificationStats = await notificationService.getStatistics();
      setStats(notificationStats);
      setUnreadCount(notificationStats.unread);
      setTotalCount(notificationStats.total);
    } catch (error) {
      console.error('Failed to load notification stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Load initial stats on mount
  useEffect(() => {
    if (userId) {
      refreshStats();
    }
  }, [userId, refreshStats]);

  // Mark single notification as read
  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await notificationService.markAsRead(notificationId);
      // Update local state immediately for instant feedback
      setUnreadCount(prev => Math.max(0, prev - 1));
      // Refresh stats to ensure accuracy
      await refreshStats();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // Revert on error
      await refreshStats();
    }
  }, [refreshStats]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    try {
      await notificationService.markAllAsRead();
      // Update local state immediately for instant feedback
      setUnreadCount(0);
      // Refresh stats to ensure accuracy
      await refreshStats();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      // Revert on error
      await refreshStats();
    }
  }, [refreshStats]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      // Refresh stats to get accurate counts
      await refreshStats();
    } catch (error) {
      console.error('Failed to delete notification:', error);
    }
  }, [refreshStats]);

  const contextValue: NotificationContextType = {
    unreadCount,
    totalCount,
    stats,
    isConnected,
    refreshStats,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    openNotificationCenter: () => {},
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotificationContext must be used within a NotificationProvider');
  }
  return context;
};
