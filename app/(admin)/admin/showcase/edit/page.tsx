import Link from "next/link"
import { ArrowLeft } from "lucide-react"

import { connectToDatabase } from "@/lib/db"
import { getShowcase } from "@/lib/models/Showcase"

import { ShowcaseForm } from "./ShowcaseForm"
import { ReferralsEditor, type ReferralRow } from "./ReferralsEditor"

export const dynamic = "force-dynamic"

export default async function ShowcaseEditPage() {
  await connectToDatabase()
  const values = await getShowcase()

  const referralRows: ReferralRow[] = values.referrals.map((r) => ({
    name: r.name,
    email: r.email,
    plan: r.plan,
    joinedAt: r.joinedAt.toISOString().slice(0, 10),
    earned: r.earned,
  }))

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-6">
      <header>
        <Link
          href="/admin/showcase"
          className="mb-2 inline-flex items-center gap-1.5 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          <ArrowLeft className="size-3" />
          Back to showcase
        </Link>
        <h1 className="text-lg font-medium">Edit showcase numbers</h1>
        <p className="text-sm text-muted-foreground">
          These are display-only marketing figures. They&apos;re stored separately and
          never affect real ambassador data.
        </p>
      </header>

      <ShowcaseForm initial={values} />
      <ReferralsEditor initial={referralRows} />
    </main>
  )
}
