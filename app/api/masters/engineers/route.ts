import type { NextRequest } from "next/server"
import { ENGINEERS_URL } from "@/lib/api/endpoints"
import { proxyGet, respondOrDefault } from "@/lib/server/api-proxy"
import { defaults } from "@/lib/server/defaults"

export async function GET(req: NextRequest) {
  return respondOrDefault(proxyGet(req, ENGINEERS_URL), defaults.masters.engineers)
}
