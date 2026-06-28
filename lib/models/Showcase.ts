import mongoose, { Schema, type InferSchemaType, type Model } from "mongoose"

import { REFERRAL_PLANS } from "../validation"

export type ReferralPlan = (typeof REFERRAL_PLANS)[number]

/**
 * Singleton holding fabricated "marketing stunt" earnings numbers, set by an
 * admin and rendered on an isolated showcase dashboard. Intentionally separate
 * from Student/Mission data — it must never read or affect real ambassador stats.
 */
const referralSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, default: "" },
    plan: { type: String, enum: REFERRAL_PLANS, default: "free" },
    joinedAt: { type: Date, default: Date.now },
    earned: { type: Number, default: 0 },
  },
  { _id: false }
)

const showcaseSchema = new Schema(
  {
    key: { type: String, unique: true, default: "main" },
    displayName: { type: String, default: "" },
    referralLink: { type: String, default: "" },
    rank: { type: Number, default: 0 },
    totalEarned: { type: Number, default: 0 },
    monthEarned: { type: Number, default: 0 },
    totalReferrals: { type: Number, default: 0 },
    proSubs: { type: Number, default: 0 },
    premiumSubs: { type: Number, default: 0 },
    referrals: { type: [referralSchema], default: undefined },
  },
  { timestamps: true }
)

export type ShowcaseDoc = InferSchemaType<typeof showcaseSchema> & {
  _id: mongoose.Types.ObjectId
}

export const Showcase: Model<ShowcaseDoc> =
  (mongoose.models.Showcase as Model<ShowcaseDoc>) ||
  mongoose.model<ShowcaseDoc>("Showcase", showcaseSchema)

export type ReferralEntry = {
  name: string
  email: string
  plan: ReferralPlan
  joinedAt: Date
  earned: number
}

export type ShowcaseValues = {
  displayName: string
  referralLink: string
  rank: number
  totalEarned: number
  monthEarned: number
  totalReferrals: number
  proSubs: number
  premiumSubs: number
  referrals: ReferralEntry[]
}

/** `n` days ago — keeps seed "joined" dates looking recent. */
function daysAgo(n: number): Date {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000)
}

/** Default referral list so the showcase table is populated out of the box. */
const SEED_REFERRALS: ReferralEntry[] = [
  { name: "Aarav Sharma", email: "aarav.sharma@gmail.com", plan: "premium", joinedAt: daysAgo(2), earned: 500 },
  { name: "Diya Patel", email: "diya.patel@gmail.com", plan: "pro", joinedAt: daysAgo(3), earned: 200 },
  { name: "Rohan Mehta", email: "rohan.mehta@outlook.com", plan: "free", joinedAt: daysAgo(4), earned: 0 },
  { name: "Ananya Iyer", email: "ananya.iyer@gmail.com", plan: "premium", joinedAt: daysAgo(6), earned: 500 },
  { name: "Kabir Singh", email: "kabir.singh@gmail.com", plan: "pro", joinedAt: daysAgo(8), earned: 200 },
  { name: "Ishaan Gupta", email: "ishaan.g@yahoo.com", plan: "free", joinedAt: daysAgo(9), earned: 0 },
  { name: "Saanvi Reddy", email: "saanvi.reddy@gmail.com", plan: "pro", joinedAt: daysAgo(11), earned: 200 },
  { name: "Vivaan Nair", email: "vivaan.nair@gmail.com", plan: "premium", joinedAt: daysAgo(13), earned: 500 },
  { name: "Aditya Rao", email: "aditya.rao@outlook.com", plan: "free", joinedAt: daysAgo(15), earned: 0 },
  { name: "Myra Joshi", email: "myra.joshi@gmail.com", plan: "pro", joinedAt: daysAgo(18), earned: 200 },
  { name: "Arjun Verma", email: "arjun.verma@gmail.com", plan: "free", joinedAt: daysAgo(21), earned: 0 },
  { name: "Sara Khan", email: "sara.khan@gmail.com", plan: "premium", joinedAt: daysAgo(25), earned: 500 },
]

const EMPTY: ShowcaseValues = {
  displayName: "Aman Adhikari",
  referralLink: "https://topjoboffer.com/sign-up?ref=AMAN500",
  rank: 1,
  totalEarned: 96000,
  monthEarned: 24000,
  totalReferrals: 128,
  proSubs: 34,
  premiumSubs: 12,
  referrals: SEED_REFERRALS,
}

/**
 * Read the singleton, returning seeded defaults when it doesn't exist yet (so
 * the dashboard always shows realistic data for screenshots).
 */
export async function getShowcase(): Promise<ShowcaseValues> {
  const doc = await Showcase.findOne({ key: "main" }).lean()
  if (!doc) return { ...EMPTY }

  const referrals =
    doc.referrals && doc.referrals.length > 0
      ? doc.referrals.map((r) => ({
          name: r.name,
          email: r.email ?? "",
          plan: (r.plan ?? "free") as ReferralPlan,
          joinedAt: r.joinedAt ? new Date(r.joinedAt) : new Date(),
          earned: r.earned ?? 0,
        }))
      : SEED_REFERRALS

  return {
    displayName: doc.displayName ?? "",
    referralLink: doc.referralLink || EMPTY.referralLink,
    rank: doc.rank ?? 0,
    totalEarned: doc.totalEarned ?? 0,
    monthEarned: doc.monthEarned ?? 0,
    totalReferrals: doc.totalReferrals ?? 0,
    proSubs: doc.proSubs ?? 0,
    premiumSubs: doc.premiumSubs ?? 0,
    referrals,
  }
}
