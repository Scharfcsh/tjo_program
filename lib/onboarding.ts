import { REFERRALS_REQUIRED } from "./topjoboffer-api"
import type { OnboardingTaskKey } from "./models/Onboarding"

/** Official TopJobOffer social pages (env-configurable). */
export const SOCIAL_LINKS: { label: string; href: string }[] = [
  {
    label: "LinkedIn",
    href:
      process.env.NEXT_PUBLIC_TJO_LINKEDIN_URL ??
      "https://www.linkedin.com/company/top-job-offer/",
  },
  {
    label: "X (Twitter)",
    href: process.env.NEXT_PUBLIC_TJO_TWITTER_URL ?? "https://x.com/topjoboffer",
  },
  {
    label: "Instagram",
    href:
      process.env.NEXT_PUBLIC_TJO_INSTAGRAM_URL ??
      "https://www.instagram.com/topjob.offer",
  },
]

export type OnboardingTaskDef = {
  key: OnboardingTaskKey
  title: string
  description: string
  /**
   * How the task is completed:
   * - "auto": verified against the main-app API (default).
   * - "follow": student opens the linked pages, then self-confirms.
   */
  kind?: "auto" | "follow"
  /** Visible call-to-action that helps the student complete the task. */
  cta?: { label: string; href: (ctx: { referralCode: string }) => string }
  /** External links to open (used by "follow" tasks). */
  links?: { label: string; href: string }[]
}

export const ONBOARDING_TASKS: OnboardingTaskDef[] = [
  {
    key: "accountCreated",
    title: "Create your TopJobOffer account",
    description: "Sign up on topjoboffer.com using this same email address.",
    cta: { label: "Open topjoboffer.com", href: () => "https://topjoboffer.com" },
  },
  {
    key: "profileCompleted",
    title: "Complete your profile",
    description: "Fill out your TopJobOffer profile so it's 100% complete.",
    cta: {
      label: "Go to your profile",
      href: () => "https://topjoboffer.com/profile",
    },
  },
  {
    key: "referrals",
    title: `Refer ${REFERRALS_REQUIRED} friends`,
    description: `Share your referral link and get at least ${REFERRALS_REQUIRED} friends to sign up.`,
    cta: {
      label: "Copy your referral link from the portal",
      href: ({ referralCode }) =>
        `https://topjoboffer.com/invite-earn`,
    },
  },
  {
    key: "socialShared",
    title: "Follow us on social media",
    description:
      "Follow TopJobOffer on LinkedIn, X (Twitter) and Instagram to stay in the loop.",
    kind: "follow",
    links: SOCIAL_LINKS,
  },
]
