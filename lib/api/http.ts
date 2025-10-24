import { de } from "date-fns/locale";
import { withBase } from "./endpoints"

export function withTimeout(ms = 10000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort("Request timed out"), ms);

  return {
    signal: controller.signal,
    cancel: () => clearTimeout(id)
  };
}


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

export async function apiGets<T>(path: string, body?: unknown, init?: RequestInit) {
  const url = withBase(path)
  
 // const t = withTimeout()
  try {
    const res = await fetch(url, {
      ...init,
      method: "POST",
     headers: { "Content-Type": "application/json", Accept: "application/json", ...(init?.headers || {}) },
    body: body ? JSON.stringify(body) : undefined,
    })
    
    return handle<T>(res)
  } catch (e: any) {
    if (e?.name === "AbortError") throw new Error("Request timed out")
    throw new Error(e?.message || "Network error")
  } finally {
   // t.cancel()
  }
}
export async function apiGet<T>(path: string, init?: RequestInit) {
  const url = withBase(path)
 // const t = withTimeout()
  try {
    const res = await fetch(url, {
      ...init,
      method: "POST",
     headers: { "Content-Type": "application/json", Accept: "application/json", ...(init?.headers || {}) },
    //body: body ? JSON.stringify(body) : undefined,
    })

    return handle<T>(res)
  } catch (e: any) {
    if (e?.name === "AbortError") throw new Error("Request timed out")
    throw new Error(e?.message || "Network error")
  } finally {
   // t.cancel()
  }
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
