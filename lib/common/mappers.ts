import type { AppSession, LoginApiResponse } from "./types"

// Map API permission "name" field to our route keys used in Sidebar.allowedRoutes
// e.g. "RoleMapping" -> "role-mapping"
export function toRouteKeyFromPermissionName(name: string): string {
  const trimmed = (name || "").trim()
  // normalize camel/pascal to kebab
  const kebab = trimmed
    // insert hyphen before capitals (RoleMapping -> Role-Mapping)
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/\s+/g, "-")
    .toLowerCase()

  // special cases if backend sends spaces (e.g., "Role Permission Mapping")
  return kebab
}

// Build the AppSession from the real API response
export function mapLoginResponseToSession(resp: LoginApiResponse): AppSession {
  const user = resp?.data?.user
  const perms = resp?.data?.permissions ?? []

  const permissionNames = perms
    .map((p) => toRouteKeyFromPermissionName(p?.name ?? ""))
    // filter empties and de-duplicate
    .filter(Boolean)
    .filter((v, i, arr) => arr.indexOf(v) === i)

  return {
    user: {
      id: user?.id ?? 0,
      name: user?.userName ?? "",
      email: user?.email ?? "",
      token: user?.token ?? null,
      roleId: user?.roleId,
    },
    permissionNames,
    raw: resp,
  }
}
