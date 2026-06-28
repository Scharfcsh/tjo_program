import { NextResponse } from "next/server"

/**
 * Same-origin proxy for the hipolabs universities API. The upstream is HTTP-only
 * (would be blocked as mixed content from an HTTPS page) and doesn't guarantee
 * CORS, so we fetch it server-side and return a clean list of college names.
 */
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? ""
  if (q.length < 2) {
    return NextResponse.json({ colleges: [] })
  }

  try {
    const res = await fetch(
      `http://universities.hipolabs.com/search?country=india&name=${encodeURIComponent(q)}`,
      { signal: AbortSignal.timeout(5000), next: { revalidate: 86400 } }
    )
    if (!res.ok) {
      return NextResponse.json({ colleges: [] })
    }
    const data = (await res.json()) as { name?: string }[]
    const colleges = Array.from(
      new Set(
        data
          .map((u) => u.name?.trim())
          .filter((n): n is string => Boolean(n))
      )
    )
      .sort((a, b) => a.localeCompare(b))
      .slice(0, 25)

    return NextResponse.json({ colleges })
  } catch (err) {
    console.error("[colleges] lookup failed", err)
    return NextResponse.json({ colleges: [] })
  }
}
