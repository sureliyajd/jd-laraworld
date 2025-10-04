export interface TaskAssignment {
  id: number;
  role: 'assignee' | 'collaborator' | 'watcher';
  role_label: string;
  role_color: string;
  notes?: string;
  assigned_at: string;
  assigned_at_formatted: string;
  unassigned_at?: string;
  duration?: number;
  human_duration?: string;
  is_active: boolean;
  task?: {
    id: number;
    title: string;
    status: string;
    priority: string;
    due_date?: string;
    due_date_formatted?: string;
  };
  user?: {
    id: number;
    name: string;
    email: string;
  };
  assigner?: {
    id: number;
    name: string;
    email: string;
  };
  links?: {
    self: string;
    update: string;
    delete: string;
    task: string;
    user: string;
  };
}

export interface CreateAssignmentData {
  task_id: number;
  user_id: number;
  role: 'assignee' | 'collaborator' | 'watcher';
  notes?: string;
}

export interface UpdateAssignmentData {
  role?: 'assignee' | 'collaborator' | 'watcher';
  notes?: string;
}

export interface BulkAssignmentData {
  task_id: number;
  assignments: Array<{
    user_id: number;
    role: 'assignee' | 'collaborator' | 'watcher';
    notes?: string;
  }>;
}

export interface AssignmentFilters {
  task_id?: number;
  user_id?: number;
  role?: 'assignee' | 'collaborator' | 'watcher';
  active_only?: boolean;
  sort_by?: 'assigned_at' | 'role' | 'user_id';
  sort_order?: 'asc' | 'desc';
}

export interface AssignmentStatistics {
  total_assignments: number;
  assignments_by_role: Record<string, number>;
  recent_assignments: number;
  most_assigned_users: Array<{
    user: {
      id: number;
      name: string;
      email: string;
    };
    assignments_count: number;
  }>;
}

export interface AssignmentListResponse {
  data: TaskAssignment[];
}

// Role configurations for UI
export const ASSIGNMENT_ROLES = {
  assignee: {
    label: 'Assigned',
    color: 'blue',
    description: 'Primary person responsible for the task'
  },
  collaborator: {
    label: 'Collaborator', 
    color: 'green',
    description: 'Helps with the task but not primarily responsible'
  },
  watcher: {
    label: 'Watcher',
    color: 'gray', 
    description: 'Receives updates but not actively involved'
  }
} as const;

export type AssignmentRole = keyof typeof ASSIGNMENT_ROLES;
