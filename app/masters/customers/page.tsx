"use client";

import type React from "react";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
import { createCustomer, fetchCustomers } from "@/repositories/masters-repo";
import { Alert } from "@/components/ui/alert";
import { toast } from "@/hooks/use-toast";

export const dynamic = "force-dynamic";

export default function CustomerMasterPage() {
  // const router = useRouter();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState({
    name: "",
    mobile: "",
    address: "",
    email: "",
  });
  const [customersData, setCustomersData] = useState<[]>([]);
  const [action, setAction] = useState<string>("");
  const [actionData, setActionData] = useState<any>({});
  const { user } = useAuthPermissions();

  const filtered = useMemo(
    () =>
      customersData?.data?.filter((c) =>
        [c.name, c.email].join(" ").toLowerCase().includes(search.toLowerCase())
      ),
    [customersData, search]
  );

  const fetchCustomersData = async () => {
    try {
      const customersData = await fetchCustomers();
      console.log(`custcust`, customersData);

      if (customersData?.data?.length > 0) {
        const formattedData = customersData?.data?.map((x) => x.data) ?? [];
        setCustomersData(formattedData);
      } else {
        setCustomersData([]);
      }
    } catch (error) {
      Alert("error While fetching Customers");
      setCustomersData([]);
    }
  };

  const AddEditDeleteCustomers = async (data: any, actionNew: string) => {
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
      const customersData = await createCustomer(payload);
      console.log(`AddedCustomersData`, customersData);
      if (customersData?.success == true) {
        Alert("Customer Added Sucessfully");
        await fetchCustomersData();
      }
      setAction("");
    } catch (error) {
      Alert("Customer not inserted");
    }
  };

  useEffect(() => {
    fetchCustomersData();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.mobile || !form.address || !form.email) return;
    AddEditDeleteCustomers(form, action);
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
            <CardHeader className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <CardTitle className="text-xl md:text-2xl font-bold">
                Customer Master
              </CardTitle>
              <div className="w-full md:w-72">
                <Input
                  placeholder="Search customers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-4 gap-4"
              >
                <div className="space-y-1">
                  <Label>Name</Label>
                  <Input
                    value={form.name}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, name: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>Mobile Number</Label>
                  <Input
                    value={form.mobile}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, mobile: e.target.value }))
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
                <div className="md:col-span-2 flex items-end flex-wrap justify-around">
                  <Button
                    type="submit"
                    className="w-[45%] bg-gradient-to-r from-blue-500 to-cyan-400"
                  >
                    {action == "edit" ? "Edit Customer" : "Add Customer"}
                  </Button>
                  {action == "edit" && (
                    <Button
                      type="submit"
                      className="w-[45%] bg-red-500"
                      onClick={() => {
                        setForm({
                          name: "",
                          address: "",
                          email: "",
                          mobile: "",
                        });
                        setAction("");
                        setTimeout(() => {
                          setActionData({});
                        }, 100);
                      }}
                    >
                      {"Cancel"}
                    </Button>
                  )}
                </div>
              </form>

              <div className="hidden md:block rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Name</TableHead>
                      <TableHead>Mobile</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Address</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customersData?.map((c: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{c.name}</TableCell>
                        <TableCell>{c.mobile}</TableCell>
                        <TableCell>{c.email}</TableCell>
                        <TableCell className="max-w-sm truncate">
                          {c.address}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="outline"
                            className="mr-2 bg-transparent"
                            onClick={() => {
                              setActionData(c);
                              setForm({
                                name: c?.name || "",
                                address: c?.address || "",
                                email: c?.email || "",
                                mobile: c?.mobile || "",
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
                            onClick={() => {
                              setAction("delete");
                              AddEditDeleteCustomers(c, "delete");
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

              <div className="md:hidden space-y-3">
                {filtered?.data?.map((c) => (
                  <div key={c.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="font-semibold">{c.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {c.mobile}
                      </div>
                    </div>
                    <div className="mt-2 text-sm">{c.email}</div>
                    <div className="text-sm text-muted-foreground">
                      {c.address}
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setActionData(c);
                          setForm({
                            name: c?.name || "",
                            address: c?.address || "",
                            email: c?.email || "",
                            mobile: c?.mobile || "",
                          });
                          setTimeout(() => {
                            setAction("edit");
                          }, 100);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => {
                          setAction("delete");
                          AddEditDeleteCustomers(c, "delete");
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    </div>
  );
}
