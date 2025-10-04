import { useState, useEffect } from 'react';
import { userService } from '@/services/userService';
import type { User, UserFilters, CreateUserData, UpdateUserData, UserStatistics } from '@/types/user';

export const useUserService = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = userService.subscribe(() => {
      setUsers(userService.getUsers());
      setLoading(userService.getLoading());
      setError(userService.getError());
    });

    // Initialize with current state
    setUsers(userService.getUsers());
    setLoading(userService.getLoading());
    setError(userService.getError());

    return unsubscribe;
  }, []);

  const fetchUsers = async (filters: UserFilters = {}) => {
    try {
      setError(null);
      await userService.fetchUsers(filters);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch users');
    }
  };

  const fetchUser = async (id: number): Promise<User | null> => {
    try {
      setError(null);
      return await userService.fetchUser(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user');
      return null;
    }
  };

  const createUser = async (userData: CreateUserData): Promise<User | null> => {
    try {
      setError(null);
      return await userService.createUser(userData);
    } catch (err) {
      // Don't set global error for validation errors - let the component handle them
      // Only set global error for actual service failures
      if (err instanceof Error && !err.message.includes('field is required') && !err.message.includes('already registered') && !err.message.includes('must contain')) {
        setError(err.message);
      }
      throw err; // Re-throw to preserve the original error with response data
    }
  };

  const updateUser = async (id: number, userData: UpdateUserData): Promise<User | null> => {
    try {
      setError(null);
      return await userService.updateUser(id, userData);
    } catch (err) {
      // Don't set global error for validation errors - let the component handle them
      // Only set global error for actual service failures
      if (err instanceof Error && !err.message.includes('field is required') && !err.message.includes('already registered') && !err.message.includes('must contain')) {
        setError(err.message);
      }
      throw err; // Re-throw to preserve the original error with response data
    }
  };

  const deleteUser = async (id: number): Promise<boolean> => {
    try {
      setError(null);
      return await userService.deleteUser(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete user');
      throw err;
    }
  };

  const fetchUserStatistics = async (): Promise<UserStatistics | null> => {
    try {
      setError(null);
      return await userService.fetchUserStatistics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch user statistics');
      return null;
    }
  };

  const fetchAllUsers = async (): Promise<User[]> => {
    try {
      setError(null);
      return await userService.fetchAllUsers();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch all users');
      return [];
    }
  };

  const initialize = async () => {
    try {
      setError(null);
      await userService.initialize();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize user service');
    }
  };

  return {
    users,
    loading,
    error,
    fetchUsers,
    fetchUser,
    createUser,
    updateUser,
    deleteUser,
    fetchUserStatistics,
    fetchAllUsers,
    initialize,
  };
};
