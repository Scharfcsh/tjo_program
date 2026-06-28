import { redirect } from "next/navigation"

import { connectToDatabase } from "@/lib/db"
import { Student } from "@/lib/models/Student"
import { getStudentId } from "@/lib/session"
import { getCollegeLeaderboard, getCollegeRankForStudent } from "@/lib/points"

import { Leaderboard } from "../Leaderboard"

export const dynamic = "force-dynamic"

export default async function LeaderboardPage() {
  const studentId = await getStudentId()
  if (!studentId) redirect("/portal/sign-in")

  await connectToDatabase()
  const student = await Student.findById(studentId).select("status college").lean()
  if (!student) redirect("/portal/sign-in")
  if (student.status !== "selected" && student.status !== "active") {
    redirect("/onboarding")
  }

  const [leaderboard, rank] = await Promise.all([
    getCollegeLeaderboard(student.college, 50),
    getCollegeRankForStudent(studentId),
  ])

  return (
    <main className="mx-auto w-full max-w-4xl p-6">
      <header className="mb-6">
        <p className="text-xs font-medium tracking-wide text-primary uppercase">
          {student.college} leaderboard
        </p>
        <h1 className="text-xl font-semibold">
          {rank ? `You're #${rank} at your college` : "Sync your stats to get ranked"}
        </h1>
        <p className="text-sm text-muted-foreground">
          See how your college&apos;s ambassadors are tracking toward their next reward.
        </p>
      </header>

      <Leaderboard rows={leaderboard} currentStudentId={studentId} />
    </main>
  )
}
