import { AUTH_CONFIG } from '@/config/auth';

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

type Listener = () => void;

class TaskService {
  private tasks: Task[] = [];
  private categories: Category[] = [];
  private loading = false;
  private error: string | null = null;
  private listeners: Set<Listener> = new Set();
  private tasksRequest: Promise<any> | null = null;
  private categoriesRequest: Promise<any> | null = null;
  private hasInitialized = false;

  private readonly API_BASE = AUTH_CONFIG.API_BASE_URL;

  private getAuthHeaders() {
    const token = localStorage.getItem('access_token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  subscribe(listener: Listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  getTasks() {
    return this.tasks;
  }

  getCategories() {
    return this.categories;
  }

  getLoading() {
    return this.loading;
  }

  getError() {
    return this.error;
  }

  async fetchTasks(filters: Record<string, any> = {}) {
    // If there's already a request in progress, return that promise
    if (this.tasksRequest) {
      return this.tasksRequest;
    }

    try {
      this.loading = true;
      this.error = null;
      this.notifyListeners();

      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'all') {
          queryParams.append(key, value.toString());
        }
      });

      const requestPromise = fetch(`${this.API_BASE}/tasks?${queryParams}`, {
        headers: this.getAuthHeaders(),
      }).then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch tasks');
        }
        return response.json();
      });

      this.tasksRequest = requestPromise;
      const data = await requestPromise;
      this.tasks = data.data || [];
      return data;
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to fetch tasks';
      throw err;
    } finally {
      this.loading = false;
      this.tasksRequest = null;
      this.notifyListeners();
    }
  }

  async fetchCategories() {
    // If there's already a request in progress, return that promise
    if (this.categoriesRequest) {
      return this.categoriesRequest;
    }

    try {
      const requestPromise = fetch(`${this.API_BASE}/categories`, {
        headers: this.getAuthHeaders(),
      }).then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch categories');
        }
        return response.json();
      });

      this.categoriesRequest = requestPromise;
      const data = await requestPromise;
      this.categories = data.data || [];
      return data;
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      throw err;
    } finally {
      this.categoriesRequest = null;
      this.notifyListeners();
    }
  }

  async fetchTask(id: number): Promise<Task | null> {
    try {
      const response = await fetch(`${this.API_BASE}/tasks/${id}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch task');
      }

      const data = await response.json();
      return data.data;
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to fetch task';
      this.notifyListeners();
      return null;
    }
  }

  async createTask(taskData: CreateTaskData): Promise<Task | null> {
    try {
      this.loading = true;
      this.error = null;
      this.notifyListeners();

      const response = await fetch(`${this.API_BASE}/tasks`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create task');
      }

      const data = await response.json();
      // Refresh tasks list
      await this.fetchTasks();
      return data.data;
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to create task';
      throw err;
    } finally {
      this.loading = false;
      this.notifyListeners();
    }
  }

  async updateTask(id: number, taskData: UpdateTaskData): Promise<Task | null> {
    try {
      // Do not toggle global loading for minor updates to avoid unmounting pages
      this.error = null;

      const response = await fetch(`${this.API_BASE}/tasks/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update task');
      }

      const data = await response.json();
      const updated: Task = data.data;
      // Optimistically update in-memory tasks to avoid full list refetch
      const index = this.tasks.findIndex(t => t.id === id);
      if (index !== -1) {
        this.tasks[index] = { ...this.tasks[index], ...updated };
      }
      this.notifyListeners();
      return updated;
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to update task';
      throw err;
    } finally {
      // No global loading change; listeners were notified after applying the update
    }
  }

  async deleteTask(id: number): Promise<boolean> {
    try {
      this.loading = true;
      this.error = null;
      this.notifyListeners();

      const response = await fetch(`${this.API_BASE}/tasks/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to delete task');
      }

      // Refresh tasks list
      await this.fetchTasks();
      return true;
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to delete task';
      throw err;
    } finally {
      this.loading = false;
      this.notifyListeners();
    }
  }

  async addComment(taskId: number, content: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.API_BASE}/task-comments`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
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
      this.error = err instanceof Error ? err.message : 'Failed to add comment';
      this.notifyListeners();
      return false;
    }
  }

  async updateTaskStatus(id: number, status: string): Promise<boolean> {
    return await this.updateTask(id, { status }) !== null;
  }

  async updateTaskPriority(id: number, priority: string): Promise<boolean> {
    return await this.updateTask(id, { priority }) !== null;
  }

  /**
   * Add a task to the list (for real-time updates when task is assigned)
   * Fetches full task details from API
   */
  async addTaskFromEvent(taskId: number): Promise<Task | null> {
    try {
      const task = await this.fetchTask(taskId);
      if (task) {
        // Check if task already exists in the list
        const existingIndex = this.tasks.findIndex(t => t.id === taskId);
        if (existingIndex === -1) {
          // Add new task to the beginning of the list
          this.tasks = [task, ...this.tasks];
          this.notifyListeners();
        }
        return task;
      }
      return null;
    } catch (err) {
      console.error('Failed to add task from event:', err);
      return null;
    }
  }

  /**
   * Update a task from real-time event data
   * Updates only the fields provided in the event
   */
  updateTaskFromEvent(taskId: number, eventData: Partial<Task>): void {
    const index = this.tasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
      // Merge the event data with existing task
      this.tasks[index] = { ...this.tasks[index], ...eventData };
      this.notifyListeners();
    }
  }

  async initialize() {
    if (!this.hasInitialized) {
      this.hasInitialized = true;
      await Promise.all([
        this.fetchTasks(),
        this.fetchCategories()
      ]);
    }
  }
}

// Export singleton instance
export const taskService = new TaskService();

// Export types
export type { Task, Category, TaskComment, TaskAttachment, CreateTaskData, UpdateTaskData };
