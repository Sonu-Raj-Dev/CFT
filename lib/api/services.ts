'use client';

import { apiClient } from './axios-client';
import {
  USERS_URL,
  ROLES_URL,
  PERMISSIONS_URL,
  CUSTOMERS_URL,
  ENGINEERS_URL,
  COMPLAINTS_URL,
  COMPLAINTS_BY_ID_URL,
  COMPLAINT_CREATE_URL,
  COMPLAINT_UPDATE_STATUS_URL,
  ASSIGN_ENGINEER_URL,
  DELETE_COMPLAINT_URL,
  ROLE_PERMISSIONS_BY_ROLE_URL,
  USERS_BY_ID_URL,
  ENGINEERS_BY_ID_URL,
  CUSTOMERS_BY_ID_URL,
  USER_ROLES_ASSIGN_URL,
  ROLE_PERMISSIONS_ASSIGN_URL,
  STATUSES_URL,
  COMPLAINT_ASSIGN_URL,
} from './endpoints';

/**
 * User Service
 */
export const userService = {
  getAllUsers: async (page: number = 1, limit: number = 10, search?: string) => {
    return apiClient.get(USERS_URL, { page, limit, search });
  },

  getUserById: async (id: number) => {
    return apiClient.get(USERS_BY_ID_URL(id));
  },

  createUser: async (data: any) => {
    return apiClient.post(USERS_URL, data);
  },

  updateUser: async (id: number, data: any) => {
    return apiClient.patch(USERS_BY_ID_URL(id), data);
  },

  deleteUser: async (id: number) => {
    return apiClient.delete(USERS_BY_ID_URL(id));
  },

  assignRole: async (userId: number, roleId: number) => {
    return apiClient.post(USER_ROLES_ASSIGN_URL, { userId, roleId });
  },
};

/**
 * Role Service
 */
export const roleService = {
  getAllRoles: async (page: number = 1, limit: number = 10) => {
    return apiClient.get(ROLES_URL, { page, limit });
  },

  createRole: async (data: any) => {
    return apiClient.post(ROLES_URL, data);
  },

  updateRole: async (id: number, data: any) => {
    return apiClient.patch(`${ROLES_URL}/${id}`, data);
  },

  deleteRole: async (id: number) => {
    return apiClient.delete(`${ROLES_URL}/${id}`);
  },

  getPermissionsByRole: async (roleId: number) => {
    return apiClient.get(ROLE_PERMISSIONS_BY_ROLE_URL(roleId));
  },

  assignPermission: async (roleId: number, permissionId: number) => {
    return apiClient.post(ROLE_PERMISSIONS_ASSIGN_URL, { roleId, permissionId });
  },

  removePermission: async (roleId: number, permissionId: number) => {
    return apiClient.delete(`${ROLE_PERMISSIONS_ASSIGN_URL}/${roleId}/${permissionId}`);
  },
};

/**
 * Permission Service
 */
export const permissionService = {
  getAllPermissions: async (page: number = 1, limit: number = 10) => {
    return apiClient.get(PERMISSIONS_URL, { page, limit });
  },

  createPermission: async (data: any) => {
    return apiClient.post(PERMISSIONS_URL, data);
  },

  updatePermission: async (id: number, data: any) => {
    return apiClient.patch(`${PERMISSIONS_URL}/${id}`, data);
  },

  deletePermission: async (id: number) => {
    return apiClient.delete(`${PERMISSIONS_URL}/${id}`);
  },
};

/**
 * Customer Service
 */
export const customerService = {
  getAllCustomers: async (page: number = 1, limit: number = 10, search?: string) => {
    return apiClient.get(CUSTOMERS_URL, { page, limit, search });
  },

  getCustomerById: async (id: number) => {
    return apiClient.get(CUSTOMERS_BY_ID_URL(id));
  },

  createCustomer: async (data: any) => {
    return apiClient.post(CUSTOMERS_URL, data);
  },

  updateCustomer: async (id: number, data: any) => {
    return apiClient.patch(CUSTOMERS_BY_ID_URL(id), data);
  },

  deleteCustomer: async (id: number) => {
    return apiClient.delete(CUSTOMERS_BY_ID_URL(id));
  },
};

/**
 * Engineer Service
 */
export const engineerService = {
  getAllEngineers: async (page: number = 1, limit: number = 10, search?: string) => {
    return apiClient.get(ENGINEERS_URL, { page, limit, search });
  },

  getEngineerById: async (id: number) => {
    return apiClient.get(ENGINEERS_BY_ID_URL(id));
  },

  createEngineer: async (data: any) => {
    return apiClient.post(ENGINEERS_URL, data);
  },

  updateEngineer: async (id: number, data: any) => {
    return apiClient.patch(ENGINEERS_BY_ID_URL(id), data);
  },

  deleteEngineer: async (id: number) => {
    return apiClient.delete(ENGINEERS_BY_ID_URL(id));
  },
};

/**
 * Status Service
 */
export const statusService = {
  getAllStatuses: async (page: number = 1, limit: number = 10) => {
    return apiClient.get(STATUSES_URL, { page, limit });
  },
};

/**
 * Complaint Service
 */
export const complaintService = {
  getAllComplaints: async (page: number = 1, limit: number = 10, search?: string) => {
    return apiClient.get(COMPLAINTS_URL, { page, limit, search });
  },

  getComplaintById: async (id: number) => {
    return apiClient.get(COMPLAINTS_BY_ID_URL(id));
  },

  createComplaint: async (data: any) => {
    return apiClient.post(COMPLAINT_CREATE_URL, data);
  },

  updateComplaint: async (id: number, data: any) => {
    return apiClient.patch(COMPLAINTS_BY_ID_URL(id), data);
  },

  deleteComplaint: async (id: number) => {
    return apiClient.delete(DELETE_COMPLAINT_URL(id));
  },

  assignEngineer: async (complaintId: number, engineerId: number) => {
    return apiClient.post(COMPLAINT_ASSIGN_URL(complaintId), { engineerId });
  },

  updateStatus: async (complaintId: number, statusId: number) => {
    return apiClient.patch(COMPLAINT_UPDATE_STATUS_URL(complaintId), { statusId });
  },
};
