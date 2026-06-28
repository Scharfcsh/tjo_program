import { redirect } from "next/navigation"

import { connectToDatabase } from "@/lib/db"
import { Student } from "@/lib/models/Student"
import { getStudentId } from "@/lib/session"
import { getLeaderboard, getStudentRank } from "@/lib/points"
import { rewardForRank } from "@/lib/missions-config"

import { Leaderboard } from "../Leaderboard"

export const dynamic = "force-dynamic"

export default async function LeaderboardPage() {
  const studentId = await getStudentId()
  if (!studentId) redirect("/portal/sign-in")

  await connectToDatabase()
  const student = await Student.findById(studentId).select("status").lean()
  if (!student) redirect("/portal/sign-in")
  if (student.status !== "selected" && student.status !== "active") {
    redirect("/onboarding")
  }

  const [leaderboard, rank] = await Promise.all([
    getLeaderboard(50),
    getStudentRank(studentId),
  ])
  const reward = rewardForRank(rank)

  return (
    <main className="mx-auto w-full max-w-4xl p-6">
      <header className="mb-6">
        <p className="text-xs font-medium tracking-wide text-primary uppercase">
          Leaderboard
        </p>
        <h1 className="text-xl font-semibold">
          {rank ? `You're ranked #${rank}` : "Sync your stats to get ranked"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {reward
            ? `Current projected reward: ${reward.reward} (${reward.label})`
            : "Climb into the top 10 to earn a reward."}
        </p>
      </header>

      <Leaderboard rows={leaderboard} currentStudentId={studentId} />
    </main>
  )
}
