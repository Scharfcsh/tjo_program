import { createElement } from "react"
import { NextResponse } from "next/server"

import { connectToDatabase } from "@/lib/db"
import { Student } from "@/lib/models/Student"
import { registerSchema } from "@/lib/validation"
import { generateReferralCode } from "@/lib/referral"
import { sendEmail } from "@/lib/email/client"
import { WelcomeEmail } from "@/lib/email/Welcome"

export async function POST(request: Request) {
  const body = await request.json().catch(() => null)
  const parsed = registerSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      {
        ok: false,
        error: "Please check the highlighted fields.",
        issues: parsed.error.flatten().fieldErrors,
      },
      { status: 400 }
    )
  }

  const data = parsed.data

  try {
    await connectToDatabase()
  } catch (err) {
    console.error("[register] database connection failed", err)
    return NextResponse.json(
      { ok: false, error: "Service unavailable. Please try again later." },
      { status: 503 }
    )
  }

  const existing = await Student.findOne({ email: data.email })
    .select("_id")
    .lean()
  if (existing) {
    return NextResponse.json(
      { ok: false, error: "This email is already registered." },
      { status: 409 }
    )
  }

  // Generate a referral code, retrying on the (rare) chance of a collision.
  let referralCode = generateReferralCode()
  for (let i = 0; i < 5; i++) {
    const clash = await Student.exists({ referralCode })
    if (!clash) break
    referralCode = generateReferralCode()
  }

  let student
  try {
    student = await Student.create({ ...data, referralCode, status: "registered" })
  } catch (err: unknown) {
    // Unique index race on email.
    if (
      typeof err === "object" &&
      err !== null &&
      "code" in err &&
      (err as { code?: number }).code === 11000
    ) {
      return NextResponse.json(
        { ok: false, error: "This email is already registered." },
        { status: 409 }
      )
    }
    console.error("[register] failed to create student", err)
    return NextResponse.json(
      { ok: false, error: "Something went wrong. Please try again." },
      { status: 500 }
    )
  }

  // Email failures should not fail registration.
  try {
    await sendEmail({
      to: data.email,
      subject: "You're registered — TopJobOffer Ambassadors",
      react: createElement(WelcomeEmail, { name: student.name }),
    })
  } catch (err) {
    console.error("[register] welcome email failed", err)
  }

  return NextResponse.json({ ok: true, referralCode: student.referralCode })
}
