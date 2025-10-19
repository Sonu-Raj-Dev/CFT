"use client"

import { useEffect, useState } from "react"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import Footer from "@/components/footer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Button } from "@/components/ui/button"
import { useMasterData, type Role, type RouteKey } from "@/lib/master-data-context"

const routeOptions: { key: RouteKey; label: string }[] = [
  { key: "dashboard", label: "Dashboard" },
  { key: "complaints", label: "View Complaints" },
  { key: "registercomplaint", label: "Register Complaint" },
  { key: "customers", label: "Customer Master" },
  { key: "engineers", label: "Engineer Master" },
  { key: "users", label: "User Master" },
  { key: "role-mapping", label: "User Role Mapping" },
  { key: "permission-mapping", label: "Role Permission Mapping" },
  { key: "profile", label: "Profile" },
]

export default function PermissionMappingPage() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const { rolePermissions, setRolePermissions } = useMasterData()
  //const user = JSON.parse(localStorage.getItem("cft_user") || "null")
  const [role, setRole] = useState<Role>("Admin")
  const [selected, setSelected] = useState<RouteKey[]>([])
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
     const user = localStorage.getItem("cft_user");
     if (user) setUser(JSON.parse(user));
  }, []);

  useEffect(() => {
    setSelected(rolePermissions[role] || [])
  }, [role, rolePermissions])

  const toggle = (key: RouteKey) =>
    setSelected((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))

  const save = () => {
    setRolePermissions(role, selected)
    alert("Permissions updated")
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar isMobileOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />
      <div className="flex-1 flex flex-col lg:ml-[60px] mt-[60px]">
        <Header user={user} onMenuClick={() => setIsMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl font-bold">Role Permission Mapping</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-4">
                <Button variant={role === "Admin" ? "default" : "outline"} onClick={() => setRole("Admin")}>
                  Admin
                </Button>
                <Button
                  variant={role === "ComplaintManager" ? "default" : "outline"}
                  onClick={() => setRole("ComplaintManager")}
                >
                  Complaint Manager
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {routeOptions.map((r) => (
                  <label key={r.key} className="flex items-center gap-3 border rounded-md p-3">
                    <Checkbox checked={selected.includes(r.key)} onCheckedChange={() => toggle(r.key)} />
                    <span>{r.label}</span>
                  </label>
                ))}
              </div>

              <Button onClick={save} className="bg-gradient-to-r from-blue-500 to-cyan-400">
                Save Permissions
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    </div>
  )
}
