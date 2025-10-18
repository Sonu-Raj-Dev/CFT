"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createComplaint, fetchComplaints, assignEngineer } from "@/repositories/complaints-repo"
import type { Complaint } from "@/repositories/complaints-repo"

interface ComplaintContextType {
  complaints: Complaint[]
  addComplaint: (complaint: Omit<Complaint, "id" | "status">) => Promise<void>
  updateComplaint: (id: string, updates: Partial<Complaint>) => Promise<void>
}

const ComplaintContext = createContext<ComplaintContextType | undefined>(undefined)

export function ComplaintProvider({ children }: { children: ReactNode }) {
  const [complaints, setComplaints] = useState<Complaint[]>([])

  // Load complaints from API on mount
  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
    
        var UserId = localStorage.getItem("cft_user");
        console.log("UserId from localStorage:", UserId);

        var RoleId = localStorage.getItem("cft_role");
        console.log("RoleId from localStorage:", RoleId);
        const body = {
          UserId: UserId ? JSON.parse(UserId).id : "",
          RoleId: RoleId ? JSON.parse(RoleId).id : "1",
        }
        const data = await fetchComplaints(body);

        console.log("fetched complaints:", data);
        if (!cancelled) setComplaints(data || [])
      } catch (e) {
        console.error("[v0] fetchComplaints error:", (e as Error).message)
        if (!cancelled) setComplaints([])
      }
    }
    if (typeof window !== "undefined") load()
    return () => {
      cancelled = true
    }
  }, [])

  const addComplaint = async (complaint: Omit<Complaint, "id" | "status">) => {
    const created = await createComplaint(complaint)
    setComplaints((prev) => [created, ...prev])
  }

  const updateComplaint = async (id: string, updates: Partial<Complaint>) => {
    if (updates.engineerId) {
      const updated = await assignEngineer(id, updates.engineerId)
      setComplaints((prev) => prev.map((c) => (c.id === id ? updated : c)))
      return
    }
    // If your API supports partial updates, wire here. For now, client-side merge:
    setComplaints((prev) => prev.map((c) => (c.id === id ? { ...c, ...updates } : c)))
  }

  return (
    <ComplaintContext.Provider value={{ complaints, addComplaint, updateComplaint }}>
      {children}
    </ComplaintContext.Provider>
  )
}

export function useComplaints() {
  const context = useContext(ComplaintContext)
  if (!context) {
    throw new Error("useComplaints must be used within ComplaintProvider")
  }
  return context
}
