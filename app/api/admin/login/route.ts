import { NextResponse } from "next/server"

import { signAdminToken } from "@/lib/auth"
import { setAdminCookie } from "@/lib/session"

export async function POST(request: Request) {
  const body = await request.json().catch(() => ({}))
  const password = typeof body?.password === "string" ? body.password : ""

  const expected = process.env.ADMIN_PASSWORD
  if (!expected) {
    return NextResponse.json(
      { ok: false, error: "Admin access is not configured (set ADMIN_PASSWORD)." },
      { status: 500 }
    )
  }

  if (!password || password !== expected) {
    return NextResponse.json(
      { ok: false, error: "Incorrect password." },
      { status: 401 }
    )
  }

  await setAdminCookie(await signAdminToken())
  return NextResponse.json({ ok: true })
}
