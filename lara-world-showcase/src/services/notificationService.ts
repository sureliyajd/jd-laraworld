// API configuration
const API_BASE = 'http://localhost:8000/api';

// Helper function to get auth headers
const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
  };
};

export interface Notification {
  id: string;
  type: string;
  data: {
    task_id?: number;
    task_title?: string;
    assigner_id?: number;
    assigner_name?: string;
    updated_by_id?: number;
    updated_by_name?: string;
    priority?: string;
    status?: string;
    due_date?: string;
    changes?: Record<string, any>;
    type: string;
    message: string;
  };
  read_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  by_type: Record<string, number>;
  recent: number;
}

export interface NotificationFilters {
  type?: string;
  read?: boolean;
  sort_by?: string;
  sort_direction?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

export const notificationService = {
  // Get notifications with filters
  async getNotifications(filters: NotificationFilters = {}): Promise<{
    data: Notification[];
    pagination: {
      current_page: number;
      last_page: number;
      per_page: number;
      total: number;
    };
  }> {
    const params = new URLSearchParams();
    
    if (filters.type) params.append('type', filters.type);
    if (filters.read !== undefined) params.append('read', filters.read.toString());
    if (filters.sort_by) params.append('sort_by', filters.sort_by);
    if (filters.sort_direction) params.append('sort_direction', filters.sort_direction);
    if (filters.per_page) params.append('per_page', filters.per_page.toString());
    if (filters.page) params.append('page', filters.page.toString());

    const response = await fetch(`${API_BASE}/notifications?${params.toString()}`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }

    return response.json();
  },

  // Get notification statistics
  async getStatistics(): Promise<NotificationStats> {
    const response = await fetch(`${API_BASE}/notifications/statistics`, {
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch notification statistics');
    }

    const data = await response.json();
    return data.data;
  },

  // Mark notification as read
  async markAsRead(notificationId: string): Promise<Notification> {
    const response = await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to mark notification as read');
    }

    const data = await response.json();
    return data.data;
  },

  // Mark multiple notifications as read
  async markMultipleAsRead(notificationIds: string[]): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE}/notifications/mark-multiple-read`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        notification_ids: notificationIds,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to mark multiple notifications as read');
    }

    return response.json();
  },

  // Mark all notifications as read
  async markAllAsRead(): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE}/notifications/mark-all-read`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to mark all notifications as read');
    }

    return response.json();
  },

  // Delete notification
  async deleteNotification(notificationId: string): Promise<{ message: string }> {
    const response = await fetch(`${API_BASE}/notifications/${notificationId}`, {
      method: 'DELETE',
      headers: getAuthHeaders(),
    });

    if (!response.ok) {
      throw new Error('Failed to delete notification');
    }

    return response.json();
  },
};
