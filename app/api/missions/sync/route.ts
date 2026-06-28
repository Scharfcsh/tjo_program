import { NextResponse } from "next/server"

import { connectToDatabase } from "@/lib/db"
import { Student } from "@/lib/models/Student"
import { getStudentId } from "@/lib/session"
import { syncMissionStats, getCollegeRankForStudent } from "@/lib/points"

export async function POST() {
  const studentId = await getStudentId()
  if (!studentId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
  }

  await connectToDatabase()
  const student = await Student.findById(studentId).select("email status").lean()
  if (!student) {
    return NextResponse.json({ ok: false, error: "Student not found" }, { status: 404 })
  }

  if (student.status !== "selected" && student.status !== "active") {
    return NextResponse.json(
      { ok: false, error: "Finish onboarding to start your mission." },
      { status: 403 }
    )
  }

  // First sync flips a "selected" ambassador into an "active" mission runner.
  if (student.status === "selected") {
    await Student.updateOne({ _id: studentId }, { status: "active" })
  }

  try {
    const { breakdown, lastSyncedAt } = await syncMissionStats(studentId, student.email)
    const rank = await getCollegeRankForStudent(studentId)
    return NextResponse.json({
      ok: true,
      breakdown,
      total: breakdown.total,
      lastSyncedAt,
      rank,
    })
  } catch (err) {
    console.error("[missions/sync] failed", err)
    return NextResponse.json(
      { ok: false, error: "Couldn't sync your stats. Try again later." },
      { status: 502 }
    )
  }
}
