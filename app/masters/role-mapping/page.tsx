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
import { useMasterData, type Role } from "@/lib/master-data-context";
import { fetchRoles, fetchUsers } from "@/repositories/masters-repo";
import { Alert } from "@/components/ui/alert";

export default function UserRoleMappingPage() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { users, userRoles, setUserRoles } = useMasterData();
  const [user, setUser] = useState<any>(null); // load it safely
  const [usersData, setUserData] = useState<[]>([]);
  const [rolesData, setRolesData] = useState<any>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [role, setRole] = useState<Role>("Admin");

  useEffect(() => {
    // This runs only on the client
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
        const formattedData = usersData?.data?.map((x) => x.data) ?? [];
        setUserData(formattedData);
      } else {
        setUserData([]);
      }
    } catch (error) {
      Alert("error While fetching Customers");
      setUserData([]);
    }
  };

  const fetchRolesData = async () => {
    try {
      const rolesData = await fetchRoles();
      console.log(`rolesData`, rolesData);

      if (rolesData?.data?.length > 0) {
        const formattedData = rolesData?.data?.map((x) => x.data) ?? [];
        setRolesData(formattedData);
      } else {
        setRolesData([]);
      }
    } catch (error) {
      Alert("error While fetching Customers");
      setRolesData([]);
    }
  };

  useEffect(() => {
    fetchUsersData();
    fetchRolesData();
  }, []);

  const assignRole = () => {
    if (!selectedUserId) return;
    const existing = rolesData[selectedUserId] || [];
    const newRoles = Array.from(new Set([...existing, role]));
    // setRolesData(selectedUserId, newRoles);
    alert("Role assigned");
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
          <Card className="shadow-lg max-w-2xl">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl font-bold">
                User Role Mapping
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
                    {usersData?.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u?.name} - {u?.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Select Role</Label>
                <Select value={role} onValueChange={(v) => setRole(v as Role)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose role" />
                  </SelectTrigger>
                  <SelectContent>
                    {rolesData?.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u?.name} - {u?.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                onClick={assignRole}
                className="bg-gradient-to-r from-blue-500 to-cyan-400"
              >
                Assign Role
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    </div>
  );
}
