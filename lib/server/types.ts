/**
 * Database model types
 */

export interface User {
  id: number;
  userName: string;
  email: string;
  password: string; // Bcrypt hash
  isActive: boolean;
  createdBy?: number;
  createdDate: Date;
  modifiedBy?: number;
  modifiedDate?: Date;
}

export interface Role {
  id: number;
  roleName: string;
  isActive: boolean;
  createdBy?: number;
  createdDate: Date;
  modifiedBy?: number;
  modifiedDate?: Date;
}

export interface Permission {
  id: number;
  name: string;
  isActive: boolean;
  createdBy?: number;
  createdDate: Date;
  modifiedBy?: number;
  modifiedDate?: Date;
}

export interface UserRoleMapping {
  id: number;
  userId: number;
  roleId: number;
  isActive: boolean;
  createdBy?: number;
  createdDate: Date;
  modifiedBy?: number;
  modifiedDate?: Date;
}

export interface RolePermissionMapping {
  id: number;
  roleId: number;
  permissionId: number;
  isActive: boolean;
  createdBy?: number;
  createdDate: Date;
  modifiedBy?: number;
  modifiedDate?: Date;
}

export interface Customer {
  id: number;
  customerName: string;
  mobileNumber: number;
  emailId: string;
  address: string;
  isActive: boolean;
  createdBy?: number;
  createdDate: Date;
  modifiedBy?: number;
  modifiedDate?: Date;
}

export interface Engineer {
  id: number;
  name: string;
  email: string;
  mobileNumber: number;
  isActive: boolean;
  createdBy?: number;
  createdDate: Date;
  modifiedBy?: number;
  modifiedDate?: Date;
}

export interface Status {
  id: number;
  statusName: string;
  isActive: boolean;
  createdBy?: number;
  createdDate: Date;
  modifiedBy?: number;
  modifiedDate?: Date;
}

export interface Complaint {
  id: number;
  customerId: number;
  natureOfComplaint: string;
  complaintDetails: string;
  engineerId?: number;
  statusId: number;
  isActive: boolean;
  createdBy?: number;
  createdDate: Date;
  modifiedBy?: number;
  modifiedDate?: Date;
}

/**
 * API Request/Response types
 */

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  userId: number;
  userName: string;
  email: string;
  roles: Role[];
  permissions: Permission[];
  token: string;
}

export interface UserDetails {
  id: number;
  userName: string;
  email: string;
  isActive: boolean;
  createdDate: Date;
  modifiedDate?: Date;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
}

export interface FilterParams {
  isActive?: boolean;
  search?: string;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Request context with authentication
 */
export interface AuthenticatedRequest {
  userId: number;
  email: string;
  roleIds: number[];
  permissionNames: string[];
}
