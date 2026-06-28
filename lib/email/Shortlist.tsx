import * as React from "react"
import { Button, Text } from "@react-email/components"

import { EmailLayout, emailButtonStyle } from "./Layout"

export type ShortlistEmailProps = {
  name: string
  loginUrl: string
}

export function ShortlistEmail({ name, loginUrl }: ShortlistEmailProps) {
  return (
    <EmailLayout
      preview="You've been shortlisted — start your onboarding"
      heading={`You're shortlisted, ${name}!`}
    >
      <Text>
        Great news &mdash; you&apos;ve been shortlisted for the TopJobOffer
        Student Ambassador Program. The next step is to complete four quick
        onboarding tasks to become an official ambassador.
      </Text>
      <Text>Use your private link below to log in and get started:</Text>
      <Button href={loginUrl} style={{ ...emailButtonStyle, margin: "8px 0 16px" }}>
        Start onboarding
      </Button>
      <Text style={{ fontSize: "13px" }}>
        This link is personal to you and expires in 24 hours. If it expires, ask
        the team to re-send it.
      </Text>
    </EmailLayout>
  )
}

export default ShortlistEmail
