"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { createComplaint, fetchComplaints, assignEngineer } from "@/repositories/complaints-repo"
import { Complaint } from "@/lib/types"
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
        const data = await fetchComplaints()
        
        console.log('fetchComplaints',data.data);
        if (!cancelled) setComplaints(data.data || [])
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
