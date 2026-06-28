import { NextResponse } from "next/server"

import { connectToDatabase } from "@/lib/db"
import { Mission } from "@/lib/models/Mission"
import { getStudentId } from "@/lib/session"

export async function POST() {
  const studentId = await getStudentId()
  if (!studentId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
  }

  await connectToDatabase()
  await Mission.updateOne(
    { studentId },
    { $set: { whatsappJoined: true, whatsappJoinedAt: new Date() } },
    { upsert: true }
  )

  return NextResponse.json({ ok: true })
}
