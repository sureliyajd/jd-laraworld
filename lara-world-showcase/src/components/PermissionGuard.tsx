import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';

interface PermissionGuardProps {
  permission?: string | string[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
  showError?: boolean;
  errorMessage?: string;
}

/**
 * Component that conditionally renders children based on user permissions
 * 
 * @example
 * <PermissionGuard permission="create tasks">
 *   <Button>Create Task</Button>
 * </PermissionGuard>
 * 
 * @example
 * <PermissionGuard permission={["edit tasks", "delete tasks"]} requireAll>
 *   <Button>Edit/Delete</Button>
 * </PermissionGuard>
 */
export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  requireAll = false,
  fallback = null,
  children,
  showError = false,
  errorMessage = 'You do not have permission to access this content',
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  // If no permission is specified, render children (no restriction)
  if (!permission) {
    return <>{children}</>;
  }

  // Check permissions
  let hasAccess = false;
  
  if (Array.isArray(permission)) {
    hasAccess = requireAll 
      ? hasAllPermissions(permission)
      : hasAnyPermission(permission);
  } else {
    hasAccess = hasPermission(permission);
  }

  // Render based on permission check
  if (!hasAccess) {
    if (showError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md">
          <p className="text-red-800 text-sm">{errorMessage}</p>
        </div>
      );
    }
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

