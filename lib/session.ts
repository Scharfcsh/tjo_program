import { cookies } from "next/headers"

import {
  ADMIN_COOKIE,
  STUDENT_COOKIE,
  verifyAdminToken,
  verifyStudentSession,
} from "./auth"

/**
 * Server-side cookie helpers (read in Server Components, set/clear in Route
 * Handlers or Server Functions). These wrap the pure token helpers in
 * `lib/auth.ts` with the async `cookies()` API from Next 16.
 */

const DAY = 60 * 60 * 24

const baseCookie = {
  httpOnly: true,
  sameSite: "lax" as const,
  path: "/",
  secure: process.env.NODE_ENV === "production",
}

export async function isAdmin(): Promise<boolean> {
  const store = await cookies()
  return (await verifyAdminToken(store.get(ADMIN_COOKIE)?.value)) !== null
}

export async function getStudentId(): Promise<string | null> {
  const store = await cookies()
  const session = await verifyStudentSession(store.get(STUDENT_COOKIE)?.value)
  return session?.sub ?? null
}

export async function setAdminCookie(token: string): Promise<void> {
  const store = await cookies()
  store.set(ADMIN_COOKIE, token, { ...baseCookie, maxAge: 7 * DAY })
}

export async function setStudentCookie(token: string): Promise<void> {
  const store = await cookies()
  store.set(STUDENT_COOKIE, token, { ...baseCookie, maxAge: 30 * DAY })
}

export async function clearAdminCookie(): Promise<void> {
  const store = await cookies()
  store.set(ADMIN_COOKIE, "", { ...baseCookie, maxAge: 0 })
}

export async function clearStudentCookie(): Promise<void> {
  const store = await cookies()
  store.set(STUDENT_COOKIE, "", { ...baseCookie, maxAge: 0 })
}
