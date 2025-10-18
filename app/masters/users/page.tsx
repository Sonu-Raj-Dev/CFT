"use client"

import type React from "react"

import { useState } from "react"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import Footer from "@/components/footer"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { useMasterData } from "@/lib/master-data-context"
import { useAuthPermissions } from "@/lib/auth-permissions-context"

export const dynamic = "force-dynamic"

export default function UserMasterPage() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const { users, addUser, updateUser, deleteUser } = useMasterData()
  const { user } = useAuthPermissions()
  const [form, setForm] = useState({ name: "", email: "", mobile: "", password: "", address: "" })

  const usersList = users?.data?.map((x) => x.data) ?? [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.mobile || !form.password || !form.address) return
    addUser(form)
    setForm({ name: "", email: "", mobile: "", password: "", address: "" })
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar isMobileOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />
      <div className="flex-1 flex flex-col lg:ml-[60px] mt-[60px]">
        <Header user={user} onMenuClick={() => setIsMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl font-bold">User Master</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-5 gap-4">
                <div className="space-y-1">
                  <Label>User Name</Label>
                  <Input value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Mobile Number</Label>
                  <Input value={form.mobile} onChange={(e) => setForm((p) => ({ ...p, mobile: e.target.value }))} />
                </div>
                <div className="space-y-1">
                  <Label>Password</Label>
                  <Input
                    type="password"
                    value={form.password}
                    onChange={(e) => setForm((p) => ({ ...p, password: e.target.value }))}
                  />
                </div>
                <div className="space-y-1 md:col-span-2 md:col-start-1">
                  <Label>Address</Label>
                  <Input value={form.address} onChange={(e) => setForm((p) => ({ ...p, address: e.target.value }))} />
                </div>
                <div className="md:col-span-3 flex items-end">
                  <Button type="submit" className="w-full bg-gradient-to-r from-blue-500 to-cyan-400">
                    Add User
                  </Button>
                </div>
              </form>

              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Mobile</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usersList.map((u) => (
                      <TableRow key={u.id}>
                        <TableCell className="font-medium">{u.name}</TableCell>
                        <TableCell>{u.email}</TableCell>
                        <TableCell>{u.mobile}</TableCell>
                        <TableCell className="max-w-sm truncate">{u.address}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            className="mr-2 bg-transparent"
                            onClick={() => updateUser(u.id, { name: u.name })}
                          >
                            Edit
                          </Button>
                          <Button variant="destructive" onClick={() => deleteUser(u.id)}>
                            Delete
                          </Button>
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
  )
}
