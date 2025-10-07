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
import { useRealtimeNotifications } from '../hooks/useRealtimeNotifications';
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
  const [stats, setStats] = useState<{
    total: number;
    unread: number;
    by_type: Record<string, number>;
    recent: number;
  } | null>(null);

  // Use real-time notifications hook
  const { unreadCount, markAsRead, markAllAsRead, refreshNotifications } = useRealtimeNotifications({
    userId,
    enabled: isOpen,
  });

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

  // Load statistics
  const loadStats = async () => {
    try {
      const statsData = await notificationService.getStatistics();
      setStats(statsData);
    } catch (error) {
      console.error('Failed to load notification statistics:', error);
    }
  };

  // Load notifications on mount and when filters change
  useEffect(() => {
    if (isOpen) {
      loadNotifications();
      loadStats();
    }
  }, [isOpen, filters, activeTab]);

  // Auto-refresh notifications every 30 seconds when modal is open
  useEffect(() => {
    if (!isOpen) return;

    const interval = setInterval(() => {
      loadNotifications();
      loadStats();
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [isOpen]);

  // Handle mark as read
  const handleMarkAsRead = async (notification: Notification) => {
    if (notification.read_at) return;
    
    try {
      await markAsRead(notification.id);
      setNotifications(prev =>
        prev.map(n => n.id === notification.id ? { ...n, read_at: new Date().toISOString() } : n)
      );
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  // Handle mark all as read
  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
      setNotifications(prev =>
        prev.map(n => ({ ...n, read_at: new Date().toISOString() }))
      );
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  // Handle delete notification
  const handleDeleteNotification = async (notificationId: string) => {
    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
    } catch (error) {
      console.error('Failed to delete notification:', error);
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
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount}</Badge>
            )}
            {stats && (
              <div className="flex items-center space-x-2 ml-2">
                <Badge variant="outline" className="text-xs">
                  Total: {stats.total}
                </Badge>
                {stats.recent > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    Recent: {stats.recent}
                  </Badge>
                )}
              </div>
            )}
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
          {/* Statistics Overview */}
          {stats && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-xs text-gray-600">Total</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.unread}</div>
                <div className="text-xs text-gray-600">Unread</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.recent}</div>
                <div className="text-xs text-gray-600">Recent (7d)</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Object.keys(stats.by_type).length}
                </div>
                <div className="text-xs text-gray-600">Types</div>
              </div>
            </div>
          )}

          {/* Type Breakdown */}
          {stats && Object.keys(stats.by_type).length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">By Type</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(stats.by_type).map(([type, count]) => (
                  <Badge key={type} variant="outline" className="text-xs">
                    {type.replace('_', ' ')}: {count}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Filters */}
          <div className="flex items-center space-x-2">
            <Select
              value={filters.type || 'all'}
              onValueChange={(value) =>
                setFilters(prev => ({ ...prev, type: value === 'all' ? undefined : value }))
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="task_assigned">Task Assigned</SelectItem>
                <SelectItem value="task_updated">Task Updated</SelectItem>
              </SelectContent>
            </Select>

            <Select
              value={filters.sort_by || 'created_at'}
              onValueChange={(value) =>
                setFilters(prev => ({ ...prev, sort_by: value }))
              }
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Date</SelectItem>
                <SelectItem value="type">Type</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'all' | 'unread')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all">
                All {stats && `(${stats.total})`}
              </TabsTrigger>
              <TabsTrigger value="unread">
                Unread ({unreadCount})
              </TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              <div className="h-[400px] max-h-[50vh] overflow-y-auto border rounded-md p-4">
                {loading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    No notifications found
                  </div>
                ) : (
                  <div className="space-y-3 pb-4">
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
