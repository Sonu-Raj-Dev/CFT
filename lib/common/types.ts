// API response based on provided login payload
export interface LoginApiResponse {
  status: number
  message: string
  totalCount?: number
  data?: {
    user: {
      id: number
      userName: string
      email: string
      password?: string | null
      token?: string | null
      roleId?: number
      roles?: unknown | null
      permissions?: unknown | null
      isActive?: boolean
      createdBy?: number
      createdDate?: string | null
      modifiedBy?: number
      modifiedDate?: string | null
    }
    permissions: Array<{
      id: number
      userId: number
      roleId: number
      permissionId: number
      name: string // e.g., "Dashboard", "Complaints", "Customers", "Engineers", "Users", "RoleMapping", "PermissionMapping", "Profile"
      isActive: boolean
      createdBy?: number
      createdDate?: string | null
      modifiedBy?: number
      modifiedDate?: string | null
    }>
  }
}

// Canonical app session kept on the client
export interface AppSession {
  user: {
    id: number
    name: string
    email: string
    token?: string | null
    roleId?: number
  }
  // normalized permission names, e.g. ["dashboard","complaints","customers","engineers","users","role-mapping","permission-mapping","profile"]
  permissionNames: string[]
  // raw payload if needed for debugging
  raw?: LoginApiResponse
}
