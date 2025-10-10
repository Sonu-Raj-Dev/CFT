"use client"

type Id = string | number

type ApiOptions = {
  resource: string
}

type ListResponse<T> = T[]

const USE_MOCK =
  typeof window !== "undefined" &&
  (process.env.NEXT_PUBLIC_USE_MOCK_API === "true" ||
    // allow number "1" too
    process.env.NEXT_PUBLIC_USE_MOCK_API === "1")

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, "") || ""

const MOCK_STORAGE_KEY = "cft-mock-data-v1"

// Load mock data from localStorage, or initialize empty once
async function ensureMockDataLoaded() {
  if (typeof window === "undefined") return
  const existing = window.localStorage.getItem(MOCK_STORAGE_KEY)
  if (existing) return

  // initialize an empty shape instead of fetching any default-data.json
  const emptyShape = {
    complaints: [],
    customers: [],
    engineers: [],
    users: [],
    roles: [],
    roleMappings: [],
    permissionMappings: [],
  }
  window.localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(emptyShape))
}

function getMockData(): any {
  if (typeof window === "undefined") return {}
  const raw = window.localStorage.getItem(MOCK_STORAGE_KEY)
  return raw ? JSON.parse(raw) : {}
}

function setMockData(next: any) {
  if (typeof window === "undefined") return
  window.localStorage.setItem(MOCK_STORAGE_KEY, JSON.stringify(next))
}

function makeId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return (crypto as any).randomUUID()
  }
  return String(Date.now())
}

async function mockList<T>(resource: string): Promise<ListResponse<T>> {
  await ensureMockDataLoaded()
  const db = getMockData()
  return (db[resource] || []) as T[]
}

async function mockGet<T>(resource: string, id: Id): Promise<T | null> {
  await ensureMockDataLoaded()
  const db = getMockData()
  const list = (db[resource] || []) as any[]
  return list.find((x) => String(x.id) === String(id)) ?? null
}

async function mockCreate<T extends { id?: Id }>(resource: string, payload: Omit<T, "id">): Promise<T> {
  await ensureMockDataLoaded()
  const db = getMockData()
  const list = (db[resource] || []) as any[]
  const newItem = { id: makeId(), ...payload }
  list.push(newItem)
  db[resource] = list
  setMockData(db)
  return newItem as T
}

async function mockUpdate<T>(resource: string, id: Id, payload: Partial<T>): Promise<T> {
  await ensureMockDataLoaded()
  const db = getMockData()
  const list = (db[resource] || []) as any[]
  const idx = list.findIndex((x) => String(x.id) === String(id))
  if (idx === -1) throw new Error("Not found")
  const updated = { ...list[idx], ...payload }
  list[idx] = updated
  db[resource] = list
  setMockData(db)
  return updated as T
}

async function mockRemove(resource: string, id: Id): Promise<void> {
  await ensureMockDataLoaded()
  const db = getMockData()
  const list = (db[resource] || []) as any[]
  const next = list.filter((x) => String(x.id) !== String(id))
  db[resource] = next
  setMockData(db)
}

async function liveRequest(path: string, init?: RequestInit) {
  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`
  const res = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
    cache: "no-store",
  })
  if (!res.ok) {
    const t = await res.text().catch(() => "")
    throw new Error(`API ${res.status}: ${t || res.statusText}`)
  }
  if (res.status === 204) return null
  return res.json()
}

export function createApi<T = any>({ resource }: ApiOptions) {
  return {
    list: async (): Promise<ListResponse<T>> => {
      if (USE_MOCK) return mockList<T>(resource)
      return (await liveRequest(`/${resource}`)) as ListResponse<T>
    },
    get: async (id: Id): Promise<T | null> => {
      if (USE_MOCK) return mockGet<T>(resource, id)
      return (await liveRequest(`/${resource}/${id}`)) as T
    },
    create: async (payload: Omit<T, "id">): Promise<T> => {
      if (USE_MOCK) return mockCreate<T>(resource, payload as any)
      return (await liveRequest(`/${resource}`, {
        method: "POST",
        body: JSON.stringify(payload),
      })) as T
    },
    update: async (id: Id, payload: Partial<T>): Promise<T> => {
      if (USE_MOCK) return mockUpdate<T>(resource, id, payload)
      return (await liveRequest(`/${resource}/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      })) as T
    },
    remove: async (id: Id): Promise<void> => {
      if (USE_MOCK) return mockRemove(resource, id)
      await liveRequest(`/${resource}/${id}`, { method: "DELETE" })
    },
  }
}
