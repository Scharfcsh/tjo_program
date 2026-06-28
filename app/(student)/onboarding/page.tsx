import { redirect } from "next/navigation"

import { connectToDatabase } from "@/lib/db"
import { Student } from "@/lib/models/Student"
import { getStudentId } from "@/lib/session"
import {
  getOrCreateOnboarding,
  serializeOnboarding,
} from "@/lib/onboarding-service"

import { OnboardingTasks } from "./OnboardingTasks"

export const dynamic = "force-dynamic"

export default async function OnboardingPage() {
  const studentId = await getStudentId()
  if (!studentId) redirect("/portal/sign-in")

  await connectToDatabase()
  const student = await Student.findById(studentId)
    .select("name referralCode status")
    .lean()
  if (!student) redirect("/portal/sign-in")

  const onboarding = await getOrCreateOnboarding(studentId)
  const view = serializeOnboarding(onboarding)

  return (
    <main className="mx-auto w-full max-w-2xl p-6">
      <header className="mb-6">
        <p className="text-xs font-medium tracking-wide text-primary uppercase">
          Onboarding
        </p>
        <h1 className="text-xl font-semibold">Hi {student.name}, let&apos;s get you set up</h1>
        <p className="text-sm text-muted-foreground">
          Complete all four tasks to become an official ambassador and unlock
          your 30-day mission dashboard.
        </p>
      </header>

      <OnboardingTasks
        referralCode={student.referralCode}
        initial={view}
        initialSelected={student.status === "selected" || student.status === "active"}
      />
    </main>
  )
}
