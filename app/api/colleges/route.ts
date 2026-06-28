import { NextResponse } from "next/server"

import { INDIAN_COLLEGES } from "@/lib/colleges-data"

/**
 * Same-origin proxy for the hipolabs universities API, merged with a curated
 * local fallback list (many Indian colleges are missing upstream). The upstream
 * is HTTP-only (blocked as mixed content from HTTPS) and doesn't guarantee CORS,
 * so we always fetch it server-side.
 */
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get("q")?.trim() ?? ""
  if (q.length < 2) {
    return NextResponse.json({ colleges: [] })
  }

  const local = INDIAN_COLLEGES.filter((n) =>
    n.toLowerCase().includes(q.toLowerCase())
  )

  let api: string[] = []
  try {
    const res = await fetch(
      `http://universities.hipolabs.com/search?country=india&name=${encodeURIComponent(q)}`,
      { signal: AbortSignal.timeout(5000), next: { revalidate: 86400 } }
    )
    if (res.ok) {
      const data = (await res.json()) as { name?: string }[]
      api = data
        .map((u) => u.name?.trim())
        .filter((n): n is string => Boolean(n))
    }
  } catch (err) {
    console.error("[colleges] upstream lookup failed", err)
  }

  // Merge local + API, de-dupe case-insensitively, sort, cap.
  const seen = new Set<string>()
  const colleges: string[] = []
  for (const name of [...local, ...api]) {
    const key = name.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    colleges.push(name)
  }
  colleges.sort((a, b) => a.localeCompare(b))

  return NextResponse.json({ colleges: colleges.slice(0, 25) })
}
