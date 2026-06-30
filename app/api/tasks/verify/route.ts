import { NextResponse } from "next/server"

import { connectToDatabase } from "@/lib/db"
import { Student } from "@/lib/models/Student"
import { ONBOARDING_TASK_KEYS, type OnboardingTaskKey } from "@/lib/models/Onboarding"
import {
  getOrCreateOnboarding,
  maybeMarkSelected,
  serializeOnboarding,
} from "@/lib/onboarding-service"
import { getStudentId } from "@/lib/session"
import { getTopJobOfferApi, REFERRALS_REQUIRED } from "@/lib/topjoboffer-api"
import { appUrl } from "@/lib/urls"

export async function POST(request: Request) {
  const studentId = await getStudentId()
  if (!studentId) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const task = body?.task as OnboardingTaskKey | undefined
  if (!task || !ONBOARDING_TASK_KEYS.includes(task)) {
    return NextResponse.json({ ok: false, error: "Unknown task" }, { status: 400 })
  }
  await connectToDatabase()
  const student = await Student.findById(studentId)
  if (!student) {
    return NextResponse.json({ ok: false, error: "Student not found" }, { status: 404 })
  }

  const api = getTopJobOfferApi()
  let source = process.env.TJO_API_MODE === "live" ? "live" : "mock"

  let verified = false
  let detail: string | undefined
  let count: number | undefined
  let missing: string[] | undefined

  try {
    if (task === "accountCreated") {
      verified = (await api.verifyAccount(student.email)).exists
      detail = verified ? "Account found" : "No account found for your email"
    } else if (task === "profileCompleted") {
      const status = await api.getProfileStatus(student.email)
      verified = status.complete
      detail = verified
        ? "Profile complete"
        : status.percent != null
          ? `Profile ${status.percent}% complete`
          : "Profile is incomplete"
      missing = verified ? [] : status.missing
    } else if (task === "referrals") {
      count = await api.getReferralCount(student.referralCode)
      verified = count >= REFERRALS_REQUIRED
      detail = `${count}/${REFERRALS_REQUIRED} referrals`
    } else {
      // socialShared: self-confirmed (following our pages can't be auto-verified).
      verified = true
      detail = "Followed"
      source = "self"
    }
  } catch (err) {
    console.error("[tasks/verify] verification call failed", err)
    return NextResponse.json(
      { ok: false, error: "Verification service is unavailable. Try again later." },
      { status: 502 }
    )
  }

  const onboarding = await getOrCreateOnboarding(studentId)
  onboarding.set(task, {
    verified,
    verifiedAt: verified ? new Date() : undefined,
    source,
    detail,
    count,
    missing,
  })
  await onboarding.save()

  const view = serializeOnboarding(onboarding)

  // Becoming officially selected once every task is verified.
  const justSelected = await maybeMarkSelected(
    student,
    view,
    appUrl(request, "/dashboard")
  )

  return NextResponse.json({
    ok: true,
    verified,
    detail,
    onboarding: view,
    status: student.status,
    justSelected,
  })
}
