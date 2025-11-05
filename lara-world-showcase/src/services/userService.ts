import { 
  User, 
  CreateUserData, 
  UpdateUserData, 
  UserStatistics, 
  UserFilters, 
  UserListResponse 
} from '@/types/user';
import { AUTH_CONFIG } from '@/config/auth';

type Listener = () => void;

class UserService {
  private users: User[] = [];
  private loading = false;
  private error: string | null = null;
  private listeners: Set<Listener> = new Set();
  private usersRequest: Promise<any> | null = null;
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

  getUsers() {
    return this.users;
  }

  getLoading() {
    return this.loading;
  }

  getError() {
    return this.error;
  }

  async fetchUsers(filters: UserFilters = {}): Promise<UserListResponse> {
    // If there's already a request in progress, return that promise
    if (this.usersRequest) {
      return this.usersRequest;
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

      const requestPromise = fetch(`${this.API_BASE}/users?${queryParams}`, {
        headers: this.getAuthHeaders(),
      }).then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to fetch users');
        }
        return response.json();
      });

      this.usersRequest = requestPromise;
      const data = await requestPromise;
      this.users = data.data || [];
      return data;
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to fetch users';
      throw err;
    } finally {
      this.loading = false;
      this.usersRequest = null;
      this.notifyListeners();
    }
  }

  async fetchUser(id: number): Promise<User | null> {
    try {
      const response = await fetch(`${this.API_BASE}/users/${id}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user');
      }

      const data = await response.json();
      return data.data;
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to fetch user';
      this.notifyListeners();
      return null;
    }
  }

  async createUser(userData: CreateUserData): Promise<User | null> {
    try {
      this.loading = true;
      this.error = null;
      this.notifyListeners();

      const response = await fetch(`${this.API_BASE}/users`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(errorData.message || 'Failed to create user');
        // Preserve the original response data for validation errors
        (error as any).response = { data: errorData };
        (error as any).responseData = errorData;
        (error as any).data = errorData; // Direct access to error data
        (error as any).errors = errorData.errors; // Direct access to validation errors
        (error as any).messages = errorData.messages; // Direct access to messages
        throw error;
      }

      const data = await response.json();
      // Refresh users list
      await this.fetchUsers();
      return data.data;
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to create user';
      throw err;
    } finally {
      this.loading = false;
      this.notifyListeners();
    }
  }

  async updateUser(id: number, userData: UpdateUserData): Promise<User | null> {
    try {
      this.loading = true;
      this.error = null;
      this.notifyListeners();

      const response = await fetch(`${this.API_BASE}/users/${id}`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(errorData.message || 'Failed to update user');
        // Preserve the original response data for validation errors
        (error as any).response = { data: errorData };
        (error as any).responseData = errorData;
        (error as any).data = errorData; // Direct access to error data
        (error as any).errors = errorData.errors; // Direct access to validation errors
        (error as any).messages = errorData.messages; // Direct access to messages
        throw error;
      }

      const data = await response.json();
      // Refresh users list
      await this.fetchUsers();
      return data.data;
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to update user';
      throw err;
    } finally {
      this.loading = false;
      this.notifyListeners();
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      this.loading = true;
      this.error = null;
      this.notifyListeners();

      const response = await fetch(`${this.API_BASE}/users/${id}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        const errorData = await response.json();
        const error = new Error(errorData.error || errorData.message || 'Failed to delete user');
        // Preserve the original response data for validation errors
        (error as any).response = { data: errorData };
        throw error;
      }

      // Refresh users list
      await this.fetchUsers();
      return true;
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to delete user';
      throw err;
    } finally {
      this.loading = false;
      this.notifyListeners();
    }
  }

  async fetchUserStatistics(): Promise<UserStatistics | null> {
    try {
      const response = await fetch(`${this.API_BASE}/users/statistics/overview`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user statistics');
      }

      const data = await response.json();
      return data.data;
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to fetch user statistics';
      this.notifyListeners();
      return null;
    }
  }

  async fetchAllUsers(): Promise<User[]> {
    try {
      const response = await fetch(`${this.API_BASE}/users/all/list`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch all users');
      }

      const data = await response.json();
      return data.data;
    } catch (err) {
      this.error = err instanceof Error ? err.message : 'Failed to fetch all users';
      this.notifyListeners();
      return [];
    }
  }

  async initialize() {
    if (!this.hasInitialized) {
      this.hasInitialized = true;
      await this.fetchUsers();
    }
  }
}

// Export singleton instance
export const userService = new UserService();

// Export types
export type { User, CreateUserData, UpdateUserData, UserStatistics, UserFilters, UserListResponse };
