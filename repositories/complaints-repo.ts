"use client"

import { apiGet, apiPost } from "@/lib/api/http"
import { COMPLAINTS_URL, CREATE_COMPLAINT_URL, ASSIGN_ENGINEER_URL } from "@/lib/api/endpoints"

export type Complaint = {
  id: string
  customerName: string
  mobileNumber: string
  email?: string
  address?: string
  natureOfComplaint: string
  complaintDetails: string
  engineerId?: string | null
  status?: string
  createdAt?: string
}

export async function fetchComplaints() {
  return apiGet<Complaint[]>(COMPLAINTS_URL)
}

export async function createComplaint(payload: Omit<Complaint, "id" | "status">) {
  return apiPost<Complaint>(CREATE_COMPLAINT_URL, payload)
}

export async function assignEngineer(complaintId: string, engineerId: string) {
  return apiPost<Complaint>(ASSIGN_ENGINEER_URL, { complaintId, engineerId })
}
