import { REFERRALS_REQUIRED } from "./topjoboffer-api"
import type { OnboardingTaskKey } from "./models/Onboarding"

export type OnboardingTaskDef = {
  key: OnboardingTaskKey
  title: string
  description: string
  /**
   * How the task is completed:
   * - "auto": verified against the main-app API (default).
   * - "submission": student submits a URL that an admin manually approves.
   */
  kind?: "auto" | "submission"
  /** Visible call-to-action that helps the student complete the task. */
  cta?: { label: string; href: (ctx: { referralCode: string }) => string }
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
      label: "Copy your referral link",
      href: ({ referralCode }) =>
        `https://topjoboffer.com/?ref=${encodeURIComponent(referralCode)}`,
    },
  },
  {
    key: "socialShared",
    title: "Share on social media",
    description:
      "Post about TopJobOffer on LinkedIn, Twitter/X, or WhatsApp, then paste the link to your post for review.",
    kind: "submission",
  },
]
