"use client"

import { useState } from "react"
import Sidebar from "./sidebar"
import Header from "./header"
import Footer from "./footer"
import ComplaintTable from "./complaint-table"
import ComplaintModal from "./complaint-modal"
import { useComplaints } from "@/lib/complaint-context"
import type { Complaint } from "@/lib/types"

interface ComplaintDashboardProps {
  user: { name: string; email: string } | null
}

export default function ComplaintDashboard({ user }: ComplaintDashboardProps) {
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null)
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"view" | "edit">("view")
  const { complaints, updateComplaint, deleteComplaints } = useComplaints()

  console.log("Complaints data:", complaints);
  
  const flattenedComplaints = complaints?.data?.map((item: any) => item.data) || []
  console.log("Flattened Complaints:", flattenedComplaints);

  const handleRowClick = (complaint: Complaint) => {
    setSelectedComplaint(complaint)
    setModalMode("view")
  }

  const handleEdit = (complaint: Complaint) => {
    setSelectedComplaint(complaint)
    setModalMode("edit")
  }

  const handleDelete = (complaintId: string) => {
    deleteComplaints(complaintId)
    alert('Complaint deleted successfully!')
  }

  const handleCloseModal = () => {
    setSelectedComplaint(null)
    setModalMode("view")
  }

  const handleAssignEngineer = (complaintId: string, engineer: string) => {
    updateComplaint(complaintId, { status: "Assigned", assignedEngineer: engineer })
    alert(`Successfully assigned ${engineer} to this complaint`)
    handleCloseModal()
  }

  const handleUpdateComplaint = (complaintId: string, updatedData: Partial<Complaint>) => {
    updateComplaint(complaintId, updatedData)
    alert('Complaint updated successfully!')
    // Don't close the modal, just switch back to view mode
    setModalMode("view")
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar isMobileOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />

      <div className="flex-1 flex flex-col lg:ml-[60px] mt-[60px]">
        <Header user={user} onMenuClick={() => setIsMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-auto">
          <ComplaintTable 
            complaints={flattenedComplaints} 
            onRowClick={handleRowClick}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </main>
        <Footer />
      </div>

      {selectedComplaint && (
        <ComplaintModal 
          complaint={selectedComplaint} 
          onClose={handleCloseModal} 
          onAssign={handleAssignEngineer}
          onUpdate={handleUpdateComplaint}
          mode={modalMode}
        />
      )}
    </div>
  )
}