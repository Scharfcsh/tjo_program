import { createElement } from "react"
import { NextResponse } from "next/server"
import { isValidObjectId } from "mongoose"

import { connectToDatabase } from "@/lib/db"
import { Student } from "@/lib/models/Student"
import { isAdmin } from "@/lib/session"
import { signMagicToken } from "@/lib/auth"
import { appUrl } from "@/lib/urls"
import { sendEmail } from "@/lib/email/client"
import { ShortlistEmail } from "@/lib/email/Shortlist"
import { SelectedEmail } from "@/lib/email/Selected"

const ACTIONS = ["shortlist", "select", "reject"] as const
type Action = (typeof ACTIONS)[number]

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await isAdmin())) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
  }

  const { id } = await params
  if (!isValidObjectId(id)) {
    return NextResponse.json({ ok: false, error: "Invalid id" }, { status: 400 })
  }

  const body = await request.json().catch(() => ({}))
  const action = body?.action as Action | undefined
  if (!action || !ACTIONS.includes(action)) {
    return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 })
  }

  await connectToDatabase()
  const student = await Student.findById(id)
  if (!student) {
    return NextResponse.json({ ok: false, error: "Student not found" }, { status: 404 })
  }

  if (action === "shortlist") {
    student.status = "shortlisted"
    student.shortlistedAt = new Date()
    await student.save()

    const token = await signMagicToken(student._id.toString())
    const loginUrl = appUrl(request, `/portal/enter?token=${token}`)
    await safeSend(() =>
      sendEmail({
        to: student.email,
        subject: "You're shortlisted — start your onboarding",
        react: createElement(ShortlistEmail, { name: student.name, loginUrl }),
      })
    )
  } else if (action === "select") {
    student.status = "selected"
    student.selectedAt = new Date()
    await student.save()

    const dashboardUrl = appUrl(request, "/dashboard")
    await safeSend(() =>
      sendEmail({
        to: student.email,
        subject: "You're officially a TopJobOffer Ambassador!",
        react: createElement(SelectedEmail, { name: student.name, dashboardUrl }),
      })
    )
  } else {
    student.status = "rejected"
    await student.save()
  }

  return NextResponse.json({ ok: true, status: student.status })
}

async function safeSend(fn: () => Promise<void>) {
  try {
    await fn()
  } catch (err) {
    console.error("[admin] email failed", err)
  }
}
