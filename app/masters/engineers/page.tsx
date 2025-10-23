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
    name: "",
    contact: "",
    address: "",
    email: "",
  });
  const [engineersData, setengineersData] = useState<[]>([]);
  const [action, setAction] = useState<string>("");
  const [actionData, setActionData] = useState<any>({});
  const { user } = useAuthPermissions();

  const fetchEngineersData = async () => {
    try {
      const engineersData = await fetchEngineers();
      console.log(`engineer`, engineersData);

      if (engineersData?.data?.length > 0) {
        const formattedData = engineersData?.data?.map((x) => x.data) ?? [];
        setengineersData(formattedData);
      } else {
        setengineersData([]);
      }
    } catch (error) {
      Alert("error While fetching Engineers");
      setengineersData([]);
    }
  };

  const AddEditDeleteEngineers = async (data: any, actionNew: string) => {
    try {
      const payload = {
        ...data,
        IsActive: actionNew == "delete" ? false : true,
        id:
          actionNew == "edit"
            ? actionData?.id
            : actionNew == "delete"
            ? data?.id
            : 0,
      };
      const engineersData = await createEngineer(payload);
      console.log(`AddedEngineersData`, engineersData);
      if (engineersData?.success == true) {
        Alert("Engineer Added Sucessfully");
        await fetchEngineersData();
      }
      setAction("");
    } catch (error) {
      Alert("Engineer not inserted");
    }
  };

  useEffect(() => {
    fetchEngineersData();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.mobile || !form.address || !form.email) return;
    AddEditDeleteEngineers(form, action);
    setForm({ name: "", mobile: "", address: "", email: "" });
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
                  />
                </div>
                <div className="space-y-1">
                  <Label>Contact Number</Label>
                  <Input
                    value={form.contact}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, contact: e.target.value }))
                    }
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
                  />
                </div>
                <div className="space-y-1 md:col-span-2 md:col-start-1">
                  <Label>Address</Label>
                  <Input
                    value={form.address}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, address: e.target.value }))
                    }
                  />
                </div>
                <div className="md:col-span-2 flex items-end">
                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-400"
                  >
                    Add Engineer
                  </Button>
                </div>
              </form>

              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {engineersData?.map((e: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{e.name}</TableCell>
                        <TableCell>{e.contact}</TableCell>
                        <TableCell>{e.email}</TableCell>
                        <TableCell className="max-w-sm truncate">
                          {e.address}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            className="mr-2 bg-transparent"
                            onClick={() => {
                              setActionData(e);
                              setForm({
                                name: e?.name || "",
                                address: e?.address || "",
                                email: e?.email || "",
                                mobile: e?.mobile || "",
                              });
                              setTimeout(() => {
                                setAction("edit");
                              }, 100);
                            }}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            // onClick={() => deleteEngineer(e.id)}
                            onClick={() => {
                              setAction("delete");
                              AddEditDeleteEngineers(e, "delete");
                            }}
                          >
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
  );
}
