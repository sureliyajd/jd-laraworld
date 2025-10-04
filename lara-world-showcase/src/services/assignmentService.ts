import { 
  TaskAssignment, 
  CreateAssignmentData, 
  UpdateAssignmentData, 
  BulkAssignmentData, 
  AssignmentFilters, 
  AssignmentStatistics, 
  AssignmentListResponse 
} from '@/types/assignment';

type Listener = () => void;

class AssignmentService {
  private assignments: TaskAssignment[] = [];
  private loading = false;
  private error: string | null = null;
  private listeners: Set<Listener> = new Set();
  private assignmentsRequest: Promise<any> | null = null;

  private readonly API_BASE = 'http://localhost:8000/api';

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

  getAssignments() {
    return this.assignments;
  }

  getLoading() {
    return this.loading;
  }

  getError() {
    return this.error;
  }

  async fetchAssignments(filters: AssignmentFilters = {}): Promise<AssignmentListResponse> {
    if (this.assignmentsRequest) {
      return this.assignmentsRequest;
    }

    try {
      this.loading = true;
      this.error = null;
      this.notifyListeners();

      const queryParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });

      const requestPromise = fetch(`${this.API_BASE}/task-assignments?${queryParams}`, {
        headers: this.getAuthHeaders(),
      }).then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch assignments');
        }
        return response.json();
      });

      this.assignmentsRequest = requestPromise;
      const data = await requestPromise;
      this.assignments = data.data || [];
      return data;
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to fetch assignments';
      throw err;
    } finally {
      this.loading = false;
      this.assignmentsRequest = null;
      this.notifyListeners();
    }
  }

  async fetchTaskAssignments(taskId: number): Promise<TaskAssignment[]> {
    try {
      const response = await fetch(`${this.API_BASE}/tasks/${taskId}/assignments`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch task assignments');
      }

      const data = await response.json();
      return data.data;
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to fetch task assignments';
      this.notifyListeners();
      return [];
    }
  }

  async fetchUserAssignments(userId: number): Promise<TaskAssignment[]> {
    try {
      const response = await fetch(`${this.API_BASE}/users/${userId}/assignments`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user assignments');
      }

      const data = await response.json();
      return data.data;
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to fetch user assignments';
      this.notifyListeners();
      return [];
    }
  }

  async createAssignment(assignmentData: CreateAssignmentData): Promise<TaskAssignment | null> {
    try {
      this.loading = true;
      this.error = null;
      this.notifyListeners();

      const response = await fetch(`${this.API_BASE}/task-assignments`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(assignmentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(errorData.message || 'Failed to create assignment');
        (error as any).response = { data: errorData };
        (error as any).responseData = errorData;
        (error as any).data = errorData;
        (error as any).errors = errorData.errors;
        (error as any).messages = errorData.messages;
        throw error;
      }

      const data = await response.json();
      // Refresh assignments list
      await this.fetchAssignments();
      return data.data;
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to create assignment';
      throw err;
    } finally {
      this.loading = false;
      this.notifyListeners();
    }
  }

  async updateAssignment(id: number, assignmentData: UpdateAssignmentData): Promise<TaskAssignment | null> {
    try {
      this.loading = true;
      this.error = null;
      this.notifyListeners();

      const response = await fetch(`${this.API_BASE}/task-assignments/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(assignmentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(errorData.message || 'Failed to update assignment');
        (error as any).response = { data: errorData };
        (error as any).responseData = errorData;
        (error as any).data = errorData;
        (error as any).errors = errorData.errors;
        (error as any).messages = errorData.messages;
        throw error;
      }

      const data = await response.json();
      // Refresh assignments list
      await this.fetchAssignments();
      return data.data;
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to update assignment';
      throw err;
    } finally {
      this.loading = false;
      this.notifyListeners();
    }
  }

  async deleteAssignment(id: number): Promise<boolean> {
    try {
      this.loading = true;
      this.error = null;
      this.notifyListeners();

      const response = await fetch(`${this.API_BASE}/task-assignments/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(errorData.error || errorData.message || 'Failed to delete assignment');
        (error as any).response = { data: errorData };
        (error as any).responseData = errorData;
        (error as any).data = errorData;
        (error as any).errors = errorData.errors;
        (error as any).messages = errorData.messages;
        throw error;
      }

      // Refresh assignments list
      await this.fetchAssignments();
      return true;
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to delete assignment';
      throw err;
    } finally {
      this.loading = false;
      this.notifyListeners();
    }
  }

  async bulkAssign(bulkData: BulkAssignmentData): Promise<{ data: TaskAssignment[]; errors: string[] }> {
    try {
      this.loading = true;
      this.error = null;
      this.notifyListeners();

      const response = await fetch(`${this.API_BASE}/task-assignments/bulk-assign`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(bulkData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(errorData.message || 'Failed to bulk assign users');
        (error as any).response = { data: errorData };
        (error as any).responseData = errorData;
        (error as any).data = errorData;
        (error as any).errors = errorData.errors;
        (error as any).messages = errorData.messages;
        throw error;
      }

      const data = await response.json();
      // Refresh assignments list
      await this.fetchAssignments();
      return {
        data: data.data || [],
        errors: data.errors || []
      };
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to bulk assign users';
      throw err;
    } finally {
      this.loading = false;
      this.notifyListeners();
    }
  }

  async fetchAssignmentStatistics(): Promise<AssignmentStatistics | null> {
    try {
      const response = await fetch(`${this.API_BASE}/task-assignments/statistics/overview`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch assignment statistics');
      }

      const data = await response.json();
      return data.data;
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to fetch assignment statistics';
      this.notifyListeners();
      return null;
    }
  }
}

// Export singleton instance
export const assignmentService = new AssignmentService();

// Export types
export type { TaskAssignment, CreateAssignmentData, UpdateAssignmentData, BulkAssignmentData, AssignmentFilters, AssignmentStatistics, AssignmentListResponse };
