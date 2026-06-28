import { z } from "zod"

import { SUBMISSION_TYPES } from "./missions-config"

export const SEMESTERS = [
  "1st",
  "2nd",
  "3rd",
  "4th",
  "5th",
  "6th",
  "7th",
  "8th",
  "Graduated",
] as const

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Please enter your full name").max(100),
  college: z.string().trim().min(2, "Please enter your college").max(150),
  mobile: z
    .string()
    .trim()
    .regex(/^[0-9+\-\s]{7,15}$/, "Enter a valid mobile number"),
  email: z.email("Enter a valid email").trim().toLowerCase(),
  semester: z.enum(SEMESTERS),
})

export type RegisterInput = z.infer<typeof registerSchema>

export const socialSubmissionSchema = z.object({
  url: z.url("Enter a valid post URL"),
})

export type SocialSubmissionInput = z.infer<typeof socialSubmissionSchema>

export const submissionSchema = z.object({
  type: z.enum(SUBMISSION_TYPES),
  url: z.url("Enter a valid link"),
})

export type SubmissionInput = z.infer<typeof submissionSchema>

export const REFERRAL_PLANS = ["free", "pro", "premium"] as const
export type ReferralPlan = (typeof REFERRAL_PLANS)[number]

export const referralEntrySchema = z.object({
  name: z.string().trim().min(1, "Name required").max(80),
  email: z.string().trim().max(120),
  plan: z.enum(REFERRAL_PLANS),
  joinedAt: z.coerce.date(),
  earned: z.coerce.number().min(0),
})

export const referralsSchema = z.object({
  referrals: z.array(referralEntrySchema).max(200),
})

export type ReferralEntryInput = z.infer<typeof referralEntrySchema>

export const showcaseSchema = z.object({
  displayName: z.string().trim().min(1, "Enter a display name").max(80),
  referralLink: z.string().trim().max(300),
  rank: z.coerce.number().int().min(0).max(1_000_000),
  totalEarned: z.coerce.number().min(0),
  monthEarned: z.coerce.number().min(0),
  totalReferrals: z.coerce.number().int().min(0),
  proSubs: z.coerce.number().int().min(0),
  premiumSubs: z.coerce.number().int().min(0),
})

export type ShowcaseInput = z.infer<typeof showcaseSchema>
