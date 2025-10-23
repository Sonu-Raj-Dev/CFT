"use client"

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react"
import {
  fetchCustomers,
  fetchEngineers,
  fetchRolePermissions,
  fetchRoles,
  fetchUserRoles,
  fetchUsers,
  type Customer,
  type Engineer,
  type Role,
  type RolePermissions as RPMap,
  type User,
  type UserRoles as URMap,
  createUsers,
} from "@/repositories/masters-repo"

export type AppUser = { id: string; name: string; email: string; mobile: string; password: string; address: string }
export type RoleType = "Admin" | "ComplaintManager"
export type RouteKey =
  | "dashboard"
  | "complaints"
  | "registercomplaint"
  | "customers"
  | "engineers"
  | "users"
  | "role-mapping"
  | "permission-mapping"
  | "profile"

type RolePermissions = RPMap
type UserRoles = URMap // userId -> roles

interface MasterDataContextValue {
  customers: Customer[]
  engineers: Engineer[]
  users: User[]
  userRoles: UserRoles
  rolePermissions: RolePermissions
  // CRUD
  addCustomer: () => void
  updateCustomer: () => void
  deleteCustomer: () => void

  addEngineer: () => void
  updateEngineer: () => void
  deleteEngineer: () => void

  addUser: () => void
  updateUser: () => void
  deleteUser: () => void

  // Roles / Permissions
  setUserRoles: (userId: string, roles: Role[]) => void
  setRolePermissions: (role: Role, routes: any[]) => void
}

const MasterDataContext = createContext<MasterDataContextValue | undefined>(undefined)

const STORAGE_KEYS = {
  customers: "cft_customers",
  engineers: "cft_engineers",
  users: "cft_users",
  userRoles: "cft_user_roles",
  rolePermissions: "cft_role_permissions",
}

const allRoutes: RouteKey[] = [
  "dashboard",
  "complaints",
  "registercomplaint",
  "customers",
  "engineers",
  "users",
  "role-mapping",
  "permission-mapping",
  "profile",
]

export function MasterDataProvider({ children }: { children: ReactNode }) {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [engineers, setEngineers] = useState<Engineer[]>([])
  const [users, setUsers] = useState<User[]>([])
  const [userRoles, setUserRolesState] = useState<URMap>({})
  const [rolePermissions, setRolePermissionsState] = useState<RPMap>({} as RPMap)

  useEffect(() => {
    let cancelled = false
    async function loadAll() {
      try {
        const [cs, es, us, ur, rs, rp] = await Promise.all([
          await fetchCustomers(),
          await fetchEngineers(),
          await fetchUsers(),
          await fetchUserRoles(),
          await fetchRoles(), // kept for future use even if not directly stored
          await fetchRolePermissions(),
        ])
        if (cancelled) return
        setCustomers(cs || [])
        setEngineers(es || [])
        setUsers(us || [])
        setUserRolesState(ur || {})
        setRolePermissionsState(rp || ({} as RPMap))
      } catch (e) {
        console.log("[v0] MasterDataProvider load error:", (e as Error).message)
        setCustomers([])
        setEngineers([])
        setUsers([])
        setUserRolesState({})
        setRolePermissionsState({} as RPMap)
      }
    }
    if (typeof window !== "undefined") loadAll()
    return () => {
      cancelled = true
    }
  }, [])

  const addCustomer = () => {
    throw new Error("addCustomer API not implemented")
  }
  const updateCustomer = () => {
    throw new Error("updateCustomer API not implemented")
  }
  const deleteCustomer = () => {
    throw new Error("deleteCustomer API not implemented")
  }

  const addEngineer = () => {
    throw new Error("addEngineer API not implemented")
  }
  const updateEngineer = () => {
    throw new Error("updateEngineer API not implemented")
  }
  const deleteEngineer = () => {
    throw new Error("deleteEngineer API not implemented")
  }

  const addUser = () => {
    const addUsers = async (user: Omit<User, "id">) => {
      const created = await createUsers(user)
      setUsers((prev) => [created, ...prev])
    }
    throw new Error("addUser API not implemented")
  }
  const updateUser = () => {
    throw new Error("updateUser API not implemented")
  }
  const deleteUser = () => {
    throw new Error("deleteUser API not implemented")
  }

  const setUserRoles = (userId: string, roles: Role[]) => {
    // Placeholder until API exists
    console.warn("[v0] setUserRoles not integrated with API")
    setUserRolesState((prev) => ({ ...prev, [userId]: roles as unknown as string[] }))
  }
  const setRolePermissions = (role: Role, routes: any[]) => {
    console.warn("[v0] setRolePermissions not integrated with API")
    setRolePermissionsState((prev) => ({ ...prev, [role as unknown as string]: routes as any }))
  }

  const value = useMemo(
    () => ({
      customers,
      engineers,
      users,
      userRoles,
      rolePermissions,
      addCustomer,
      updateCustomer,
      deleteCustomer,
      addEngineer,
      updateEngineer,
      deleteEngineer,
      addUser,
      updateUser,
      deleteUser,
      setUserRoles,
      setRolePermissions,
    }),
    [customers, engineers, users, userRoles, rolePermissions],
  )

  return <MasterDataContext.Provider value={value}>{children}</MasterDataContext.Provider>
}

export function useMasterData() {

  const ctx = useContext(MasterDataContext)
  if (!ctx) throw new Error("useMasterData must be used within MasterDataProvider")
  return ctx
}
