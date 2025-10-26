"use client";

import type React from "react";

import { useCallback, useMemo, useState } from "react";
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import Footer from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useMasterData } from "@/lib/master-data-context";
import { useAuthPermissions } from "@/lib/auth-permissions-context";

export const dynamic = "force-dynamic";

export default function UserMasterPage() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { users, addUser } = useMasterData();
  const { user } = useAuthPermissions();
  const [form, setForm] = useState({
    id: 0,
    name: "",
    email: "",
    // mobile: "",
    password: ""
    // address: "",
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const usersList = useMemo(() => {
    return users?.data?.map((x) => x.data) ?? [];
  }, [users]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !form.name ||
      !form.email ||
      !form.password
    ) {
      return;
    }

    setLoading(true);
    try {
      if (isEditing) {
        // Update existing user
        const payload1 = { ...form, isactive: true };
        await addUser(payload1);
      } else {
        // Add new user
        const payload = { ...form, isactive: true };
        await addUser(payload);
      }
     
      // Reset form
      resetForm();
      alert(isEditing ? "User updated successfully!" : "User added successfully!");
      
      // Reload the page after successful operation
      window.location.reload();
      
    } catch (error) {
      console.error("Error saving user:", error);
      alert("Error saving user");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (userData: any) => {
    setForm({
      id: userData.id || 0,
      name: userData.name || "",
      email: userData.email || "",
      // mobile: userData.mobile || "",
      password: userData.password || ""
      //address: userData.address || "",
    });
    setIsEditing(true);
  };

  const deleteUser = async (userData: any) => {
    // Show confirmation alert
    if (window.confirm(`Are you sure you want to delete user "${userData.name}"?`)) {
      setLoading(true);
      try {
        const payload2 = { ...userData, isactive: false };
        await addUser(payload2);

        alert(`User "${userData.name}" has been deleted successfully!`);
        
        // Reload the page after successful deletion
        window.location.reload();
        
      } catch (error) {
        console.error("Error deleting user:", error);
        alert("Error deleting user");
      } finally {
        setLoading(false);
      }
    }
  };

  const resetForm = () => {
    setForm({
      id: 0,
      name: "",
      email: "",
      // mobile: "",
      password: "",
      // address: "",
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    resetForm();
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />
      <div className="flex-1 flex flex-col lg:ml-[60px] mt-[60px]">
        <Header user={user} onMenuClick={() => setIsMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl font-bold">
                User Master
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-5 gap-4"
              >
                <div className="space-y-1">
                  <Label>User Name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, name: e.target.value }))
                    }
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, email: e.target.value }))
                    }
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, password: e.target.value }))
                    }
                    required
                    disabled={loading}
                  />
                </div>
                <div className="flex items-end gap-2">
                  <Button
                    type="submit"
                    className={`w-full ${isEditing
                      ? "bg-gradient-to-r from-green-500 to-emerald-400"
                      : "bg-gradient-to-r from-blue-500 to-cyan-400"
                      }`}
                    disabled={loading}
                  >
                    {loading ? "Processing..." : isEditing ? "Update User" : "Add User"}
                  </Button>
                  {isEditing && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleCancel}
                      className="w-full"
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                  )}
                </div>
              </form>

              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Password</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersList.map((u: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{u.name}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>{u.password}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              className="bg-transparent"
                              onClick={() => handleEdit(u)}
                              disabled={loading}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => deleteUser(u)}
                              disabled={loading}
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    </div>
  );
}