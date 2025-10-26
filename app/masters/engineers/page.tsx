"use client";

import type React from "react";

import { useEffect, useState } from "react";
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
import { Alert } from "@/components/ui/alert";
import { createEngineer, fetchEngineers } from "@/repositories/masters-repo";

export const dynamic = "force-dynamic";

export default function EngineerMasterPage() {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [form, setForm] = useState({
    id: 0,
    name: "",
    mobilenumber: "",
    address: "",
    email: "",
    isactive: true,
  });
  const [engineersData, setengineersData] = useState<[]>([]);
  const [action, setAction] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuthPermissions();

  const fetchEngineersData = async () => {
    try {
      const engineersData = await fetchEngineers();
      console.log(`engineer`, engineersData);

      if (engineersData?.data?.length > 0) {
        const formattedData = engineersData?.data?.map((x) => x.data) ?? [];
        console.log("Formatted Engineers Data:", formattedData);
        setengineersData(formattedData);
      } else {
        setengineersData([]);
      }
    } catch (error) {
      alert("Error While fetching Engineers");
      setengineersData([]);
    }
  };

  const AddEditDeleteEngineers = async (data: any, actionNew: string) => {
    try {
      setLoading(true);
      const payload = {
        ...data,
        IsActive: actionNew == "delete" ? false : true,
        id: actionNew == "edit" || actionNew == "delete" ? data.id : 0,
      };
      
      console.log("Sending payload:", payload);
      
      const engineersData = await createEngineer(payload);
      console.log(`AddedEngineersData`, engineersData);
      
      if (engineersData?.success == true) {
        alert(actionNew === "edit" ? "Engineer Updated Successfully" : 
              actionNew === "delete" ? "Engineer Deleted Successfully" : 
              "Engineer Added Successfully");
        await fetchEngineersData();
        resetForm();
      }
    } catch (error) {
      alert("Error saving engineer");
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEngineersData();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.mobilenumber || !form.email) return;
    AddEditDeleteEngineers(form, action || "add");
  };

  const resetForm = () => {
    setForm({
      id: 0,
      name: "",
      mobilenumber: "",
      address: "",
      email: "",
      isactive: true,
    });
    setAction("");
  };

  const handleEdit = (engineer: any) => {
    setForm({
      id: engineer.id || 0,
      name: engineer.name || "",
      mobilenumber: engineer.mobileNumber || engineer.mobilenumber || "",
      address: engineer.address || "",
      email: engineer.email || "",
      isactive:  true,
    });
    setAction("edit");
  };

  const handleDelete = (engineer: any) => {
    if (window.confirm(`Are you sure you want to delete engineer "${engineer.name}"?`)) {
      AddEditDeleteEngineers(engineer, "delete");
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
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="text-xl md:text-2xl font-bold">
                Engineer Master
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-4 gap-4"
              >
                <div className="space-y-1">
                  <Label>Engineer Name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, name: e.target.value }))
                    }
                    disabled={loading}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Contact Number</Label>
                  <Input
                    value={form.mobilenumber}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, mobilenumber: e.target.value }))
                    }
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
                    disabled={loading}
                  />
                </div>
                <div className="md:col-span-2 flex items-end gap-2">
                  <Button
                    type="submit"
                    className={`w-full ${
                      action === "edit" 
                        ? "bg-gradient-to-r from-green-500 to-emerald-400" 
                        : "bg-gradient-to-r from-blue-500 to-cyan-400"
                    }`}
                    disabled={loading}
                  >
                    {loading ? "Processing..." : action === "edit" ? "Update Engineer" : "Add Engineer"}
                  </Button>
                  {action === "edit" && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={resetForm}
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
                      <TableHead>Contact</TableHead>
                      <TableHead>Email</TableHead>
                      {/* <TableHead>Address</TableHead> */}
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {engineersData?.map((e: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{e.name}</TableCell>
                        <TableCell>{e.mobileNumber || e.mobilenumber}</TableCell>
                        <TableCell>{e.email}</TableCell>
                        {/* <TableCell className="max-w-sm truncate">
                          {e.address}
                        </TableCell> */}
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              className="bg-transparent"
                              onClick={() => handleEdit(e)}
                              disabled={loading}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleDelete(e)}
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