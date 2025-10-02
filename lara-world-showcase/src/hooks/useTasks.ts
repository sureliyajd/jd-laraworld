import { useState, useEffect, useRef } from 'react';

interface Task {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date: string | null;
  due_date_formatted: string | null;
  is_overdue: boolean;
  is_due_today: boolean;
  progress_percentage: number;
  category: {
    id: number;
    name: string;
    color: string;
    icon: string;
  } | null;
  creator: {
    id: number;
    name: string;
    email: string;
  };
  assignee: {
    id: number;
    name: string;
    email: string;
  } | null;
  comments_count: number;
  attachments_count: number;
  created_at: string;
  updated_at: string;
  subtasks?: Task[];
  comments?: TaskComment[];
  attachments?: TaskAttachment[];
}

interface TaskComment {
  id: number;
  content: string;
  is_system_comment: boolean;
  author_name: string;
  created_at: string;
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

interface TaskAttachment {
  id: number;
  filename: string;
  original_filename: string;
  mime_type: string;
  file_size: number;
  human_file_size: string;
  is_image: boolean;
  icon_class: string;
  url: string;
  uploaded_by: {
    id: number;
    name: string;
  };
  created_at: string;
}

interface Category {
  id: number;
  name: string;
  slug: string;
  color: string;
  icon: string;
  tasks_count: number;
}

interface CreateTaskData {
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  due_date?: string;
  estimated_hours?: number;
  category_id?: number;
  assigned_to?: number;
  parent_task_id?: number;
}

interface UpdateTaskData {
  title?: string;
  description?: string;
  status?: string;
  priority?: string;
  due_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  category_id?: number;
  assigned_to?: number;
}

const API_BASE = 'http://localhost:8000/api';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Request deduplication refs
  const tasksRequestRef = useRef<Promise<any> | null>(null);
  const categoriesRequestRef = useRef<Promise<any> | null>(null);
  const hasInitialized = useRef(false);

  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  };

  const fetchTasks = async (filters: Record<string, any> = {}) => {
    // If there's already a request in progress, return that promise
    if (tasksRequestRef.current) {
      return tasksRequestRef.current;
    }

    try {
      setLoading(true);
      setError(null);

      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          queryParams.append(key, value.toString());
        }
      });

      const requestPromise = fetch(`${API_BASE}/tasks?${queryParams}`, {
        headers: getAuthHeaders(),
      }).then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }
        return response.json();
      });

      tasksRequestRef.current = requestPromise;
      const data = await requestPromise;
      setTasks(data.data || []);
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks');
      throw err;
    } finally {
      setLoading(false);
      tasksRequestRef.current = null;
    }
  };

  const fetchCategories = async () => {
    // If there's already a request in progress, return that promise
    if (categoriesRequestRef.current) {
      return categoriesRequestRef.current;
    }

    try {
      const requestPromise = fetch(`${API_BASE}/categories`, {
        headers: getAuthHeaders(),
      }).then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        return response.json();
      });

      categoriesRequestRef.current = requestPromise;
      const data = await requestPromise;
      setCategories(data.data || []);
      return data;
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      throw err;
    } finally {
      categoriesRequestRef.current = null;
    }
  };

  const fetchTask = async (id: number): Promise<Task | null> => {
    try {
      const response = await fetch(`${API_BASE}/tasks/${id}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch task');
      }

      const data = await response.json();
      return data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch task');
      return null;
    }
  };

  const createTask = async (taskData: CreateTaskData): Promise<Task | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create task');
      }

      const data = await response.json();
      await fetchTasks(); // Refresh the list
      return data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create task');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateTask = async (id: number, taskData: UpdateTaskData): Promise<Task | null> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update task');
      }

      const data = await response.json();
      await fetchTasks(); // Refresh the list
      return data.data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteTask = async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE}/tasks/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      await fetchTasks(); // Refresh the list
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const addComment = async (taskId: number, content: string): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE}/task-comments`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          task_id: taskId,
          content,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add comment');
      }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add comment');
      return false;
    }
  };

  const updateTaskStatus = async (id: number, status: string): Promise<boolean> => {
    return await updateTask(id, { status }) !== null;
  };

  const updateTaskPriority = async (id: number, priority: string): Promise<boolean> => {
    return await updateTask(id, { priority }) !== null;
  };

  useEffect(() => {
    // Only initialize once to prevent multiple API calls
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      fetchTasks();
      fetchCategories();
    }
  }, []);

  return {
    tasks,
    categories,
    loading,
    error,
    fetchTasks,
    fetchTask,
    createTask,
    updateTask,
    deleteTask,
    addComment,
    updateTaskStatus,
    updateTaskPriority,
  };
};
