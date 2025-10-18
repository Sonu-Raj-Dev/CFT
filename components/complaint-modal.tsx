"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import type { Complaint } from "@/lib/types"
import { useMasterData } from "@/lib/master-data-context"

interface ComplaintModalProps {
  complaint: Complaint
  onClose: () => void
  onAssign: (complaintId: string, engineer: string) => void
}

export default function ComplaintModal({ complaint, onClose, onAssign }: ComplaintModalProps) {
  const [selectedEngineer, setSelectedEngineer] = useState<string>("")
  const [showSuccess, setShowSuccess] = useState(false)
  const { engineers } = useMasterData()

  console.log("Engineers List:", engineers);
  const engineersList = engineers?.data?.map((x) => x.data) ?? [];

  const handleSubmit = () => {
    if (!selectedEngineer) {
      alert("Please select an engineer before submitting")
      return
    }

    setShowSuccess(true)
    setTimeout(() => {
      onAssign(complaint.id, selectedEngineer)
    }, 1000)
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
            <DialogTitle className="text-xl md:text-2xl font-bold">Complaint Details</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 md:space-y-6 py-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Customer Name</Label>
                <Input id="customerName" value={complaint.customerName} disabled className="bg-muted" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mobileNumber">Mobile Number</Label>
                <Input id="mobileNumber" value={complaint.mobileNumber} disabled className="bg-muted" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={complaint.email} disabled className="bg-muted" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input id="address" value={complaint.address} disabled className="bg-muted" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="natureOfComplaint">Nature of Complaint</Label>
              <Input id="natureOfComplaint" value={complaint.natureOfComplaint} disabled className="bg-muted" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="complaintDetails">Complaint Details</Label>
              <Textarea
                id="complaintDetails"
                value={complaint.complaintdetails}
                disabled
                className="bg-muted min-h-[100px] resize-none"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="engineer">Assign Engineer</Label>
              <Select value={selectedEngineer} onValueChange={setSelectedEngineer}>
                <SelectTrigger id="engineer">
                  <SelectValue placeholder="Select an engineer" />
                </SelectTrigger>
                <SelectContent>
                  {engineersList.map((e) => (
                    <SelectItem key={e.engineerId} value={e.engineerId}>
                      {e.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <AnimatePresence>
              {showSuccess && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg"
                >
                  Engineer assigned successfully!
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <Button variant="outline" onClick={onClose} className="w-full sm:w-auto bg-transparent">
                  Cancel
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="w-full sm:w-auto">
                <Button
                  onClick={handleSubmit}
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500"
                >
                  Submit
                </Button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </DialogContent>
    </Dialog>
  )
}
