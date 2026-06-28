export const MISSION_KEYS = [
  "studentSignups",
  "paidPro",
  "paidPremium",
  "linkedinPosts",
  "whatsappPromotions",
  "reviews",
] as const

export type MissionKey = (typeof MISSION_KEYS)[number]

/** Manual-submission categories that students submit and admins approve. */
export const SUBMISSION_TYPES = ["linkedin", "whatsapp_promo", "review"] as const

export type SubmissionType = (typeof SUBMISSION_TYPES)[number]

/** Which mission each approved submission type counts toward. */
export const missionKeyForSubmissionType: Record<SubmissionType, MissionKey> = {
  linkedin: "linkedinPosts",
  whatsapp_promo: "whatsappPromotions",
  review: "reviews",
}

export type MissionDef = {
  key: MissionKey
  title: string
  description: string
  unit: string
  /** Points awarded per unit completed. */
  pointsPer: number
  /** Target used for the progress bar over the 30-day mission. */
  goal: number
  /** Optional grouping label for nested sub-tiers (e.g. paid subscriptions). */
  group?: string
  /**
   * How the count is sourced:
   * - "api": synced from the main-app referrals endpoint.
   * - "submission": student submits proof, admin approves; each approval = +1.
   */
  kind: "api" | "submission"
  /** For kind === "submission": the submission category that feeds this mission. */
  submissionType?: SubmissionType
}

export const MISSIONS: MissionDef[] = [
  {
    key: "studentSignups",
    title: "Student sign-ups",
    description: "Students who join TopJobOffer through your referral link.",
    unit: "sign-ups",
    pointsPer: 10,
    goal: 50,
    kind: "api",
  },
  {
    key: "paidPro",
    title: "Pro subscriptions",
    description: "Referred users who upgrade to a Pro plan.",
    unit: "Pro subs",
    pointsPer: 50,
    goal: 10,
    group: "Paid subscriptions",
    kind: "api",
  },
  {
    key: "paidPremium",
    title: "Premium subscriptions",
    description: "Referred users who upgrade to a Premium plan.",
    unit: "Premium subs",
    pointsPer: 100,
    goal: 5,
    group: "Paid subscriptions",
    kind: "api",
  },
  {
    key: "linkedinPosts",
    title: "LinkedIn posts",
    description: "Posts about TopJobOffer shared on LinkedIn. Submit the post link.",
    unit: "posts",
    pointsPer: 15,
    goal: 10,
    kind: "submission",
    submissionType: "linkedin",
  },
  {
    key: "whatsappPromotions",
    title: "WhatsApp promotions",
    description:
      "Share the message below in your WhatsApp groups, then submit a screenshot link.",
    unit: "promotions",
    pointsPer: 8,
    goal: 15,
    kind: "submission",
    submissionType: "whatsapp_promo",
  },
  {
    key: "reviews",
    title: "Reviews",
    description:
      "Genuine reviews for TopJobOffer (ProductHunt, app stores, etc.). Submit the review link.",
    unit: "reviews",
    pointsPer: 20,
    goal: 5,
    kind: "submission",
    submissionType: "review",
  },
]

/** Invite link for the official ambassador WhatsApp group (one-time join task). */
export const WHATSAPP_GROUP_URL =
  process.env.NEXT_PUBLIC_WHATSAPP_GROUP_URL ?? "https://chat.whatsapp.com/"

/** Copy-paste promo message students share in their WhatsApp groups. */
export const WHATSAPP_MESSAGE_TEMPLATE =
  "🚀 Land your dream job with TopJobOffer! I'm a Student Ambassador and I can get you " +
  "early access + perks. Sign up here: https://topjoboffer.com — DM me if you have questions!"

export type RewardMilestone = { points: number; reward: string }

/** Points milestones every ambassador can unlock (independent of rank). */
export const REWARD_MILESTONES: RewardMilestone[] = [
  { points: 500, reward: "Free Pro plan" },
  { points: 1000, reward: "Premium plan" },
  { points: 1500, reward: "Hoodies & swag" },
  { points: 2000, reward: "₹10,000 cash prize" },
]

/** The next milestone not yet reached, or null if all are unlocked. */
export function nextMilestone(points: number): RewardMilestone | null {
  return REWARD_MILESTONES.find((m) => points < m.points) ?? null
}

/** The best milestone already reached, or null if none yet. */
export function unlockedReward(points: number): RewardMilestone | null {
  let best: RewardMilestone | null = null
  for (const m of REWARD_MILESTONES) {
    if (points >= m.points) best = m
  }
  return best
}

/** Progress toward the next milestone (from the previous threshold). */
export function milestoneProgress(points: number): {
  next: RewardMilestone | null
  remaining: number
  pct: number
} {
  const next = nextMilestone(points)
  if (!next) return { next: null, remaining: 0, pct: 100 }
  const prevThreshold = unlockedReward(points)?.points ?? 0
  const span = next.points - prevThreshold
  const pct = span > 0 ? Math.min(100, ((points - prevThreshold) / span) * 100) : 0
  return { next, remaining: next.points - points, pct }
}
