import { NextResponse } from "next/server"

import { connectToDatabase } from "@/lib/db"
import { Student } from "@/lib/models/Student"
import { Submission } from "@/lib/models/Submission"
import { getStudentId } from "@/lib/session"
import { submissionSchema } from "@/lib/validation"

export async function POST(request: Request) {
  const studentId = await getStudentId()
  if (!studentId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const parsed = submissionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Enter a valid link", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  await connectToDatabase()
  const student = await Student.findById(studentId).select("status").lean()
  if (!student) {
    return NextResponse.json({ ok: false, error: "Student not found" }, { status: 404 })
  }
  if (student.status !== "selected" && student.status !== "active") {
    return NextResponse.json(
      { ok: false, error: "Finish onboarding before submitting missions." },
      { status: 403 }
    )
  }

  const submission = await Submission.create({
    studentId,
    type: parsed.data.type,
    url: parsed.data.url,
  })

  return NextResponse.json({
    ok: true,
    submission: {
      id: String(submission._id),
      type: submission.type,
      url: submission.url,
      status: submission.status,
      createdAt: submission.createdAt.toISOString(),
    },
  })
}
