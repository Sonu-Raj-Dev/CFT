'use client';

import { createContext, useContext, useEffect, useState, useCallback, useMemo, type ReactNode } from 'react';
import { apiClient } from './api/axios-client';
import { LOGIN_URL } from './api/endpoints';
import { useToast } from '@/components/ui/use-toast';

export interface UserData {
  userId: number;
  userName: string;
  email: string;
  roleIds: number[];
  permissionNames: string[];
}

interface AuthContextType {
  user: UserData | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasPermission: (permission: string | string[]) => boolean;
  hasRole: (roleId: number | number[]) => boolean;
  hasAllPermissions: (permissions: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user_data');
        const token = localStorage.getItem('auth_token');

        if (storedUser && token) {
          const userData = JSON.parse(storedUser) as UserData;
          setUser(userData);
        }
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        localStorage.removeItem('user_data');
        localStorage.removeItem('auth_token');
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<boolean> => {
      try {
        setIsLoading(true);
        const response = await apiClient.postRaw<any>(LOGIN_URL, {
          email,
          password,
        });

        if (!response.success || !response.data) {
          toast({
            title: 'Login Failed',
            description: response.message || 'Invalid credentials',
            variant: 'destructive',
          });
          return false;
        }

        const userData: UserData = {
          userId: response.data.userId,
          userName: response.data.userName,
          email: response.data.email,
          roleIds: response.data.roleIds || [],
          permissionNames: response.data.permissionNames || [],
        };

        // Store token and user data
        apiClient.setToken(response.data.token);
        localStorage.setItem('user_data', JSON.stringify(userData));

        setUser(userData);

        toast({
          title: 'Success',
          description: 'Login successful',
        });

        return true;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Login failed';
        toast({
          title: 'Login Error',
          description: errorMessage,
          variant: 'destructive',
        });
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [toast]
  );

  const logout = useCallback(() => {
    apiClient.clearToken();
    localStorage.removeItem('user_data');
    setUser(null);

    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out',
    });

    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }, [toast]);

  const hasPermission = useCallback(
    (permission: string | string[]): boolean => {
      if (!user) return false;

      const permissions = Array.isArray(permission) ? permission : [permission];

      // Check if user has at least one of the permissions (OR logic)
      return permissions.some(p => user.permissionNames.includes(p));
    },
    [user]
  );

  const hasAllPermissions = useCallback(
    (permissions: string[]): boolean => {
      if (!user) return false;

      // Check if user has ALL permissions (AND logic)
      return permissions.every(p => user.permissionNames.includes(p));
    },
    [user]
  );

  const hasRole = useCallback(
    (roleId: number | number[]): boolean => {
      if (!user) return false;

      const roles = Array.isArray(roleId) ? roleId : [roleId];

      // Check if user has at least one of the roles
      return roles.some(r => user.roleIds.includes(r));
    },
    [user]
  );

  const isAuthenticated = useMemo(() => !!user && !!user.userId, [user]);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated,
      login,
      logout,
      hasPermission,
      hasAllPermissions,
      hasRole,
    }),
    [user, isLoading, isAuthenticated, login, logout, hasPermission, hasAllPermissions, hasRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
