import type { NextRequest } from "next/server"
import { COMPLAINT_CREATE_URL } from "@/lib/api/endpoints"
import { proxyPost, respondOrDefault } from "@/lib/server/api-proxy"
import { defaults } from "@/lib/server/defaults"

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  return respondOrDefault(proxyPost(req, COMPLAINT_CREATE_URL, body), defaults.complaints.create, 200)
}
