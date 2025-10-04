import { useState, useEffect } from 'react';
import { assignmentService } from '@/services/assignmentService';
import type { TaskAssignment, AssignmentFilters, CreateAssignmentData, UpdateAssignmentData, BulkAssignmentData, AssignmentStatistics } from '@/types/assignment';

export const useAssignmentService = () => {
  const [assignments, setAssignments] = useState<TaskAssignment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = assignmentService.subscribe(() => {
      setAssignments(assignmentService.getAssignments());
      setLoading(assignmentService.getLoading());
      setError(assignmentService.getError());
    });

    // Initialize with current state
    setAssignments(assignmentService.getAssignments());
    setLoading(assignmentService.getLoading());
    setError(assignmentService.getError());

    return unsubscribe;
  }, []);

  const fetchAssignments = async (filters: AssignmentFilters = {}) => {
    try {
      setError(null);
      await assignmentService.fetchAssignments(filters);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch assignments');
    }
  };

  const fetchTaskAssignments = async (taskId: number): Promise<TaskAssignment[]> => {
    try {
      setError(null);
      return await assignmentService.fetchTaskAssignments(taskId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch task assignments');
      return [];
    }
  };

  const fetchUserAssignments = async (userId: number): Promise<TaskAssignment[]> => {
    try {
      setError(null);
      return await assignmentService.fetchUserAssignments(userId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user assignments');
      return [];
    }
  };

  const createAssignment = async (assignmentData: CreateAssignmentData): Promise<TaskAssignment | null> => {
    try {
      setError(null);
      return await assignmentService.createAssignment(assignmentData);
    } catch (err) {
      // Don't set global error for validation errors - let the component handle them
      if (err instanceof Error && !err.message.includes('already assigned') && !err.message.includes('field is required')) {
        setError(err.message);
      }
      throw err;
    }
  };

  const updateAssignment = async (id: number, assignmentData: UpdateAssignmentData): Promise<TaskAssignment | null> => {
    try {
      setError(null);
      return await assignmentService.updateAssignment(id, assignmentData);
    } catch (err) {
      // Don't set global error for validation errors - let the component handle them
      if (err instanceof Error && !err.message.includes('field is required')) {
        setError(err.message);
      }
      throw err;
    }
  };

  const deleteAssignment = async (id: number): Promise<boolean> => {
    try {
      setError(null);
      return await assignmentService.deleteAssignment(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete assignment');
      throw err;
    }
  };

  const bulkAssign = async (bulkData: BulkAssignmentData): Promise<{ data: TaskAssignment[]; errors: string[] }> => {
    try {
      setError(null);
      return await assignmentService.bulkAssign(bulkData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to bulk assign users');
      throw err;
    }
  };

  const fetchAssignmentStatistics = async (): Promise<AssignmentStatistics | null> => {
    try {
      setError(null);
      return await assignmentService.fetchAssignmentStatistics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch assignment statistics');
      return null;
    }
  };

  return {
    assignments,
    loading,
    error,
    fetchAssignments,
    fetchTaskAssignments,
    fetchUserAssignments,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    bulkAssign,
    fetchAssignmentStatistics,
  };
};
