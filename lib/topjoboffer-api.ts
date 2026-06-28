/**
 * Client for the TopJobOffer main-app verification API.
 *
 * Runs in `mock` mode by default (deterministic fixtures derived from the input)
 * so the portal is fully buildable/demoable without the real service. Set
 * `TJO_API_MODE=live` plus `TJO_API_BASE_URL` + `AMBASSADOR_API_KEY` to call the
 * real endpoints — the calling code does not change.
 *
 * The live API exposes three endpoints (auth via `x-api-key`):
 *   GET /ambassadors/verify-account?email=
 *   GET /ambassadors/profile-status?email=
 *   GET /ambassadors/referrals?email=   (also accepts ?code= as an alias)
 */

export type ReferralStats = {
  /** Total referrals (= student sign-ups). */
  count: number
  /** Referees currently on a Pro plan. */
  pro: number
  /** Referees currently on a Premium plan. */
  premium: number
  /** ₹ earned from paid referral rewards. */
  totalEarned: number
}

type ReferralsResponse = {
  exists: boolean
  count: number
  totalEarned: number
  referrals?: { plan?: string; paymentStatus?: string }[]
}

export interface TopJobOfferApi {
  verifyAccount(email: string): Promise<{ exists: boolean }>
  getProfileStatus(email: string): Promise<{ complete: boolean }>
  getReferralCount(referralCode: string): Promise<number>
  getReferralStats(email: string): Promise<ReferralStats>
}

/** Small stable hash so mock results are deterministic per input. */
function hash(input: string): number {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return Math.abs(h)
}

const mockApi: TopJobOfferApi = {
  async verifyAccount() {
    return { exists: true }
  },
  async getProfileStatus() {
    return { complete: true }
  },
  async getReferralCount(referralCode) {
    // Always clears the threshold, but varies per code for realism.
    return 10 + (hash(referralCode) % 6)
  },
  async getReferralStats(email) {
    const h = hash(email)
    const count = 10 + (h % 30)
    const pro = h % 8
    const premium = h % 4
    return { count, pro, premium, totalEarned: pro * 200 + premium * 500 }
  },
}

function liveApi(): TopJobOfferApi {
  const baseUrl = process.env.TJO_API_BASE_URL
  const apiKey = process.env.AMBASSADOR_API_KEY
  if (!baseUrl) {
    throw new Error("TJO_API_MODE=live requires TJO_API_BASE_URL to be set.")
  }
  const root = baseUrl.replace(/\/$/, "")

  async function get<T>(path: string): Promise<T> {
    const res = await fetch(`${root}${path}`, {
      headers: apiKey ? { "x-api-key": apiKey } : undefined,
      cache: "no-store",
    })
    if (!res.ok) {
      throw new Error(`TopJobOffer API ${path} failed: ${res.status}`)
    }
    return (await res.json()) as T
  }

  return {
    verifyAccount: (email) =>
      get(`/ambassadors/verify-account?email=${encodeURIComponent(email)}`),
    getProfileStatus: (email) =>
      get(`/ambassadors/profile-status?email=${encodeURIComponent(email)}`),
    getReferralCount: async (referralCode) => {
      const { count } = await get<{ count: number }>(
        `/ambassadors/referrals?code=${encodeURIComponent(referralCode)}`
      )
      return count
    },
    getReferralStats: async (email) => {
      const data = await get<ReferralsResponse>(
        `/ambassadors/referrals?email=${encodeURIComponent(email)}`
      )
      const referrals = data.referrals ?? []
      const pro = referrals.filter((r) => r.plan === "PRO").length
      const premium = referrals.filter((r) => r.plan === "PREMIUM").length
      return {
        count: data.count ?? referrals.length,
        pro,
        premium,
        totalEarned: data.totalEarned ?? 0,
      }
    },
  }
}

export function getTopJobOfferApi(): TopJobOfferApi {
  return process.env.TJO_API_MODE === "live" ? liveApi() : mockApi
}

export const REFERRALS_REQUIRED = 10
