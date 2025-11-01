"use client";

import { apiGet, apiGets, apiPost } from "@/lib/api/http";
import {
  USERS_URL,
  ROLES_URL,
  PERMISSIONS_URL,
  USER_ROLES_URL,
  ROLE_PERMISSIONS_URL,
  CUSTOMERS_URL,
  ENGINEERS_URL,
  USERS_CREATE_URL,
  CUSTOMER_CREATE_URL,
  ENGINEER_CREATE_URL,
  USER_PERMISSIONS_CREATE_URL,
  USER_PERMISSIONS_BY_ROLE_URL,
  SAVE_PERMISSIONS_BY_ROLE_URL,
  CREATE_ENGINEERS_URL,
  GET_NATURE_OF_COMPLAINT_URL
} from "@/lib/api/endpoints";

export type User = {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  address?: string;
};
export type Role = { id: string; name: string };
export type Permission = { id: string; key: string; label: string };
export type Customer = {
  id: string;
  name: string;
  mobile: string;
  address?: string;
  email?: string;
};
export type Engineer = {
  id: string;
  name: string;
  mobilenumber?: string;
  email?: string;
};

export type UserRoles = Record<string, string[]>; // userId -> roleIds
export type RolePermissions = Record<string, string[]>; // roleId -> permissionIds

//users
export async function fetchUsers() {
  return apiGet<User[]>(USERS_URL);
}
export async function createUsers(payload: Omit<User, "id">) {
  return apiPost<User>(USERS_CREATE_URL, payload);
}

//customers
export async function fetchCustomers() {
  return apiGet<Customer[]>(CUSTOMERS_URL);
}

export async function createCustomer(payload: Omit<User, "id">) {
  return apiPost<User>(CUSTOMER_CREATE_URL, payload);
}

//Engineers
export async function fetchEngineers() {
  return apiGet<Engineer[]>(ENGINEERS_URL);
}
export async function createEngineer(payload:any) {
  return apiPost<Engineer>(CREATE_ENGINEERS_URL, payload);
}

//Roles
export async function fetchRoles() {
  return apiGet<Role[]>(ROLES_URL);
}
export async function fetchUserRoles() {
  return apiGet<UserRoles>(USER_ROLES_URL);
}

//Permissions
export async function fetchPermissions() {
  return apiGet<Permission[]>(PERMISSIONS_URL);
}
export async function fetchRolePermissions() {
  return apiGet<RolePermissions>(ROLE_PERMISSIONS_URL);
}

export async function CreateRolePermissions(payload: any) {
  return apiPost<RolePermissions>(USER_PERMISSIONS_CREATE_URL, payload);
}
export async function fetchPermissionsByRole(payload: any) {
  return apiGets<RolePermissions>(USER_PERMISSIONS_BY_ROLE_URL, payload);
}

export async function SavePermissionsByRole(payload: any) {
  return apiPost<RolePermissions>(SAVE_PERMISSIONS_BY_ROLE_URL, payload);
}

// Fetch Nature of Complaint
export async function fetchNatureOfComplaint(payload?: any) {
  return apiGet<any[]>(GET_NATURE_OF_COMPLAINT_URL);
}