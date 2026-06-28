import { NextResponse } from "next/server"

import { connectToDatabase } from "@/lib/db"
import { Student } from "@/lib/models/Student"
import { getOrCreateOnboarding, serializeOnboarding } from "@/lib/onboarding-service"
import { getStudentId } from "@/lib/session"
import { socialSubmissionSchema } from "@/lib/validation"

export async function POST(request: Request) {
  const studentId = await getStudentId()
  if (!studentId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const parsed = socialSubmissionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "Enter a valid post URL", issues: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  await connectToDatabase()
  const student = await Student.findById(studentId)
  if (!student) {
    return NextResponse.json({ ok: false, error: "Student not found" }, { status: 404 })
  }

  const onboarding = await getOrCreateOnboarding(studentId)
  onboarding.set("socialShared", {
    verified: false,
    verifiedAt: undefined,
    source: "self",
    detail: "Pending review",
    url: parsed.data.url,
    reviewStatus: "pending",
  })
  await onboarding.save()

  return NextResponse.json({
    ok: true,
    onboarding: serializeOnboarding(onboarding),
  })
}
