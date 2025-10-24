"use client";

import { useState, useEffect } from "react";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import Footer from "@/components/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useMasterData } from "@/lib/master-data-context";
import { fetchRoles, fetchUsers, CreateRolePermissions, fetchUserRoles } from "@/repositories/masters-repo";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Trash2, Loader2, Save, X } from "lucide-react";
import { id } from "date-fns/locale";

interface UserRole {
  id: string;
  userId: string;
  roleId: string;
  userName: string;
  roleName: string;
}

interface User {
  id: string;
  name: string;
  email: string;
}

interface Role {
  id: string;
  name: string;
}

export default function UserRoleMappingPage() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { users, userRoles, setUserRoles } = useMasterData();
  const [user, setUser] = useState<any>(null);
  const [usersData, setUserData] = useState<User[]>([]);
  const [rolesData, setRolesData] = useState<Role[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [role, setRole] = useState("");
  const [userRolesData, setUserRolesData] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("cft_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        console.error("Invalid JSON in cft_user");
      }
    }
  }, []);

  const fetchUsersData = async () => {
    try {
      const usersData = await fetchUsers();
      console.log(`userData`, usersData);

      if (usersData?.data?.length > 0) {
        const formattedData = usersData.data.map((x: any) => x.data) ?? [];
        setUserData(formattedData);
      } else {
        setUserData([]);
      }
    } catch (error) {
      alert("Error while fetching users");
      setUserData([]);
    }
  };

  const fetchRolesData = async () => {
    try {
      const rolesData = await fetchRoles();
      console.log(`rolesData`, rolesData);

      if (rolesData?.data?.length > 0) {
        const formattedData = rolesData.data.map((x: any) => x.data) ?? [];
        setRolesData(formattedData);
      } else {
        setRolesData([]);
      }
    } catch (error) {
      alert("Error while fetching roles");
      setRolesData([]);
    }
  };

  const fetchUserRolesData = async () => {
    try {
      setLoading(true);
      const userRolesResponse = await fetchUserRoles();
      console.log("userRolesResponse", userRolesResponse);
      
      if (userRolesResponse?.data?.length > 0) {
        // Map the data to include user and role names
        const formattedData = userRolesResponse.data.map((x: any) => x.data) ?? [];
        const formattedUserRoles = formattedData.map((item: any) => ({
          id: item.id,
          userId: item.userId,
          roleId: item.roleId,
          userName: item.name || 'Unknown User',
          roleName: item.roleName || 'Unknown Role'
        }));
        console.log("formattedUserRoles", formattedUserRoles);
        setUserRolesData(formattedUserRoles);
      } else {
        setUserRolesData([]);
      }
    } catch (error) {
      console.error("Error fetching user roles:", error);
      alert("Error while fetching user roles");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsersData();
    fetchRolesData();
  }, []);

  useEffect(() => {
    if (usersData.length > 0 && rolesData.length > 0) {
      fetchUserRolesData();
    }
  }, [usersData, rolesData]);

  const assignRole = async () => {
    try {
      const payload = {
        id: editingId || 0,
        userId: selectedUserId || 0,
        roleId: role || 0,
        isactive: true
      };

      if (!payload.userId || !payload.roleId) {
        alert("Please select both a user and a role");
        return;
      }

      console.log('Assigning role with payload:', payload);
      
      if (isEditing && editingId) {
        // Update existing role assignment
        await CreateRolePermissions(payload);
        alert("Role assignment updated successfully!");
        setIsEditing(false);
        setEditingId(null);
      } else {
        // Create new role assignment
        const result = await CreateRolePermissions(payload);
        console.log('Role assigned successfully:', result);
        alert("Role assigned successfully!");
      }

      // Refresh the user roles data
      await fetchUserRolesData();

      // Clear the form
      setSelectedUserId("");
      setRole("");

    } catch (error) {
      console.error('Error in assignRole:', error);
      alert("Error while assigning role");
    }
  };

  const handleEdit = (userRole: UserRole) => {
    setEditingId(userRole.id);
    setIsEditing(true);
    setSelectedUserId(userRole.userId);
    setRole(userRole.roleId);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setIsEditing(false);
    setSelectedUserId("");
    setRole("");
  };

  const handleDelete = async (userRole: UserRole) => {
    if (!confirm(`Are you sure you want to remove ${userRole.roleName} role from ${userRole.userName}?`)) {
      return;
    }
    try {
      setLoading(true);
      const payload = {
      id: userRole.id, // Use the userRole.id directly
      userId: userRole.userId, // Use the userRole.userId directly
      roleId: userRole.roleId, // Use the userRole.roleId directly
      isactive: false
    };
      debugger;
      await CreateRolePermissions(payload);
      alert("Role assignment deleted successfully!");
      await fetchUserRolesData();
    } catch (error) {
      console.error("Error deleting user role:", error);
      alert("Error while deleting role assignment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col lg:ml-[60px] mt-[60px]">
        <Header user={user} onMenuClick={() => setIsMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-auto p-4 md:p-8 space-y-6">
          {/* Assignment Card */}
          <Card className="shadow-lg max-w-2xl">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl font-bold">
                {isEditing ? "Edit Role Assignment" : "Assign Role to User"}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Select User</Label>
                <Select
                  value={selectedUserId}
                  onValueChange={setSelectedUserId}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choose user" />
                  </SelectTrigger>
                  <SelectContent>
                    {usersData?.map((u: User) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u?.name} - {u?.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Select Role</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose role" />
                  </SelectTrigger>
                  <SelectContent>
                    {rolesData?.map((r: Role) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r?.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex space-x-3">
                <Button
                  onClick={assignRole}
                  disabled={!selectedUserId || !role}
                  className={`${
                    isEditing 
                      ? "bg-gradient-to-r from-green-500 to-green-400" 
                      : "bg-gradient-to-r from-blue-500 to-cyan-400"
                  }`}
                >
                  {isEditing ? "Update Role" : "Assign Role"}
                </Button>
                
                {isEditing && (
                  <Button
                    onClick={handleCancelEdit}
                    variant="outline"
                    className="border-gray-300"
                  >
                    Cancel
                  </Button>
                )}
              </div>
              
              {isEditing && (
                <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-md">
                  <strong>Editing Mode:</strong> You are currently editing an existing role assignment. 
                  Click "Update Role" to save changes or "Cancel" to discard.
                </div>
              )}
            </CardContent>
          </Card>

          {/* User Roles Dashboard */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl font-bold">
                User Role Assignments
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center items-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                  <span className="ml-2">Loading user roles...</span>
                </div>
              ) : userRolesData.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Username</TableHead>
                      <TableHead>Role Name</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {userRolesData.map((userRole: UserRole) => (
                      <TableRow key={userRole.id}>
                        <TableCell className="font-medium">
                          {userRole.userName}
                        </TableCell>
                        <TableCell>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {userRole.roleName}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(userRole)}
                              className="h-8 w-8 p-0"
                              disabled={isEditing && editingId !== userRole.id}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(userRole)}
                              className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                              disabled={isEditing}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No role assignments found. Assign roles using the form above.
                </div>
              )}
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    </div>
  );
}