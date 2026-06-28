import type { HydratedDocument } from "mongoose"

import { Mission, type MissionDoc } from "./models/Mission"
import { Student } from "./models/Student"
import { PointsLedger } from "./models/PointsLedger"
import { Submission } from "./models/Submission"
import {
  MISSIONS,
  SUBMISSION_TYPES,
  type MissionKey,
  type SubmissionType,
} from "./missions-config"
import { getTopJobOfferApi, type ReferralStats } from "./topjoboffer-api"

type MissionDocument = HydratedDocument<MissionDoc>

export type MissionRow = {
  key: MissionKey
  title: string
  description: string
  unit: string
  group: string | null
  count: number
  points: number
  goal: number
}

export type MissionBreakdown = {
  rows: MissionRow[]
  total: number
}

export function breakdownFromCounts(
  counts: Record<MissionKey, number>
): MissionBreakdown {
  let total = 0
  const rows = MISSIONS.map((m) => {
    const count = counts[m.key] ?? 0
    const points = count * m.pointsPer
    total += points
    return {
      key: m.key,
      title: m.title,
      description: m.description,
      unit: m.unit,
      group: m.group ?? null,
      count,
      points,
      goal: m.goal,
    }
  })
  return { rows, total }
}

/** Count approved submissions per type for a student (single aggregate). */
export async function countApprovedSubmissions(
  studentId: string
): Promise<Record<SubmissionType, number>> {
  const rows = await Submission.aggregate<{ _id: SubmissionType; n: number }>([
    { $match: { studentId: toObjectId(studentId), status: "approved" } },
    { $group: { _id: "$type", n: { $sum: 1 } } },
  ])
  const counts = Object.fromEntries(
    SUBMISSION_TYPES.map((t) => [t, 0])
  ) as Record<SubmissionType, number>
  for (const r of rows) counts[r._id] = r.n
  return counts
}

function buildCounts(
  api: { count: number; pro: number; premium: number },
  submissions: Record<SubmissionType, number>
): Record<MissionKey, number> {
  return {
    studentSignups: api.count,
    paidPro: api.pro,
    paidPremium: api.premium,
    linkedinPosts: submissions.linkedin,
    whatsappPromotions: submissions.whatsapp_promo,
    reviews: submissions.review,
  }
}

/**
 * Diff the new counts against the mission's stored stats, append a ledger entry
 * for every mission whose count changed, update stats + pointsTotal on the doc
 * (not yet saved), and return the breakdown + pending ledger entries.
 */
function applyCounts(
  mission: MissionDocument,
  counts: Record<MissionKey, number>
) {
  const prev = mission.stats as Record<MissionKey, number> | undefined
  const ledgerEntries: {
    studentId: unknown
    missionKey: MissionKey
    delta: number
    reason: string
  }[] = []

  for (const m of MISSIONS) {
    const before = Number(prev?.[m.key] ?? 0)
    const after = counts[m.key] ?? 0
    if (after !== before) {
      ledgerEntries.push({
        studentId: mission.studentId,
        missionKey: m.key,
        delta: (after - before) * m.pointsPer,
        reason: `${m.title}: ${before} → ${after}`,
      })
    }
    ;(mission.stats as Record<MissionKey, number>)[m.key] = after
  }

  const breakdown = breakdownFromCounts(counts)
  mission.pointsTotal = breakdown.total
  mission.markModified("stats")
  return { breakdown, ledgerEntries }
}

/**
 * Pull fresh API metrics (referrals) + approved-submission counts, recompute
 * points, write ledger deltas, and persist. Used by the on-demand sync and the
 * dashboard's staleness refresh.
 */
export async function syncMissionStats(
  studentId: string,
  email: string
): Promise<{ breakdown: MissionBreakdown; lastSyncedAt: Date }> {
  const [apiStats, submissions] = await Promise.all([
    getTopJobOfferApi().getReferralStats(email),
    countApprovedSubmissions(studentId),
  ])
  const counts = buildCounts(apiStats, submissions)

  const mission =
    (await Mission.findOne({ studentId })) ?? new Mission({ studentId })
  const { breakdown, ledgerEntries } = applyCounts(mission, counts)
  mission.lastSyncedAt = new Date()
  await mission.save()
  if (ledgerEntries.length > 0) await PointsLedger.insertMany(ledgerEntries)

  return { breakdown, lastSyncedAt: mission.lastSyncedAt }
}

