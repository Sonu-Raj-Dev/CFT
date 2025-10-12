import type { NextRequest } from "next/server"
import { COMPLAINTS_LIST_URL } from "@/lib/api/endpoints"
import { proxyGet, respondOrDefault } from "@/lib/server/api-proxy"
import { defaults } from "@/lib/server/defaults"

export async function GET(req: NextRequest) {
  return respondOrDefault(proxyGet(req, COMPLAINTS_LIST_URL), defaults.complaints.list)
}
