import * as React from "react"
import { Button, Text } from "@react-email/components"

import { EmailLayout, emailButtonStyle } from "./Layout"

export type SelectedEmailProps = {
  name: string
  dashboardUrl: string
}

export function SelectedEmail({ name, dashboardUrl }: SelectedEmailProps) {
  return (
    <EmailLayout
      preview="You're officially a TopJobOffer Ambassador!"
      heading={`Congratulations, ${name}!`}
    >
      <Text>
        You&apos;ve completed every onboarding task and are now an{" "}
        <strong>official TopJobOffer Student Ambassador</strong>. 🎉
      </Text>
      <Text>
        Your 30-day mission starts now. Earn points by growing the community,
        driving sign-ups, and sharing TopJobOffer &mdash; then climb the
        leaderboard to win cash, an iPad, Pro/Premium plans, and swag.
      </Text>
      <Button href={dashboardUrl} style={{ ...emailButtonStyle, margin: "8px 0 0" }}>
        Open your dashboard
      </Button>
    </EmailLayout>
  )
}

export default SelectedEmail
