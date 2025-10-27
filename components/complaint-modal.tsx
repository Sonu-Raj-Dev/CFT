"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import type { Complaint } from "@/lib/types"
import { useMasterData } from "@/lib/master-data-context"
import { assignEngineer } from "@/repositories/complaints-repo"

interface ComplaintModalProps {
  complaint: Complaint
  onClose: () => void
  onAssign: (complaintId: string, engineer: string) => void
  onUpdate?: (complaintId: string, updatedData: Partial<Complaint>) => void
  mode?: "view" | "edit"
}

export default function ComplaintModal({
  complaint,
  onClose,
  onAssign,
  onUpdate,
  mode = "view"
}: ComplaintModalProps) {
  const [selectedEngineer, setSelectedEngineer] = useState<number | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isEditing, setIsEditing] = useState(mode === "edit")
  const [formData, setFormData] = useState<Complaint>(complaint)
  const [isLoading, setIsLoading] = useState(false)
  const { engineers } = useMasterData()

  console.log("Complaint Modal - complaint prop:", complaint);
  
  // Create a mapping between status names and their IDs
  const statusMapping = {
    "Draft": "1",
    "Resolution Pending": "2", 
    "Completed": "3"
  };

  // Reverse mapping for display
  const reverseStatusMapping = {
    "1": "Draft",
    "2": "Resolution Pending",
    "3": "Completed"
  };

  useEffect(() => {
    setFormData(complaint)
    setIsEditing(mode === "edit")

    if (complaint.engineerId) {
      setSelectedEngineer(complaint.engineerId)
    } else {
      setSelectedEngineer("")
    }
  }, [complaint, mode])

  console.log("Engineers List:", engineers);
  const engineersList = engineers?.data?.map((x) => x.data) ?? [];
  console.log("Engineers List after mapping:", engineersList);

  const handleInputChange = (field: keyof Complaint, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Handle status change - convert ID to status name
  const handleStatusChange = (statusId: string) => {
    const statusName = reverseStatusMapping[statusId as keyof typeof reverseStatusMapping] || "Draft";
    setFormData(prev => ({
      ...prev,
      statusName: statusName
    }))
  }

  // Get current status ID for the dropdown value
  const getCurrentStatusId = () => {
    return statusMapping[formData.statusName as keyof typeof statusMapping] || "1";
  }

  const handleSubmit = async () => {
    if (isEditing) {
      if (onUpdate) {
        onUpdate(complaint.id, formData)
        setShowSuccess(true)
        setTimeout(() => {
          onClose()
        }, 1000)
      }
    } else {
      if (!selectedEngineer) {
        alert("Please select an engineer before submitting")
        return
      }

      setIsLoading(true)
      try {
        const payload = {
          id: complaint.id,
          engineerId: selectedEngineer
        }
console.log("Assigning engineer with payload:", payload);
        const response = await assignEngineer(payload)
        setShowSuccess(true)

        setTimeout(() => {
          onAssign(complaint.id, selectedEngineer)
          setIsLoading(false)
        }, 1000)

      } catch (error) {
        console.error("Error assigning engineer:", error)
        alert("Failed to assign engineer. Please try again.")
        setIsLoading(false)
      }
    }
  }

  const handleSave = () => {
    if (onUpdate) {
      onUpdate(complaint.id, formData)
      setShowSuccess(true)
      setTimeout(() => {
        setIsEditing(false)
        setShowSuccess(false)
      }, 1000)
    }
  }

  const handleCancel = () => {
    if (isEditing) {
      setFormData(complaint)
      setIsEditing(false)
      if (complaint.assignedEngineer) {
        setSelectedEngineer(complaint.assignedEngineer)
      }
    } else {
      onClose()
    }
  }

  const getSuccessMessage = () => {
    if (isEditing) {
      return "Complaint updated successfully!"
    }
    return "Engineer assigned successfully!"
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] md:max-h-[85vh] overflow-y-auto w-[95vw] md:w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.3, type: "spring", stiffness: 300, damping: 30 }}
        >
          <DialogHeader>
            <div className="flex justify-between items-center">
              <DialogTitle className="text-xl md:text-2xl font-bold">
                {isEditing ? "Edit Complaint" : "Complaint Details"}
              </DialogTitle>
              {/* {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                  className="bg-blue-500 text-white hover:bg-blue-600"
                >
                  Edit
                </Button>
              )} */}
            </div>
          </DialogHeader>

          <div className="space-y-4 md:space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name *</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) => handleInputChange('customerName', e.target.value)}
                  disabled={!isEditing}
                  className={isEditing ? "bg-white" : "bg-muted"}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobileNumber">Mobile Number *</Label>
                <Input
                  id="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={(e) => handleInputChange('mobileNumber', e.target.value)}
                  disabled={!isEditing}
                  className={isEditing ? "bg-white" : "bg-muted"}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                disabled={!isEditing}
                className={isEditing ? "bg-white" : "bg-muted"}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                disabled={!isEditing}
                className={isEditing ? "bg-white" : "bg-muted"}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="natureOfComplaint">Nature of Complaint *</Label>
                {isEditing ? (
                  <Select
                    value={formData.natureOfComplaint}
                    onValueChange={(value) => handleInputChange('natureOfComplaint', value)}
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
                ) : (
                  <Input
                    id="natureOfComplaint"
                    value={formData.natureOfComplaint}
                    disabled
                    className="bg-muted"
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={getCurrentStatusId()}
                  onValueChange={handleStatusChange}
                  disabled={!isEditing}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status">
                      {formData.statusName || "Draft"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Draft</SelectItem>
                    <SelectItem value="2">Resolution Pending</SelectItem>
                    <SelectItem value="3">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="complaintDetails">Complaint Details *</Label>
              <Textarea
                id="complaintDetails"
                value={formData.complaintdetails}
                onChange={(e) => handleInputChange('complaintdetails', e.target.value)}
                disabled={!isEditing}
                className={isEditing ? "bg-white min-h-[100px] resize-vertical" : "bg-muted min-h-[100px] resize-none"}
              />
            </div>

            {!isEditing && (
              <div className="space-y-2">
                <Label htmlFor="engineer">Assign Engineer</Label>
                <Select value={selectedEngineer} onValueChange={setSelectedEngineer}>
                  <SelectTrigger id="engineer">
                    <SelectValue placeholder={
                      selectedEngineer
                        ? engineersList.find(e => e.id === selectedEngineer)?.name || "Select an engineer"
                        : "Select an engineer"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    {engineersList.map((e) => (
                      <SelectItem key={e.id} value={e.id}>
                        {e.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedEngineer && (
                  <p className="text-sm text-muted-foreground mt-1">
                    Currently assigned to: {engineersList.find(e => e.id === selectedEngineer)?.name}
                  </p>
                )}
              </div>
            )}

            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg"
                >
                  {getSuccessMessage()}
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="w-full sm:w-auto bg-transparent"
                >
                  {isEditing ? "Cancel" : "Close"}
                </Button>
              </motion.div>

              {isEditing ? (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                  <Button
                    onClick={handleSave}
                    className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-emerald-400 hover:from-green-600 hover:to-emerald-500"
                  >
                    Save Changes
                  </Button>
                </motion.div>
              ) : (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                  <Button
                    onClick={handleSubmit}
                    disabled={isLoading || !selectedEngineer}
                    className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500"
                  >
                    {isLoading ? "Assigning..." : (selectedEngineer && complaint.assignedEngineer ? "Reassign Engineer" : "Assign Engineer")}
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}