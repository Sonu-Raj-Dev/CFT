"use client"

import { apiPost } from "@/lib/api/http"
import { LOGIN_URL, REGISTER_URL } from "@/lib/api/endpoints"

export type LoginPayload = { email: string; password: string }
export type RegisterPayload = { name: string; email: string; password: string; mobile?: string; address?: string }

export type UserSession = {
  data: {
    id: number | string
    roles?: string[]
    name: string
    email: string
    token?: string
  }
}

export async function login(payload: LoginPayload): Promise<UserSession> {
  return apiPost<UserSession>(LOGIN_URL, payload)
}

export async function register(payload: RegisterPayload): Promise<UserSession> {
  return apiPost<UserSession>(REGISTER_URL, payload)
}
