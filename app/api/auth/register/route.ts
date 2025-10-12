import type { NextRequest } from "next/server"
import { REGISTER_URL } from "@/lib/api/endpoints"
import { proxyPost, respondOrDefault } from "@/lib/server/api-proxy"
import { defaults } from "@/lib/server/defaults"

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  return respondOrDefault(proxyPost(req, REGISTER_URL, body), defaults.auth.register, 200)
}
