import { NextResponse } from "next/server"

import { connectToDatabase } from "@/lib/db"
import { Showcase } from "@/lib/models/Showcase"
import { isAdmin } from "@/lib/session"
import { showcaseSchema } from "@/lib/validation"

export async function POST(request: Request) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const parsed = showcaseSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Invalid values", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  await connectToDatabase()
  await Showcase.updateOne(
    { key: "main" },
    { $set: parsed.data },
    { upsert: true }
  )

  return NextResponse.json({ ok: true })
}
