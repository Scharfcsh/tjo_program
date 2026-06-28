import { NextResponse } from "next/server"
import { isValidObjectId } from "mongoose"

import { connectToDatabase } from "@/lib/db"
import { Submission } from "@/lib/models/Submission"
import { recomputeManual } from "@/lib/points"
import { isAdmin } from "@/lib/session"

const DECISIONS = ["approve", "reject"] as const
type Decision = (typeof DECISIONS)[number]

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  if (!isValidObjectId(id)) {
    return NextResponse.json({ ok: false, error: "Invalid id" }, { status: 400 })
  }

  const body = await request.json().catch(() => ({}))
  const decision = body?.decision as Decision | undefined
  if (!decision || !DECISIONS.includes(decision)) {
    return NextResponse.json({ ok: false, error: "Unknown decision" }, { status: 400 })
  }
  const note = typeof body?.note === "string" ? body.note.trim() : undefined

  await connectToDatabase()
  const submission = await Submission.findById(id)
  if (!submission) {
    return NextResponse.json({ ok: false, error: "Submission not found" }, { status: 404 })
  }

  submission.status = decision === "approve" ? "approved" : "rejected"
  submission.reviewedAt = new Date()
  if (note) submission.note = note
  await submission.save()

  // Recompute the student's points so the leaderboard/rank update immediately.
  await recomputeManual(String(submission.studentId))

  return NextResponse.json({ ok: true, status: submission.status })
}
