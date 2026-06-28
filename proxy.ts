import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

import {
  ADMIN_COOKIE,
  STUDENT_COOKIE,
  verifyAdminToken,
  verifyStudentSession,
} from "@/lib/auth"

/**
 * Next 16 "Proxy" (formerly Middleware). Optimistic auth gate:
 * - /admin and /api/admin (except the login routes) require a valid admin cookie.
 * - /onboarding and /dashboard require a valid student session cookie.
 * Route handlers re-check auth themselves for anything sensitive.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Admin area (pages + API), excluding the login page and login API.
  const isAdminArea =
    (pathname.startsWith("/admin") && pathname !== "/admin/login") ||
    (pathname.startsWith("/api/admin") && pathname !== "/api/admin/login")

  if (isAdminArea) {
    const admin = await verifyAdminToken(request.cookies.get(ADMIN_COOKIE)?.value)
    if (!admin) {
      if (pathname.startsWith("/api/")) {
        return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 })
      }
      const url = request.nextUrl.clone()
      url.pathname = "/admin/login"
      url.search = ""
      return NextResponse.redirect(url)
    }
  }

  // Student area.
  if (pathname.startsWith("/onboarding") || pathname.startsWith("/dashboard")) {
    const session = await verifyStudentSession(
      request.cookies.get(STUDENT_COOKIE)?.value
    )
    if (!session) {
      const url = request.nextUrl.clone()
      url.pathname = "/portal/sign-in"
      url.search = ""
      return NextResponse.redirect(url)
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/onboarding/:path*", "/dashboard/:path*"],
}
