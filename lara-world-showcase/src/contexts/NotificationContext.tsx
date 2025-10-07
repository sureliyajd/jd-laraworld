import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRealtimeNotifications } from '../hooks/useRealtimeNotifications';
import { notificationService, NotificationStats } from '../services/notificationService';

interface NotificationContextType {
  unreadCount: number;
  stats: NotificationStats | null;
  isConnected: boolean;
  refreshNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
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
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);

  const {
    unreadCount,
    isConnected,
    markAsRead,
    markAllAsRead,
    refreshNotifications,
  } = useRealtimeNotifications({ 
    userId,
    onNotificationClick: () => setIsNotificationCenterOpen(true)
  });

  // Load initial notification stats
  useEffect(() => {
    const loadStats = async () => {
      try {
        const notificationStats = await notificationService.getStatistics();
        setStats(notificationStats);
      } catch (error) {
        console.error('Failed to load notification stats:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      loadStats();
    }
  }, [userId]);

  // No need to sync unread count - we use the real-time hook's unreadCount directly


  const contextValue: NotificationContextType = {
    unreadCount,
    stats,
    isConnected,
    refreshNotifications,
    markAsRead,
    markAllAsRead,
    openNotificationCenter: () => setIsNotificationCenterOpen(true),
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
