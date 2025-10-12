import type { NextRequest } from "next/server"
import { USER_ROLES_URL } from "@/lib/api/endpoints"
import { proxyGet, respondOrDefault } from "@/lib/server/api-proxy"
import { defaults } from "@/lib/server/defaults"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  return respondOrDefault(proxyGet(req, USER_ROLES_URL, searchParams), defaults.masters.userRoles)
}
