import { describe } from "node:test"
import { withBase } from "./endpoints"

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let message = `HTTP ${res.status}`
    try {
      const data = await res.json()
      message = data?.message || data?.error || message
    } catch {}
    throw new Error(message)
  }
  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export async function apiGet<T>(path: string, init?: RequestInit) {
  const url = withBase(path)
   
  const res = await fetch(url, {
    ...init,
    method: "GET",
    headers: { "Content-Type": "application/json", Accept: "application/json", ...(init?.headers || {}) },
    cache: "no-store",
  })
  
  return handle<T>(res)
}

export async function apiPost<T>(path: string, body?: unknown, init?: RequestInit) {
  
  const url = withBase(path)
  const res = await fetch(url, {
    ...init,
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json", ...(init?.headers || {}) },
    body: body ? JSON.stringify(body) : undefined,
  })
  
  return handle<T>(res)
}
