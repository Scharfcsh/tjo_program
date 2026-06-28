import * as React from "react"
import { Text } from "@react-email/components"

import { EmailLayout } from "./Layout"

export type WelcomeEmailProps = {
  name: string
}

export function WelcomeEmail({ name }: WelcomeEmailProps) {
  return (
    <EmailLayout
      preview="You're registered for the TopJobOffer Ambassador Program"
      heading={`Welcome aboard, ${name}!`}
    >
      <Text>
        Thanks for registering for the TopJobOffer Student Ambassador Program.
        Your application has been received.
      </Text>
      <Text>
        Our team reviews every applicant. If you&apos;re shortlisted, we&apos;ll
        email you a private link to log in and start your onboarding tasks. Keep
        an eye on your inbox &mdash; we&apos;ll be in touch soon.
      </Text>
    </EmailLayout>
  )
}

export default WelcomeEmail
