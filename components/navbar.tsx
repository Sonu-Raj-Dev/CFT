'use client';

import { useAuth } from '@/lib/auth-context';
import { useRouter } from 'next/navigation';
import { PermissionGuard } from './permission-guard';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, User, Settings } from 'lucide-react';

export function Navbar() {
  const { user, logout, isAuthenticated } = useAuth();
  const router = useRouter();

  if (!isAuthenticated) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav className="border-b border-border bg-background">
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <h1 className="text-2xl font-bold text-foreground">Complaint Management System</h1>

          <div className="flex items-center gap-6 ml-auto">
            <PermissionGuard permission={['Complaint.View']}>
              <Button
                variant="ghost"
                onClick={() => router.push('/dashboard')}
              >
                Dashboard
              </Button>
            </PermissionGuard>

            <PermissionGuard permission={['Complaint.Create']}>
              <Button
                variant="ghost"
                onClick={() => router.push('/complaints/new')}
              >
                New Complaint
              </Button>
            </PermissionGuard>

            <PermissionGuard permission={['User.View', 'Role.View', 'Customer.View', 'Engineer.View']}>
              <Button
                variant="ghost"
                onClick={() => router.push('/admin')}
              >
                Admin
              </Button>
            </PermissionGuard>
          </div>
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm">
              <User className="w-4 h-4 mr-2" />
              {user?.userName}
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end">
            <div className="px-2 py-1.5 text-sm">
              <p className="font-medium">{user?.userName}</p>
              <p className="text-muted-foreground text-xs">{user?.email}</p>
            </div>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={() => router.push('/profile')}>
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>

            <PermissionGuard permission={['Role.View', 'Permission.View', 'User.View']}>
              <DropdownMenuItem onClick={() => router.push('/settings')}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
            </PermissionGuard>

            <DropdownMenuSeparator />

            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </nav>
  );
}
