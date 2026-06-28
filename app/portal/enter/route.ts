import { NextResponse, type NextRequest } from "next/server"

import { connectToDatabase } from "@/lib/db"
import { Student } from "@/lib/models/Student"
import { verifyMagicToken, signStudentSession } from "@/lib/auth"
import { setStudentCookie } from "@/lib/session"

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token") ?? undefined
  const magic = await verifyMagicToken(token)

  const signIn = new URL("/portal/sign-in", request.url)

  if (!magic) {
    signIn.searchParams.set("error", "invalid")
    return NextResponse.redirect(signIn)
  }

  try {
    await connectToDatabase()
    const student = await Student.findById(magic.sub).select("_id").lean()
    if (!student) {
      signIn.searchParams.set("error", "invalid")
      return NextResponse.redirect(signIn)
    }
  } catch (err) {
    console.error("[portal/enter] db error", err)
    signIn.searchParams.set("error", "unavailable")
    return NextResponse.redirect(signIn)
  }

  await setStudentCookie(await signStudentSession(magic.sub))
  return NextResponse.redirect(new URL("/onboarding", request.url))
}
