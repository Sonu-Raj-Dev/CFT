import type { NextRequest } from "next/server"
import { CUSTOMERS_URL } from "@/lib/api/endpoints"
import { proxyGet, respondOrDefault } from "@/lib/server/api-proxy"
import { defaults } from "@/lib/server/defaults"

export async function GET(req: NextRequest) {
  return respondOrDefault(proxyGet(req, CUSTOMERS_URL), defaults.masters.customers)
}
