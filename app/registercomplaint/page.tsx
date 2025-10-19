"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useComplaints } from "@/lib/complaint-context"
import { useMasterData } from "@/lib/master-data-context"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import Header from "@/components/header"
import Sidebar from "@/components/sidebar"
import Footer from "@/components/footer"

export default function RegisterComplaintPage() {
  debugger;
  const router = useRouter()
  const { addComplaint } = useComplaints()
  const { customers } = useMasterData()
  const [user, setUser] = useState<{ name: string; email: string } | null>(null)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [ripplePosition, setRipplePosition] = useState<{ x: number; y: number } | null>(null)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("")


  const customersList = customers?.data?.map((x) => x.data) ?? [];
  console.log("customersList:", customersList);
  const [formData, setFormData] = useState({
    customerName: "",
    mobileNumber: "",
    email: "",
    address: "",
    natureOfComplaint: "",
    complaintDetails: "",
  })

  useEffect(() => {
    const storedUser = localStorage.getItem("cft_user")
    if (!storedUser) {
      router.push("/login")
    } else {
      setUser(JSON.parse(storedUser))
    }
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSelectCustomer = (id: string) => {
    setSelectedCustomerId(id);
    const c = customersList.find((x) => x.id === Number(id));
    if (c) {
      setFormData((prev) => ({
        ...prev,
        customerName: c.name,
        mobileNumber: c.mobile,
        email: c.email,
        address: c.address,
      }));
    }
  };


  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Validate form
    if (
      !formData.customerName ||
      !formData.mobileNumber ||
      !formData.email ||
      !formData.address ||
      !formData.natureOfComplaint ||
      !formData.complaintDetails
    ) {
      alert("Please fill in all fields")
      setIsSubmitting(false)
      return
    }

    // Add complaint
    addComplaint(formData)

    // Show success message
    await new Promise((resolve) => setTimeout(resolve, 500))
    alert("Complaint registered successfully!")

    // Redirect to dashboard
    router.push("/dashboard")
  }

  const handleRippleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setRipplePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    })
    setTimeout(() => setRipplePosition(null), 600)
  }

  if (!user) return null

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar isMobileOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />

      <div className="flex-1 flex flex-col lg:ml-[60px] mt-[60px]">
        <Header user={user} onMenuClick={() => setIsMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-auto p-4 md:p-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl md:text-2xl font-bold">Register New Complaint</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Select customer */}
                  <div className="space-y-2">
                    <Label htmlFor="customer">Select Customer</Label>
                    <Select value={selectedCustomerId} onValueChange={handleSelectCustomer}>
                      <SelectTrigger id="customer">
                        <SelectValue placeholder="Choose a customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customersList?.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="customerName">Customer Name</Label>
                      <Input
                        id="customerName"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleChange}
                        placeholder="Enter customer name"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="mobileNumber">Mobile Number</Label>
                      <Input
                        id="mobileNumber"
                        name="mobileNumber"
                        type="tel"
                        value={formData.mobileNumber}
                        onChange={handleChange}
                        placeholder="+1 (555) 123-4567"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="customer@email.com"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="natureOfComplaint">Nature of Complaint</Label>
                      <Select
                        value={formData.natureOfComplaint}
                        onValueChange={(v) => setFormData((p) => ({ ...p, natureOfComplaint: v }))}
                      >
                        <SelectTrigger id="natureOfComplaint">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Plumbing">Plumbing</SelectItem>
                          <SelectItem value="Electrical">Electrical</SelectItem>
                          <SelectItem value="AC Repair">AC Repair</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      placeholder="Enter full address"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="complaintDetails">Complaint Details</Label>
                    <Textarea
                      id="complaintDetails"
                      name="complaintDetails"
                      value={formData.complaintDetails}
                      onChange={handleChange}
                      placeholder="Describe the complaint in detail..."
                      rows={5}
                      required
                      className="resize-none"
                    />
                  </div>

                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      onClick={handleRippleClick}
                      className="w-full relative overflow-hidden bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white font-semibold py-6 text-lg"
                    >
                      {ripplePosition && (
                        <motion.span
                          initial={{ scale: 0, opacity: 0.5 }}
                          animate={{ scale: 4, opacity: 0 }}
                          transition={{ duration: 0.6 }}
                          className="absolute bg-white rounded-full w-20 h-20"
                          style={{
                            left: ripplePosition.x - 40,
                            top: ripplePosition.y - 40,
                          }}
                        />
                      )}
                      <span className="relative z-10">{isSubmitting ? "Submitting..." : "Submit Complaint"}</span>
                    </Button>
                  </motion.div>
                </form>
              </CardContent>
            </Card>
          </motion.div>
        </main>
        <Footer />
      </div>
    </div>
  )
}
