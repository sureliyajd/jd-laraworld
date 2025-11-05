import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Bell, Check, CheckCheck, Trash2, Filter, X } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Separator } from './ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { notificationService, Notification, NotificationFilters } from '../services/notificationService';
import { useNotificationContext } from '../contexts/NotificationContext';
import { formatDistanceToNow } from 'date-fns';

interface NotificationCenterProps {
  userId: string;
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  userId,
  isOpen,
  onClose,
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<NotificationFilters>({
    sort_by: 'created_at',
    sort_direction: 'desc',
    per_page: 20,
  });
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

  // Use shared notification context to keep badge in sync
  const { unreadCount, totalCount, stats, markAsRead, markAllAsRead, deleteNotification } = useNotificationContext();

  // Load notifications
  const loadNotifications = async () => {
    setLoading(true);
    try {
      const currentFilters = {
        ...filters,
        read: activeTab === 'unread' ? false : undefined,
      };
      const response = await notificationService.getNotifications(currentFilters);
      setNotifications(response.data);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  // Load notifications on mount and when filters change
  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen, filters, activeTab]);

  // Auto-refresh notifications every 30 seconds when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      loadNotifications();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [isOpen]);

  // Handle mark as read
  const handleMarkAsRead = async (notification: Notification) => {
    if (notification.read_at) return;
    
    try {
      // Update local state optimistically for immediate UI feedback
      setNotifications(prev =>
        prev.map(n => n.id === notification.id ? { ...n, read_at: new Date().toISOString() } : n)
      );
      
      // Call the context function which will update the badge counter
      await markAsRead(notification.id);
      
      // Reload notifications to ensure consistency
      loadNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
      // Revert optimistic update on error
      loadNotifications();
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      // Update local state optimistically for immediate UI feedback
      setNotifications(prev =>
        prev.map(n => ({ ...n, read_at: new Date().toISOString() }))
      );
      
      // Call the context function which will update the badge counter
      await markAllAsRead();
      
      // Reload notifications to ensure consistency
      loadNotifications();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
      // Revert optimistic update on error
      loadNotifications();
    }
  };

  // Handle delete notification
  const handleDeleteNotification = async (notificationId: string) => {
    try {
      // Update local state optimistically for immediate UI feedback
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      // Call the context function which will update the badge counter
      await deleteNotification(notificationId);
      
      // Reload notifications to ensure consistency
      loadNotifications();
    } catch (error) {
      console.error('Failed to delete notification:', error);
      // Revert optimistic update on error
      loadNotifications();
    }
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'task_assigned':
        return '📋';
      case 'task_updated':
        return '✏️';
      default:
        return '🔔';
    }
  };

  // Get notification color based on type
  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'task_assigned':
        return 'bg-blue-50 border-blue-200';
      case 'task_updated':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  if (!isOpen) return null;

  const modalContent = (
    <div 
      className="fixed inset-0 bg-black/50 flex items-start justify-center pt-20 z-[9999]"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <Card 
        className="w-full max-w-2xl max-h-[70vh] mx-4 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <div className="flex items-center space-x-2">
            <Bell className="h-5 w-5" />
            <CardTitle>Notifications</CardTitle>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={unreadCount === 0}
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              Mark All Read
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'all' | 'unread')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all">
                All ({totalCount})
              </TabsTrigger>
              <TabsTrigger value="unread">
                Unread ({unreadCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              <div className="max-h-[300px]  overflow-y-auto border rounded-md">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No notifications found
                  </div>
                ) : (
                  <div className="space-y-3 p-4">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`p-4 rounded-lg border ${
                          notification.read_at ? 'opacity-60' : ''
                        } ${getNotificationColor(notification.data.type)} break-words`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            <span className="text-2xl">
                              {getNotificationIcon(notification.data.type)}
                            </span>
                            <div className="flex-1 min-w-0 max-w-full">
                              <p className="text-sm font-medium text-gray-900 break-words">
                                {notification.data.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                              </p>
                              {notification.data.task_title && (
                                <p className="text-xs text-gray-600 mt-1 break-words">
                                  Task: {notification.data.task_title}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-1">
                            {!notification.read_at && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleMarkAsRead(notification)}
                              >
                                <Check className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteNotification(notification.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                    {notifications.length > 5 && (
                      <div className="text-center py-2 text-xs text-gray-500 border-t">
                        Scroll to see more notifications
                      </div>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );

  return createPortal(modalContent, document.body);
};
