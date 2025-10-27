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
  const router = useRouter()
  const { addComplaint } = useComplaints()
  const { customers } = useMasterData()
  const [user, setUser] = useState<{ id: number; name: string; email: string } | null>(null)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [ripplePosition, setRipplePosition] = useState<{ x: number; y: number } | null>(null)
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>("")

  const customersList = customers?.data?.map((x) => x.data) ?? []
  console.log("customersList:", customersList)

  // Fixed form state - CustomerId should be number
  const [formData, setFormData] = useState({
    customerName: "",
    mobileNumber: "",
    email: "",
    address: "",
    NatureOfComplaint: "",
    Complaintdetails: "",
    CustomerId: 0 // This should be number, not string
  })

  useEffect(() => {
    const storedUser = localStorage.getItem("cft_user")
    if (!storedUser) {
      router.push("/login")
    } else {
      const userData = JSON.parse(storedUser)
      setUser(userData)
    }
  }, [router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  const handleSelectCustomer = (id: string) => {
    setSelectedCustomerId(id)
    const customer = customersList.find((x) => x.id === Number(id))
    if (customer) {
      setFormData((prev) => ({
        ...prev,
        customerName: customer.name,
        mobileNumber: customer.mobile,
        email: customer.email,
        address: customer.address,
        CustomerId: Number(id) // Convert to number
      }))
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Fixed validation - check all required fields including CustomerId
    const requiredFields = [
      "customerName",
      "mobileNumber", 
      "email",
      "address",
      "NatureOfComplaint",
      "Complaintdetails",
      "CustomerId"
    ]

    const missingFields = requiredFields.filter(field => {
      const value = formData[field as keyof typeof formData]
      return value === "" || value === 0 || value === null || value === undefined
    })
    
    if (missingFields.length > 0) {
      alert(`Please fill in all required fields. Missing: ${missingFields.join(", ")}`)
      setIsSubmitting(false)
      return
    }

    try {
      // Get current user from localStorage to ensure we have the latest data
      const storedUser = localStorage.getItem("cft_user")
      const currentUser = storedUser ? JSON.parse(storedUser) : null
      console.log("Current user from localStorage:", currentUser);
      if (!currentUser || !currentUser.id) {
        alert("User not found. Please login again.")
        router.push("/login")
        return
      }

      // Prepare complaint data with CreatedBy
      const complaintData = {
        ...formData,
        id: 0, // Generate unique ID
        statusId: 1,
        createdAt: new Date().toISOString(),
        CreatedBy: parseInt(currentUser.id),
        // Add any other required fields for your complaint context
      }

      console.log("Submitting complaint:", complaintData)

      // Add complaint
      await addComplaint(complaintData)

      // Show success message
      alert("Complaint registered successfully!")

      // Reset form
      setFormData({
        customerName: "",
        mobileNumber: "",
        email: "",
        address: "",
        NatureOfComplaint: "",
        Complaintdetails: "",
        CustomerId: 0 // Reset to 0, not empty string
      })
      setSelectedCustomerId("")

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Error submitting complaint:", error)
      alert("Failed to register complaint. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
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
                    <Label htmlFor="customer">Select Customer *</Label>
                    <Select value={selectedCustomerId} onValueChange={handleSelectCustomer}>
                      <SelectTrigger id="customer">
                        <SelectValue placeholder="Choose a customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customersList?.map((customer) => (
                          <SelectItem key={customer.id} value={String(customer.id)}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="customerName">Customer Name *</Label>
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
                      <Label htmlFor="mobileNumber">Mobile Number *</Label>
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
                      <Label htmlFor="email">Email *</Label>
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
                      <Label htmlFor="natureOfComplaint">Nature of Complaint *</Label>
                      <Select
                        value={formData.NatureOfComplaint}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, NatureOfComplaint: value }))}
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
                    <Label htmlFor="address">Address *</Label>
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
                    <Label htmlFor="complaintDetails">Complaint Details *</Label>
                    <Textarea
                      id="complaintDetails"
                      name="Complaintdetails"
                      value={formData.Complaintdetails}
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
                      <span className="relative z-10">
                        {isSubmitting ? "Submitting..." : "Submit Complaint"}
                      </span>
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