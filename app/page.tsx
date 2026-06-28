import Link from "next/link"
import {
  Award,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  GraduationCap,
  IndianRupee,
  Megaphone,
  TrendingUp,
  Users,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

const PERKS = [
  { icon: IndianRupee, title: "Earn ₹10,000", hint: "per month" },
  { icon: CalendarDays, title: "1 Month", hint: "internship" },
  { icon: Award, title: "Certificate", hint: "of excellence" },
  { icon: Users, title: "Leadership", hint: "exposure" },
  { icon: TrendingUp, title: "Real impact", hint: "on campus" },
]

const ROLES = [
  "Represent TopJobOffer on your campus",
  "Promote our platform and initiatives",
  "Build strong student communities",
  "Organize events and drive engagement",
  "Be a bridge between students and opportunities",
]

export default function Page() {
  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-12">
      {/* Brand bar */}
      <header className="flex flex-col gap-1 border-b pb-6">
        <p className="text-2xl font-extrabold tracking-tight">
          TOPJOB<span className="text-primary">OFFER</span>
        </p>
        <p className="text-sm text-muted-foreground">
          Empowering Careers. Enriching Futures.
        </p>
      </header>

      {/* Hero */}
      <section className="py-10">
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
          BE THE VOICE.
          <br />
          <span className="text-primary">LEAD THE CHANGE.</span>
        </h1>
        <p className="mt-4 max-w-prose text-base text-muted-foreground">
          Join the movement that&apos;s transforming how students discover and
          get the <span className="font-semibold text-foreground">best job opportunities</span>.
        </p>

        <div className="mt-6 inline-flex items-center gap-2 bg-primary px-4 py-2 text-primary-foreground">
          <Megaphone className="size-5" />
          <Button asChild size="lg">
            <Link href="/register">
              <BadgeCheck className="size-6" />
              
              <span className="text-lg font-bold tracking-tight uppercase">
              Register as an ambassador
            </span>
            </Link>
          </Button>
        </div>
      </section>

      {/* What you get */}
      <section className="py-4">
        <h2 className="mb-4 text-sm font-semibold tracking-wide text-primary uppercase">
          What you get
        </h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {PERKS.map((perk) => {
            const Icon = perk.icon
            return (
              <Card key={perk.title} className="py-5">
                <CardContent className="flex flex-col items-center gap-2 text-center">
                  <span className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </span>
                  <div>
                    <div className="text-sm font-semibold">{perk.title}</div>
                    <div className="text-xs text-muted-foreground">{perk.hint}</div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        <p className="mt-4 inline-flex items-center gap-2 text-sm text-muted-foreground">
          <GraduationCap className="size-4 text-primary" />
          <span>
            <span className="font-medium text-foreground">Who can apply?</span>{" "}
            Passionate students from any UG/PG college.
          </span>
        </p>
      </section>

      {/* Your role */}
      <section className="py-6">
        <Card className="border-primary/30 bg-primary/5 py-6">
          <CardContent>
            <h2 className="mb-4 text-sm font-semibold tracking-wide text-primary uppercase">
              Your role
            </h2>
            <ul className="grid gap-2.5 sm:grid-cols-2">
              {ROLES.map((role) => (
                <li key={role} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                  {role}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </section>

      {/* Closing CTA */}
      <section className="flex flex-col items-start gap-4 border-t pt-8">
        <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
          KICKSTART YOUR JOURNEY.
          <br />
          <span className="text-primary">BUILD YOUR FUTURE.</span>
        </h2>
        {/* <Button asChild size="lg">
          <Link href="/register">
            <BadgeCheck className="size-4" />
            Register as an ambassador
          </Link>
        </Button> */}
      </section>
    </main>
  )
}
