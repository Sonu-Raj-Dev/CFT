'use client';

import { useRouter } from 'next/navigation';
import { useEffect, type ReactNode } from 'react';
import { useAuth } from '@/lib/auth-context';
import { Spinner } from '@/components/ui/spinner';

interface ProtectedRouteProps {
  children: ReactNode;
  requiredPermission?: string | string[];
  requiredRole?: number | number[];
  fallbackPath?: string;
}

/**
 * Component to protect routes based on authentication and permissions
 * 
 * Usage:
 * <ProtectedRoute requiredPermission="Complaint.View">
 *   <ComplaintPage />
 * </ProtectedRoute>
 */
export function ProtectedRoute({
  children,
  requiredPermission,
  requiredRole,
  fallbackPath = '/login',
}: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, hasPermission, hasRole } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    // Check if user is authenticated
    if (!isAuthenticated) {
      router.push(fallbackPath);
      return;
    }

    // Check permissions if required
    if (requiredPermission && !hasPermission(requiredPermission)) {
      router.push('/unauthorized');
      return;
    }

    // Check roles if required
    if (requiredRole && !hasRole(requiredRole)) {
      router.push('/unauthorized');
      return;
    }
  }, [isAuthenticated, isLoading, requiredPermission, requiredRole, hasPermission, hasRole, router, fallbackPath]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner />
      </div>
    );
  }

  // If authentication check passes and permissions/role checks pass (or not required)
  if (isAuthenticated && (!requiredPermission || hasPermission(requiredPermission)) && (!requiredRole || hasRole(requiredRole))) {
    return <>{children}</>;
  }

  return null;
}
