import { type NextRequest, NextResponse } from "next/server"

export function getBaseUrl() {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL
  return base?.replace(/\/+$/, "") || ""
}

export function getAuthHeader(req: NextRequest) {
  const hdr = req.headers.get("authorization")
  return hdr ? { Authorization: hdr } : {}
}

export async function proxyGet(req: NextRequest, path: string, query?: URLSearchParams) {
  const base = getBaseUrl()
  if (!base) throw new Error("Missing NEXT_PUBLIC_API_BASE_URL")
  const qs = query ? `?${query.toString()}` : ""
  const url = `${base}${path}${qs}`
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      ...getAuthHeader(req),
    },
    cache: "no-store",
  })
  return res
}

export async function proxyPost(req: NextRequest, path: string, body?: unknown) {
  const base = getBaseUrl()
  if (!base) throw new Error("Missing NEXT_PUBLIC_API_BASE_URL")
  const url = `${base}${path}`

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...getAuthHeader(req),
    },
    body: body ? JSON.stringify(body) : await req.text(),
    cache: "no-store",
  })
  return res
}

export async function respondOrDefault<T>(resPromise: Promise<Response>, fallback: T, okStatus = 200) {
  try {
    const res = await resPromise
    if (!res.ok) return NextResponse.json(fallback as any, { status: okStatus })
    const data = await res.json()
    return NextResponse.json(data, { status: res.status })
  } catch {
    return NextResponse.json(fallback as any, { status: okStatus })
  }
}
