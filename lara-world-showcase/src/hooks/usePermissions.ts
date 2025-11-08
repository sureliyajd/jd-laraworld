import { useMemo } from 'react';
import { useAuth } from './useAuth';

/**
 * Hook to check user permissions
 * Provides permission checking utilities based on the current user's permissions
 */
export const usePermissions = () => {
  const { user } = useAuth();

  // Get user permissions from the user object
  const permissions = useMemo(() => {
    return user?.permissions || [];
  }, [user?.permissions]);

  /**
   * Check if user has a specific permission
   */
  const hasPermission = (permission: string): boolean => {
    if (!user || !permissions.length) return false;
    return permissions.includes(permission);
  };

  /**
   * Check if user has any of the specified permissions
   */
  const hasAnyPermission = (permissionList: string[]): boolean => {
    if (!user || !permissions.length) return false;
    return permissionList.some(permission => permissions.includes(permission));
  };

  /**
   * Check if user has all of the specified permissions
   */
  const hasAllPermissions = (permissionList: string[]): boolean => {
    if (!user || !permissions.length) return false;
    return permissionList.every(permission => permissions.includes(permission));
  };

  /**
   * Check if user has a specific role
   */
  const hasRole = (role: string): boolean => {
    if (!user || !user.roles) return false;
    const roles = Array.isArray(user.roles) ? user.roles : [];
    return roles.some((r: string | { name: string }) => {
      const roleName = typeof r === 'string' ? r : r.name;
      return roleName === role;
    });
  };

  /**
   * Check if user is super admin
   */
  const isSuperAdmin = (): boolean => {
    return hasRole('super_admin');
  };

  /**
   * Check if user is a public user (demo account)
   */
  const isPublicUser = (): boolean => {
    return hasRole('public');
  };

  /**
   * Permission checkers for specific modules
   */
  const can = {
    // User management permissions
    viewAllUsers: () => hasPermission('view all users'),
    viewUsers: () => hasPermission('view users') || hasPermission('view all users'),
    createUsers: () => hasPermission('create users'),
    editUsers: () => hasPermission('edit users'),
    deleteUsers: () => hasPermission('delete users'),

    // Task management permissions
    viewAllTasks: () => hasPermission('view all tasks'),
    viewAssignedTasks: () => hasPermission('view assigned tasks') || hasPermission('view all tasks'),
    createTasks: () => hasPermission('create tasks'),
    editTasks: () => hasPermission('edit tasks'),
    deleteTasks: () => hasPermission('delete tasks'),
    assignTasks: () => hasPermission('assign tasks'),
    changeTaskStatus: () => hasPermission('change task status'),
    changeTaskPriority: () => hasPermission('change task priority'),
    viewComments: () => hasPermission('view comments'),
    manageComments: () => hasPermission('manage comments'),
    viewAttachments: () => hasPermission('view attachments'),
    manageAttachments: () => hasPermission('manage attachments'),

    // Email permissions
    sendEmails: () => hasPermission('send emails'),
    viewEmailLogs: () => hasPermission('view email logs') || hasPermission('view all email logs'),
    viewAllEmailLogs: () => hasPermission('view all email logs'),
    manageEmailLogs: () => hasPermission('manage email logs'),

    // Roles and permissions
    viewRoles: () => hasPermission('view roles'),
    assignRoles: () => hasPermission('assign roles'),
    managePermissions: () => hasPermission('manage permissions'),
  };

  return {
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    isSuperAdmin,
    isPublicUser,
    can,
    isLoading: !user,
  };
};

