import Link from "next/link"

import { Button } from "@/components/ui/button"

export default function Page() {
  return (
    <main className="mx-auto flex min-h-svh max-w-2xl flex-col justify-center gap-6 p-6">
      <div className="flex flex-col gap-2">
        <p className="text-xs font-medium tracking-wide text-primary uppercase">
          TopJobOffer Ambassadors
        </p>
        <h1 className="text-2xl font-semibold">Student Ambassador Portal</h1>
        <p className="max-w-prose text-sm text-muted-foreground">
          Join the TopJobOffer Student Ambassador Program: register, get
          shortlisted, complete your onboarding tasks, then run a 30-day mission
          to climb the leaderboard and win rewards.
        </p>
      </div>
      <div className="flex gap-2">
        <Button asChild>
          <Link href="/register">Register as an ambassador</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/admin">Admin</Link>
        </Button>
      </div>
    </main>
  )
}
