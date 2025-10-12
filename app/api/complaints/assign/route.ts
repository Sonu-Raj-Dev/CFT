import type { NextRequest } from "next/server"
import { COMPLAINT_ASSIGN_URL } from "@/lib/api/endpoints"
import { proxyPost, respondOrDefault } from "@/lib/server/api-proxy"
import { defaults } from "@/lib/server/defaults"

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  return respondOrDefault(proxyPost(req, COMPLAINT_ASSIGN_URL, body), defaults.complaints.assign, 200)
}
