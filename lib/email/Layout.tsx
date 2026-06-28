import * as React from "react"
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components"

const colors = {
  bg: "#0b0f0c",
  card: "#11161a",
  border: "#1f2a24",
  text: "#e6f1ea",
  muted: "#9bb3a6",
  accent: "#34d399",
}

type LayoutProps = {
  preview: string
  heading: string
  children: React.ReactNode
}

export function EmailLayout({ preview, heading, children }: LayoutProps) {
  return (
    <Html>
      <Head />
      <Preview>{preview}</Preview>
      <Body
        style={{
          backgroundColor: colors.bg,
          color: colors.text,
          fontFamily:
            "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          margin: 0,
          padding: "32px 0",
        }}
      >
        <Container
          style={{
            backgroundColor: colors.card,
            border: `1px solid ${colors.border}`,
            borderRadius: "0px",
            maxWidth: "520px",
            margin: "0 auto",
            padding: "32px",
          }}
        >
          <Text
            style={{
              color: colors.accent,
              fontSize: "13px",
              fontWeight: 600,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              margin: "0 0 16px",
            }}
          >
            TopJobOffer Ambassadors
          </Text>
          <Heading
            style={{
              color: colors.text,
              fontSize: "22px",
              fontWeight: 600,
              margin: "0 0 16px",
            }}
          >
            {heading}
          </Heading>
          <Section style={{ color: colors.muted, fontSize: "15px", lineHeight: "24px" }}>
            {children}
          </Section>
          <Hr style={{ borderColor: colors.border, margin: "28px 0 16px" }} />
          <Text style={{ color: colors.muted, fontSize: "12px", margin: 0 }}>
            You are receiving this because you registered for the TopJobOffer
            Student Ambassador Program. Visit{" "}
            <Link href="https://topjoboffer.com" style={{ color: colors.accent }}>
              topjoboffer.com
            </Link>
            .
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

export const emailButtonStyle: React.CSSProperties = {
  backgroundColor: colors.accent,
  borderRadius: "0px",
  color: "#03130c",
  display: "inline-block",
  fontSize: "14px",
  fontWeight: 600,
  padding: "12px 20px",
  textDecoration: "none",
}

export const emailColors = colors