/**
 * Recompute points from the *stored* API metrics + fresh approved-submission
 * counts (no external API call). Called right after an admin approves/rejects a
 * submission so the leaderboard/rank update immediately.
 */
export async function recomputeManual(
  studentId: string
): Promise<MissionBreakdown> {
  const submissions = await countApprovedSubmissions(studentId)
  const mission =
    (await Mission.findOne({ studentId })) ?? new Mission({ studentId })
  const stored = mission.stats as Record<MissionKey, number> | undefined
  const counts = buildCounts(
    {
      count: Number(stored?.studentSignups ?? 0),
      pro: Number(stored?.paidPro ?? 0),
      premium: Number(stored?.paidPremium ?? 0),
    },
    submissions
  )

  const { breakdown, ledgerEntries } = applyCounts(mission, counts)
  await mission.save()
  if (ledgerEntries.length > 0) await PointsLedger.insertMany(ledgerEntries)
  return breakdown
}

export async function getMissionBreakdownForStudent(
  studentId: string
): Promise<{ breakdown: MissionBreakdown; lastSyncedAt: Date | null }> {
  const mission = await Mission.findOne({ studentId }).lean()
  const stats = (mission?.stats ?? {}) as Partial<Record<MissionKey, number>>
  const counts = Object.fromEntries(
    MISSIONS.map((m) => [m.key, Number(stats[m.key] ?? 0)])
  ) as Record<MissionKey, number>
  return {
    breakdown: breakdownFromCounts(counts),
    lastSyncedAt: mission?.lastSyncedAt ? new Date(mission.lastSyncedAt) : null,
  }
}

export type LeaderboardRow = {
  rank: number
  studentId: string
  name: string
  college: string
  points: number
}

/** Leaderboard scoped to a single college, ranked by points within that cohort. */
export async function getCollegeLeaderboard(
  college: string,
  limit = 50
): Promise<LeaderboardRow[]> {
  const rows = await Mission.aggregate<{
    studentId: unknown
    points: number
    name: string
    college: string
  }>([
    {
      $lookup: {
        from: "students",
        localField: "studentId",
        foreignField: "_id",
        as: "student",
      },
    },
    { $unwind: "$student" },
    { $match: { "student.college": college } },
    { $sort: { pointsTotal: -1, updatedAt: 1 } },
    { $limit: limit },
    {
      $project: {
        _id: 0,
        studentId: "$studentId",
        points: "$pointsTotal",
        name: "$student.name",
        college: "$student.college",
      },
    },
  ])

  return rows.map((r, i) => ({
    rank: i + 1,
    studentId: String(r.studentId),
    name: r.name,
    college: r.college,
    points: r.points,
  }))
}

/** The student's rank among ambassadors from their own college. */
export async function getCollegeRankForStudent(
  studentId: string
): Promise<number | null> {
  const [student, mine] = await Promise.all([
    Student.findById(studentId).select("college").lean(),
    Mission.findOne({ studentId }).select("pointsTotal").lean(),
  ])
  if (!student || !mine) return null

  const higher = await Mission.aggregate<{ n: number }>([
    { $match: { pointsTotal: { $gt: mine.pointsTotal } } },
    {
      $lookup: {
        from: "students",
        localField: "studentId",
        foreignField: "_id",
        as: "student",
      },
    },
    { $unwind: "$student" },
    { $match: { "student.college": student.college } },
    { $count: "n" },
  ])

  return (higher[0]?.n ?? 0) + 1
}

function toObjectId(id: string) {
  // Mission/Submission studentId is an ObjectId; aggregate $match needs the
  // ObjectId form. Mongoose exposes the constructor via the model's base.
  return new Mission.base.Types.ObjectId(id)
}
