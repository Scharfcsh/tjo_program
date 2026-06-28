import { NextResponse } from "next/server"
import { isValidObjectId } from "mongoose"

import { connectToDatabase } from "@/lib/db"
import { Student } from "@/lib/models/Student"
import {
  getOrCreateOnboarding,
  maybeMarkSelected,
  serializeOnboarding,
} from "@/lib/onboarding-service"
import { isAdmin } from "@/lib/session"
import { appUrl } from "@/lib/urls"

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

  await connectToDatabase()
  const student = await Student.findById(id)
  if (!student) {
    return NextResponse.json({ ok: false, error: "Student not found" }, { status: 404 })
  }

  const onboarding = await getOrCreateOnboarding(id)
  if (onboarding.socialShared?.reviewStatus !== "pending") {
    return NextResponse.json(
      { ok: false, error: "No social post awaiting review." },
      { status: 409 }
    )
  }

  if (decision === "approve") {
    onboarding.set("socialShared.verified", true)
    onboarding.set("socialShared.verifiedAt", new Date())
    onboarding.set("socialShared.reviewStatus", "approved")
    onboarding.set("socialShared.detail", "Approved")
  } else {
    onboarding.set("socialShared.verified", false)
    onboarding.set("socialShared.verifiedAt", undefined)
    onboarding.set("socialShared.reviewStatus", "rejected")
    onboarding.set("socialShared.detail", "Rejected")
  }
  await onboarding.save()

  const view = serializeOnboarding(onboarding)
  const justSelected =
    decision === "approve"
      ? await maybeMarkSelected(student, view, appUrl(request, "/dashboard"))
      : false

  return NextResponse.json({ ok: true, status: student.status, justSelected })
}
