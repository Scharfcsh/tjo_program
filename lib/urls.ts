/**
 * Build an absolute URL into the portal. Prefers `NEXT_PUBLIC_APP_URL` (so
 * emailed links point at the real host) and falls back to the request origin.
 */
export function appUrl(request: Request, path: string): string {
  const base = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "")
  const origin = base || new URL(request.url).origin
  return `${origin}${path.startsWith("/") ? path : `/${path}`}`
}
