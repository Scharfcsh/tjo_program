import { SignJWT, jwtVerify, type JWTPayload } from "jose"

/**
 * Lightweight session/token primitives built on `jose` (edge-safe, so the same
 * helpers run inside `proxy.ts` and route handlers). This is intentionally a
 * thin layer: swapping to Clerk later means replacing this file + `proxy.ts`
 * while route handlers / pages keep calling `readAdmin` / `readStudent`.
 */

export const ADMIN_COOKIE = "tjo_admin"
export const STUDENT_COOKIE = "tjo_student"

const DAY = 60 * 60 * 24

export type AdminToken = JWTPayload & { role: "admin" }
export type StudentSession = JWTPayload & { sub: string; kind: "session" }
export type MagicToken = JWTPayload & { sub: string; kind: "magic" }

function secretKey(): Uint8Array {
  const secret = process.env.SESSION_SECRET
  if (!secret) {
    throw new Error(
      "SESSION_SECRET is not set. Add it to .env.local (see .env.example)."
    )
  }
  return new TextEncoder().encode(secret)
}

async function sign(payload: JWTPayload, expiresInSeconds: number): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(Math.floor(Date.now() / 1000) + expiresInSeconds)
    .sign(secretKey())
}

async function verify<T extends JWTPayload>(token: string): Promise<T | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey())
    return payload as T
  } catch {
    return null
  }
}

// --- Admin -----------------------------------------------------------------

export function signAdminToken(): Promise<string> {
  return sign({ role: "admin" } satisfies AdminToken, 7 * DAY)
}

export async function verifyAdminToken(
  token: string | undefined
): Promise<AdminToken | null> {
  if (!token) return null
  const payload = await verify<AdminToken>(token)
  return payload?.role === "admin" ? payload : null
}

// --- Student session -------------------------------------------------------

export function signStudentSession(studentId: string): Promise<string> {
  return sign({ sub: studentId, kind: "session" } satisfies StudentSession, 30 * DAY)
}

export async function verifyStudentSession(
  token: string | undefined
): Promise<StudentSession | null> {
  if (!token) return null
  const payload = await verify<StudentSession>(token)
  return payload?.kind === "session" && payload.sub ? payload : null
}

// --- Magic link (emailed) --------------------------------------------------

export function signMagicToken(studentId: string): Promise<string> {
  return sign({ sub: studentId, kind: "magic" } satisfies MagicToken, 1 * DAY)
}

export async function verifyMagicToken(
  token: string | undefined
): Promise<MagicToken | null> {
  if (!token) return null
  const payload = await verify<MagicToken>(token)
  return payload?.kind === "magic" && payload.sub ? payload : null
}
