'use client';

import { type ReactNode } from 'react';
import { useAuth } from '@/lib/auth-context';

interface PermissionGuardProps {
  permission: string | string[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component to conditionally render based on user permissions
 * 
 * Usage - Single permission:
 * <PermissionGuard permission="Complaint.Create">
 *   <CreateComplaintButton />
 * </PermissionGuard>
 * 
 * Usage - Multiple permissions (user needs ANY one):
 * <PermissionGuard permission={["Complaint.Edit", "Complaint.Delete"]}>
 *   <MoreActionsMenu />
 * </PermissionGuard>
 * 
 * Usage - With fallback:
 * <PermissionGuard permission="Complaint.Delete" fallback={<p>No delete permission</p>}>
 *   <DeleteButton />
 * </PermissionGuard>
 */
export function PermissionGuard({ permission, children, fallback }: PermissionGuardProps) {
  const { hasPermission } = useAuth();

  if (!hasPermission(permission)) {
    return <>{fallback ?? null}</>;
  }

  return <>{children}</>;
}

interface RoleGuardProps {
  roleId: number | number[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component to conditionally render based on user role
 * 
 * Usage:
 * <RoleGuard roleId={2}>
 *   <EngineersOnlyContent />
 * </RoleGuard>
 */
export function RoleGuard({ roleId, children, fallback }: RoleGuardProps) {
  const { hasRole } = useAuth();

  if (!hasRole(roleId)) {
    return <>{fallback ?? null}</>;
  }

  return <>{children}</>;
}

interface RequireAllPermissionsProps {
  permissions: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Component to conditionally render only if user has ALL specified permissions
 * 
 * Usage:
 * <RequireAllPermissions permissions={["Complaint.View", "Complaint.Edit"]}>
 *   <EditableComplaintView />
 * </RequireAllPermissions>
 */
export function RequireAllPermissions({ permissions, children, fallback }: RequireAllPermissionsProps) {
  const { hasAllPermissions } = useAuth();

  if (!hasAllPermissions(permissions)) {
    return <>{fallback ?? null}</>;
  }

  return <>{children}</>;
}
