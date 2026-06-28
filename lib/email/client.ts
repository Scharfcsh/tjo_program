import type { ReactElement } from "react"
import nodemailer, { type Transporter } from "nodemailer"
import { render } from "@react-email/render"

/**
 * Email sender backed by nodemailer over SMTP.
 *
 * If SMTP env vars are not configured the email is rendered and logged to the
 * server console instead of being sent, so the app is fully usable offline /
 * without credentials during development.
 */

let cachedTransport: Transporter | null = null
let resolved = false

function getTransport(): Transporter | null {
  if (resolved) return cachedTransport
  resolved = true

  const host = process.env.SMTP_HOST
  if (!host) {
    cachedTransport = null
    return null
  }

  cachedTransport = nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT ?? 587) === 465,
    auth:
      process.env.SMTP_USER && process.env.SMTP_PASS
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
  })
  return cachedTransport
}

const fromAddress =
  process.env.EMAIL_FROM ?? "TopJobOffer Ambassadors <ambassadors@topjoboffer.com>"

export async function sendEmail(options: {
  to: string
  subject: string
  react: ReactElement
}): Promise<void> {
  const { to, subject, react } = options
  const html = await render(react)
  const text = await render(react, { plainText: true })

  const transport = getTransport()
  if (!transport) {
    console.info(
      `\n[email:console-fallback] SMTP not configured — would have sent:\n` +
        `  to: ${to}\n  subject: ${subject}\n${text}\n`
    )
    return
  }

  await transport.sendMail({ from: fromAddress, to, subject, html, text })
}
