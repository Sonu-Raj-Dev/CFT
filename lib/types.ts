export interface Complaint {
  id: string
  customerName: string
  complaintdetails: string
  mobileNumber: string
  address: string
  email: string
  natureOfComplaint: string
  statusName: string
  assignedEngineer?: string
  engineerId?: string | null
  statusId?: number
}
