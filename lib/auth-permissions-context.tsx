"use client"

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import { useMasterData, type RouteKey, type Role } from "./master-data-context"
import { login as apiLogin } from "@/repositories/auth-repo"

export interface SessionUser {
  id: string
  name: string
  email: string
  roles: Role[]
  permissionNames?: string[]
}

interface AuthPermissionsContextValue {
  user: SessionUser | null
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>
  logout: () => void
  allowedRoutes: RouteKey[]
}

const AuthPermissionsContext = createContext<AuthPermissionsContextValue | undefined>(undefined)

export function AuthPermissionsProvider({ children }: { children: ReactNode }) {
  const { users, userRoles, rolePermissions } = useMasterData()
  const [user, setUser] = useState<SessionUser | null>(null)

  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = localStorage.getItem("cft_user")
    if (stored) {
      try {
        const parsed = JSON.parse(stored) as Partial<SessionUser> & { id: string; name: string; email: string }
        const normalizedRoles: Role[] = Array.isArray(parsed.roles) ? parsed.roles : (userRoles?.[parsed.id] ?? [])
        setUser({
          id: parsed.id,
          name: parsed.name,
          email: parsed.email,
          roles: normalizedRoles,
          permissionNames: Array.isArray(parsed.permissionNames) ? parsed.permissionNames : [],
        })
      } catch {
        setUser(null)
      }
    }
  }, [userRoles])

  useEffect(() => {
    if (user && !Array.isArray(user.roles)) {
      setUser({ ...user, roles: userRoles[user.id] ?? [] })
    }
  }, [user, userRoles])

  const login = async (email: string, password: string) => {
    try {
      const session = await apiLogin({ email, password })
      const rolesFromApi = Array.isArray(session.roleId) ? (session.roleId as Role[]) : (userRoles?.[session.id] ?? [])
      const normalized: SessionUser = {
        id: String(session.id),
        name: session.name,
        email: session.email,
        roles: rolesFromApi as Role[],
        permissionNames: Array.isArray(session.permissionNames) ? session.permissionNames : [],
      }
      localStorage.setItem("cft_user", JSON.stringify(normalized))
      setUser(normalized)
      return { ok: true }
    } catch (e) {
      console.error("[v0] login error:", (e as Error).message)
      return { ok: false, error: (e as Error).message }
    }
  }

  const logout = () => {
    localStorage.removeItem("cft_user")
    setUser(null)
  }

  function permissionNameToRouteKey(name: string): RouteKey | null {
    const key = (name || "")
      .trim()
      .replace(/([a-z])([A-Z])/g, "$1-$2") // RoleMapping -> Role-Mapping
      .replace(/\s+/g, "-")
      .toLowerCase()

    // whitelist to valid RouteKey values used by Sidebar
    const allowed: RouteKey[] = [
      "dashboard",
      "complaints",
      "register-complaint",
      "customers",
      "engineers",
      "users",
      "role-mapping",
      "permission-mapping",
      "profile",
    ]
    return allowed.includes(key as RouteKey) ? (key as RouteKey) : null
  }

  const allowedRoutes = useMemo(() => {
    if (!user) return []
    // Prefer direct permissions from API if present
    if (Array.isArray(user.permissionNames) && user.permissionNames.length > 0) {
      const set = new Set<RouteKey>()
      user.permissionNames.forEach((p) => {
        const rk = permissionNameToRouteKey(p)
        if (rk) set.add(rk)
      })
      return Array.from(set)
    }

    // Fallback to role-based mapping if API permissions missing
    const routeSet = new Set<RouteKey>()
    const rolesArray: Role[] = Array.isArray(user.roles) ? user.roles : []
    const safeRolePermissions = rolePermissions || ({} as Record<Role, RouteKey[]>)

    rolesArray.forEach((r) => {
      const routesList = Array.isArray(safeRolePermissions[r]) ? safeRolePermissions[r] : []
      routesList.forEach((rt) => routeSet.add(rt))
    })
    return Array.from(routeSet)
  }, [user, rolePermissions])

  const value = useMemo(() => ({ user, login, logout, allowedRoutes }), [user, allowedRoutes])
  return <AuthPermissionsContext.Provider value={value}>{children}</AuthPermissionsContext.Provider>
}

export function useAuthPermissions() {
  const ctx = useContext(AuthPermissionsContext)
  if (!ctx) throw new Error("useAuthPermissions must be used within AuthPermissionsProvider")
  return ctx
}
