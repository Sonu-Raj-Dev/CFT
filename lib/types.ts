export interface Complaint {
  id: string
  customerName: string
  complaintDetails: string
  mobileNumber: string
  address: string
  email: string
  natureOfComplaint: string
  status: string
  assignedEngineer?: string
}
