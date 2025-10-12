"use client"

import { apiPost } from "@/lib/api/http"
import { AUTH_LOGIN_INTERNAL, AUTH_REGISTER_INTERNAL } from "@/lib/api/endpoints"

export type LoginPayload = { emailId?: string; email?: string; password: string }
export type RegisterPayload = {
  name: string
  emailId?: string
  email?: string
  password: string
  mobileNumber?: string
  address?: string
}

export type UserSession = {
  id: string | number
  name: string
  email: string
  roleId?: number
  token?: string
  permissionNames?: string[] // normalized from API "permissions[].name"
}

type Envelope<T> = { success?: boolean; message?: string; data?: T }

function mapUserSession(data: any): UserSession {
  return {
    id: data?.userId ?? data?.id ?? "",
    name: data?.name ?? "",
    email: data?.emailId ?? data?.email ?? "",
    roleId: data?.roleId,
    token: data?.token,
    permissionNames: data?.permissions?.map((p: any) => String(p?.name ?? "").trim()).filter(Boolean) ?? [],
  }
}

export async function login(payload: LoginPayload): Promise<UserSession> {
  
  const body = {
    Email: payload.emailId ?? payload.email, // backend expects emailId
    Password: payload.password,
  }
  const res = await apiPost<Envelope<any>>(AUTH_LOGIN_INTERNAL, body)

  // tolerate different envelopes (internal proxy vs direct)
  // The provided API response shape:
  // { status, message, data: { user: {...}, permissions: [{ name: "Dashboard" }, ...] } }
  var envelope = res ?? {}
  var maybeBackend = envelope?.data // some proxies put payload under .data
  var userPayload = maybeBackend?.user
  var permsPayload = Array.isArray(maybeBackend?.user?.permissions) ? maybeBackend?.user?.permissions : []

  // derive permission names (strings)
  var permissionNames = permsPayload.map((p: any) => String(p?.name ?? "").trim()).filter(Boolean)

  // Build a normalized session
  const session: UserSession = {
    id: userPayload?.userId ?? userPayload?.id ?? "",
    name: userPayload?.userName ?? userPayload?.name ?? "",
    email: userPayload?.email ?? userPayload?.emailId ?? "",
    roleId: Array.isArray(userPayload?.roleId) ? userPayload?.roleId : [],
    token: userPayload?.token ?? undefined,
    permissionNames,
  }

  // if backend explicitly signals failure and no user, throw
  const isSuccess =
    (typeof maybeBackend?.status === "number" ? maybeBackend.status === 0 : envelope?.success !== false) &&
    (session.email !== "" || permissionNames.length > 0)

  if (!isSuccess) {
    throw new Error(envelope?.message || maybeBackend?.message || "Login failed")
  }
  return session
}

export async function register(payload: RegisterPayload): Promise<UserSession> {
  const body = {
    name: payload.name,
    emailId: payload.emailId ?? payload.email,
    password: payload.password,
    mobileNumber: payload.mobileNumber,
    address: payload.address,
  }
  const res = await apiPost<Envelope<any>>(AUTH_REGISTER_INTERNAL, body)
  if (!res || (!res.success && !res.data)) {
    throw new Error(res?.message || "Registration failed")
  }
  return mapUserSession(res.data)
}
