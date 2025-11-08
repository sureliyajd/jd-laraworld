export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string;
  parent_id?: number | null;
  created_at: string;
  updated_at: string;
  roles?: string[];
  role?: string;
  permissions?: string[];
  credits?: {
    [key: string]: {
      credits: number;
      used: number;
      available: number;
    };
  };
  task_stats?: UserTaskStats;
  created_tasks_count?: number;
  assigned_tasks_count?: number;
  completed_tasks_count?: number;
}

export interface UserTaskStats {
  created: number;
  assigned: number;
  completed: number;
  pending: number;
  overdue: number;
}

export interface CreateUserData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role?: string;
  credits?: {
    user?: number;
    email?: number;
    task?: number;
  };
}

export interface UpdateUserData {
  name?: string;
  email?: string;
  password?: string;
  password_confirmation?: string;
  role?: string | null;
  credits?: {
    user?: number;
    email?: number;
    task?: number;
  };
}

export interface Role {
  id: number;
  name: string;
}

export interface UserStatistics {
  total_users: number;
  verified_users: number;
  unverified_users: number;
  recent_users: number;
  users_with_tasks: number;
  most_active_users: Array<{
    id: number;
    name: string;
    email: string;
    created_tasks_count: number;
  }>;
}

export interface UserFilters {
  search?: string;
  email_verified?: 'all' | 'verified' | 'unverified';
  sort_by?: 'name' | 'email' | 'created_at' | 'updated_at';
  sort_order?: 'asc' | 'desc';
  per_page?: number;
  page?: number;
}

export interface UserListResponse {
  data: User[];
  meta: {
    total: number;
    per_page: number;
    current_page: number;
    last_page: number;
    from: number;
    to: number;
  };
}
