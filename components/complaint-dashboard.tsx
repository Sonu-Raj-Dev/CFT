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
  const { complaints, updateComplaint } = useComplaints()


  console.log("Complaints data:", complaints);
  const handleRowClick = (complaint: Complaint) => {
    setSelectedComplaint(complaint)
  }

  const handleCloseModal = () => {
    setSelectedComplaint(null)
  }

  const handleAssignEngineer = (complaintId: string, engineer: string) => {
    updateComplaint(complaintId, { status: "Assigned", assignedEngineer: engineer })
    alert(`Successfully assigned ${engineer} to this complaint`)
    handleCloseModal()
  }

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar isMobileOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />

      <div className="flex-1 flex flex-col lg:ml-[60px] mt-[60px]">
        <Header user={user} onMenuClick={() => setIsMobileSidebarOpen(true)} />
        <main className="flex-1 overflow-auto">
          <ComplaintTable complaints={complaints?.data} onRowClick={handleRowClick} />
        </main>
        <Footer />
      </div>

      {selectedComplaint && (
        <ComplaintModal complaint={selectedComplaint} onClose={handleCloseModal} onAssign={handleAssignEngineer} />
      )}
    </div>
  )
}
