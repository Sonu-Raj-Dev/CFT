import type { NextRequest } from "next/server"
import { ROLE_PERMISSIONS_URL } from "@/lib/api/endpoints"
import { proxyGet, respondOrDefault } from "@/lib/server/api-proxy"
import { defaults } from "@/lib/server/defaults"

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  return respondOrDefault(proxyGet(req, ROLE_PERMISSIONS_URL, searchParams), defaults.masters.rolePermissions)
}
