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

export type RewardTier = {
  position: string
  label: string
  reward: string
  /** Inclusive rank range this tier covers (1-based). */
  from: number
  to: number
}

export const REWARD_TIERS: RewardTier[] = [
  { position: "1st", label: "Champion", reward: "Cash prize + iPad", from: 1, to: 1 },
  { position: "2nd–3rd", label: "Runner-up", reward: "Premium plan + hoodie", from: 2, to: 3 },
  { position: "4th–10th", label: "Top 10", reward: "Pro plan + swag", from: 4, to: 10 },
]

export function rewardForRank(rank: number | null): RewardTier | null {
  if (!rank) return null
  return REWARD_TIERS.find((t) => rank >= t.from && rank <= t.to) ?? null
}
