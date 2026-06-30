import { createElement } from "react"
import type { HydratedDocument } from "mongoose"

import {
  Onboarding,
  ONBOARDING_TASK_KEYS,
  type OnboardingDoc,
  type OnboardingTaskKey,
} from "./models/Onboarding"
import type { StudentDoc } from "./models/Student"
import { sendEmail } from "./email/client"
import { SelectedEmail } from "./email/Selected"

type OnboardingDocument = HydratedDocument<OnboardingDoc>
type StudentDocument = HydratedDocument<StudentDoc>

export type ReviewStatus = "pending" | "approved" | "rejected"

export type TaskView = {
  verified: boolean
  verifiedAt: string | null
  detail: string | null
  count: number | null
  missing: string[]
  url: string | null
  reviewStatus: ReviewStatus | null
}

export type OnboardingView = Record<OnboardingTaskKey, TaskView> & {
  allComplete: boolean
}

export async function getOrCreateOnboarding(
  studentId: string
): Promise<OnboardingDocument> {
  const existing = await Onboarding.findOne({ studentId })
  if (existing) return existing
  return Onboarding.create({ studentId })
}

export function serializeOnboarding(doc: OnboardingDocument): OnboardingView {
  const view = {} as OnboardingView
  let allComplete = true
  for (const key of ONBOARDING_TASK_KEYS) {
    const slot = doc[key]
    const verified = Boolean(slot?.verified)
    if (!verified) allComplete = false
    view[key] = {
      verified,
      verifiedAt: slot?.verifiedAt ? new Date(slot.verifiedAt).toISOString() : null,
      detail: slot?.detail ?? null,
      count: typeof slot?.count === "number" ? slot.count : null,
      missing: Array.isArray(slot?.missing) ? (slot.missing as string[]) : [],
      url: slot?.url ?? null,
      reviewStatus: (slot?.reviewStatus as ReviewStatus | undefined) ?? null,
    }
  }
  view.allComplete = allComplete
  return view
}

/**
 * Promotes a student to "selected" the first time all onboarding tasks are
 * complete, sending the welcome email. Safe to call repeatedly — it no-ops once
 * the student is already selected/active. Shared by the auto-verify route and
 * the admin social-approval route, since either can complete onboarding.
 *
 * Returns true only on the transition (so callers can surface a one-time UI).
 */
export async function maybeMarkSelected(
  student: StudentDocument,
  view: OnboardingView,
  dashboardUrl: string
): Promise<boolean> {
  if (!view.allComplete) return false
  if (student.status === "selected" || student.status === "active") return false

  student.status = "selected"
  student.selectedAt = new Date()
  await student.save()

  try {
    await sendEmail({
      to: student.email,
      subject: "You're officially a TopJobOffer Ambassador!",
      react: createElement(SelectedEmail, { name: student.name, dashboardUrl }),
    })
  } catch (err) {
    console.error("[onboarding] selected email failed", err)
  }

  return true
}
