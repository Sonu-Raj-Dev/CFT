export const BASE_URL = (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_BASE_URL) || ""

// Auth
export const LOGIN_URL = "/api/Login/UserLogin"
export const REGISTER_URL = "/api/LoginMaster/RegisterUser"
export const AUTH_LOGIN_INTERNAL = "/api/Login/UserLogin"
export const AUTH_REGISTER_INTERNAL = "/api/auth/register"

// Masters
export const USERS_URL = "/api/UserMaster/GetAllUsers"
export const ROLES_URL = "/api/RoleMaster/GetAllRoles"
export const PERMISSIONS_URL = "/api/PermissionMaster/GetAllPermissions"
export const USER_ROLES_URL = "/api/UserMaster/GetUserRoles"
export const ROLE_PERMISSIONS_URL = "/api/RoleMaster/GetRolePermissions"
export const CUSTOMERS_URL = "/api/CustomerMaster/GetAllCustomers"
export const ENGINEERS_URL = "/api/EngineerMaster/GetAllEngineers"

// Complaints
export const COMPLAINTS_URL = "/api/Complaint/GetAllComplaints"
export const CREATE_COMPLAINT_URL = "/api/Complaint/Create"
export const ASSIGN_ENGINEER_URL = "/api/Complaint/AssignEngineer"


export const DELETE_COMPLAINT_URL = "/api/Complaint/Delete"
// Aliases for expected import names
export const COMPLAINTS_LIST_URL = COMPLAINTS_URL
export const COMPLAINT_CREATE_URL = CREATE_COMPLAINT_URL
export const COMPLAINT_ASSIGN_URL = ASSIGN_ENGINEER_URL

// Helper to build absolute URLs
export function withBase(path: string) {
  if (!BASE_URL) return path
  try {
    return new URL(path, BASE_URL).toString()
  } catch {
    return `${BASE_URL}${path}`
  }
}
