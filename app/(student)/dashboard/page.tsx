import { redirect } from "next/navigation"

import { connectToDatabase } from "@/lib/db"
import { Student } from "@/lib/models/Student"
import { Mission } from "@/lib/models/Mission"
import { Submission } from "@/lib/models/Submission"
import { getStudentId } from "@/lib/session"
import {
  getMissionBreakdownForStudent,
  getStudentRank,
  syncMissionStats,
} from "@/lib/points"
import { rewardForRank, SUBMISSION_TYPES, type SubmissionType } from "@/lib/missions-config"

import { DashboardClient, type SubmissionView } from "./DashboardClient"

export const dynamic = "force-dynamic"

const MISSION_DAYS = 30
const SYNC_STALE_MS = 5 * 60 * 1000

function daysLeft(selectedAt: Date | null | undefined): number {
  if (!selectedAt) return MISSION_DAYS
  const elapsed = Math.floor(
    (Date.now() - new Date(selectedAt).getTime()) / (1000 * 60 * 60 * 24)
  )
  return Math.max(0, MISSION_DAYS - elapsed)
}

export default async function DashboardPage() {
  const studentId = await getStudentId()
  if (!studentId) redirect("/portal/sign-in")

  await connectToDatabase()
  const student = await Student.findById(studentId)
    .select("name email status selectedAt")
    .lean()
  if (!student) redirect("/portal/sign-in")
  if (student.status !== "selected" && student.status !== "active") {
    redirect("/onboarding")
  }

  // Auto-refresh API-derived metrics when stale (don't block on API failure).
  const mission = await Mission.findOne({ studentId })
    .select("lastSyncedAt whatsappJoined")
    .lean()
  const stale =
    !mission?.lastSyncedAt ||
    Date.now() - new Date(mission.lastSyncedAt).getTime() > SYNC_STALE_MS
  if (stale) {
    try {
      await syncMissionStats(studentId, student.email)
    } catch (err) {
      console.error("[dashboard] auto-sync failed", err)
    }
  }

  const { breakdown, lastSyncedAt } = await getMissionBreakdownForStudent(studentId)
  const rank = await getStudentRank(studentId)
  const reward = rewardForRank(rank)

  const submissionDocs = await Submission.find({ studentId })
    .sort({ createdAt: -1 })
    .lean()
  const submissions = Object.fromEntries(
    SUBMISSION_TYPES.map((t) => [t, [] as SubmissionView[]])
  ) as Record<SubmissionType, SubmissionView[]>
  for (const s of submissionDocs) {
    submissions[s.type as SubmissionType].push({
      id: String(s._id),
      url: s.url,
      status: s.status,
      note: s.note ?? null,
      createdAt: new Date(s.createdAt).toISOString(),
    })
  }

  return (
    <main className="mx-auto w-full max-w-4xl p-6">
      <DashboardClient
        name={student.name}
        initialBreakdown={breakdown}
        initialRank={rank}
        initialReward={reward}
        daysLeft={daysLeft(student.selectedAt)}
        lastSyncedAt={lastSyncedAt ? lastSyncedAt.toISOString() : null}
        initialSubmissions={submissions}
        initialWhatsappJoined={Boolean(mission?.whatsappJoined)}
      />
    </main>
  )
}
