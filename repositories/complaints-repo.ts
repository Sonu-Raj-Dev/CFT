"use client"

import { apiGet, apiPost,apiGets } from "@/lib/api/http"
import { COMPLAINTS_URL, CREATE_COMPLAINT_URL, ASSIGN_ENGINEER_URL,DELETE_COMPLAINT_URL } from "@/lib/api/endpoints"

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

interface ComplaintQuery {
  UserId: number
  RoleId:number
}

export async function fetchComplaints(payload: ComplaintQuery): Promise<Complaint[]> {
  return apiGets<Complaint[]>(COMPLAINTS_URL, payload)
}

export async function createComplaint(payload: Omit<Complaint, "id" | "status">) {
  return apiPost<Complaint>(CREATE_COMPLAINT_URL, payload)
}
export async function deleteComplaint(complaintId: string) {
  return apiPost<Complaint>(DELETE_COMPLAINT_URL, { id: complaintId })
}

export async function assignEngineer(complaintId: string, engineerId: string) {
  return apiPost<Complaint>(ASSIGN_ENGINEER_URL, { complaintId, engineerId })
}
