import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';

interface WithPermissionProps {
  permission?: string | string[];
  requireAll?: boolean;
  children: (hasPermission: boolean) => React.ReactNode;
}

/**
 * Higher-order component that passes permission status as a render prop
 * 
 * @example
 * <WithPermission permission="create tasks">
 *   {(canCreate) => (
 *     <Button disabled={!canCreate}>Create Task</Button>
 *   )}
 * </WithPermission>
 */
export const WithPermission: React.FC<WithPermissionProps> = ({
  permission,
  requireAll = false,
  children,
}) => {
  const { hasPermission, hasAnyPermission, hasAllPermissions } = usePermissions();

  // If no permission is specified, render children with true (no restriction)
  if (!permission) {
    return <>{children(true)}</>;
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

  return <>{children(hasAccess)}</>;
};

