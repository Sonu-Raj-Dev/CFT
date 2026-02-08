export const BASE_URL =
  (typeof process !== "undefined" && process.env?.NEXT_PUBLIC_API_BASE_URL) ||
  "";

// Auth Endpoints
export const LOGIN_URL = "/api/auth/login";
export const REGISTER_URL = "/api/auth/register";
export const AUTH_LOGIN_INTERNAL = "/api/auth/login";
export const AUTH_REGISTER_INTERNAL = "/api/auth/register";
export const AUTH_ME_URL = "/api/auth/me";

// User Management Endpoints
export const USERS_URL = "/api/masters/users";
export const USERS_CREATE_URL = "/api/masters/users";
export const USERS_BY_ID_URL = (id: number) => `/api/masters/users/${id}`;

// Role Management Endpoints
export const ROLES_URL = "/api/masters/roles";
export const ROLES_CREATE_URL = "/api/masters/roles";
export const ROLES_BY_ID_URL = (id: number) => `/api/masters/roles/${id}`;

// Permission Management Endpoints
export const PERMISSIONS_URL = "/api/masters/permissions";
export const PERMISSIONS_CREATE_URL = "/api/masters/permissions";
export const PERMISSIONS_BY_ID_URL = (id: number) => `/api/masters/permissions/${id}`;

// Role-Permission Mapping Endpoints
export const ROLE_PERMISSIONS_URL = "/api/masters/role-permissions";
export const ROLE_PERMISSIONS_ASSIGN_URL = "/api/masters/role-permissions";
export const ROLE_PERMISSIONS_BY_ROLE_URL = (roleId: number) => `/api/masters/role-permissions/${roleId}`;
export const SAVE_PERMISSIONS_BY_ROLE_URL = "/api/masters/role-permissions";

// User-Role Mapping Endpoints
export const USER_ROLES_URL = "/api/masters/user-roles";
export const USER_ROLES_ASSIGN_URL = "/api/masters/user-roles";
export const USER_ROLES_BY_USER_URL = (userId: number) => `/api/masters/user-roles/${userId}`;
export const USER_PERMISSIONS_CREATE_URL = "/api/masters/user-roles";
export const USER_PERMISSIONS_BY_ROLE_URL = (roleId: number) => `/api/masters/role-permissions/${roleId}`;

// Customer Management Endpoints
export const CUSTOMERS_URL = "/api/masters/customers";
export const CUSTOMER_CREATE_URL = "/api/masters/customers";
export const CUSTOMERS_BY_ID_URL = (id: number) => `/api/masters/customers/${id}`;

// Engineer Management Endpoints
export const ENGINEERS_URL = "/api/masters/engineers";
export const ENGINEER_CREATE_URL = "/api/masters/engineers";
export const CREATE_ENGINEERS_URL = "/api/masters/engineers";
export const ENGINEERS_BY_ID_URL = (id: number) => `/api/masters/engineers/${id}`;

// Status Management Endpoints
export const STATUSES_URL = "/api/masters/statuses";
export const STATUSES_BY_ID_URL = (id: number) => `/api/masters/statuses/${id}`;

// Complaint Management Endpoints
export const COMPLAINTS_URL = "/api/complaints";
export const COMPLAINTS_LIST_URL = "/api/complaints";
export const COMPLAINT_CREATE_URL = "/api/complaints";
export const CREATE_COMPLAINT_URL = "/api/complaints";
export const COMPLAINTS_BY_ID_URL = (id: number) => `/api/complaints/${id}`;
export const COMPLAINT_ASSIGN_URL = (id: number) => `/api/complaints/${id}/assign-engineer`;
export const ASSIGN_ENGINEER_URL = (id: number) => `/api/complaints/${id}/assign-engineer`;
export const COMPLAINT_UPDATE_STATUS_URL = (id: number) => `/api/complaints/${id}/status`;
export const DELETE_COMPLAINT_URL = (id: number) => `/api/complaints/${id}`;


// Helper to build absolute URLs
export function withBase(path: string) {
  if (!BASE_URL) return path;
  try {
    return new URL(path, BASE_URL).toString();
  } catch {
    return `${BASE_URL}${path}`;
  }
}
