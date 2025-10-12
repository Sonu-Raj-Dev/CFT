"use client"
import type { ReactNode } from "react"
import { AuthPermissionsProvider, useAuthPermissions } from "./auth-permissions-context"

export function UserProvider({ children }: { children: ReactNode }) {
  return <AuthPermissionsProvider>{children}</AuthPermissionsProvider>
}

export const useUser = useAuthPermissions
