"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { toast } from "sonner"

import type { ShowcaseValues } from "@/lib/models/Showcase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"

const FIELDS: { name: keyof ShowcaseValues; label: string; type: string }[] = [
  { name: "displayName", label: "Display name", type: "text" },
  { name: "referralLink", label: "Referral link", type: "text" },
  { name: "rank", label: "Leaderboard rank (#)", type: "number" },
  { name: "totalEarned", label: "Total earned (₹)", type: "number" },
  { name: "monthEarned", label: "This month earned (₹)", type: "number" },
  { name: "totalReferrals", label: "Total referrals", type: "number" },
  { name: "proSubs", label: "Pro subscriptions", type: "number" },
  { name: "premiumSubs", label: "Premium subscriptions", type: "number" },
]

export function ShowcaseForm({ initial }: { initial: ShowcaseValues }) {
  const router = useRouter()
  const [submitting, setSubmitting] = React.useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)

    const form = new FormData(event.currentTarget)
    const payload = {
      displayName: String(form.get("displayName") ?? ""),
      referralLink: String(form.get("referralLink") ?? ""),
      rank: String(form.get("rank") ?? "0"),
      totalEarned: String(form.get("totalEarned") ?? "0"),
      monthEarned: String(form.get("monthEarned") ?? "0"),
      totalReferrals: String(form.get("totalReferrals") ?? "0"),
      proSubs: String(form.get("proSubs") ?? "0"),
      premiumSubs: String(form.get("premiumSubs") ?? "0"),
    }

    try {
      const res = await fetch("/api/admin/showcase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        toast.error(data.error ?? "Couldn't save. Try again.")
        return
      }
      toast.success("Showcase updated.")
      router.push("/admin/showcase")
      router.refresh()
    } catch {
      toast.error("Network error. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <CardContent>
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          {FIELDS.map((field) => (
            <div key={field.name} className="flex flex-col gap-1.5">
              <Label htmlFor={field.name}>{field.label}</Label>
              <Input
                id={field.name}
                name={field.name}
                type={field.type}
                min={field.type === "number" ? 0 : undefined}
                defaultValue={String(initial[field.name] ?? "")}
                required
              />
            </div>
          ))}

          <Button type="submit" disabled={submitting} className="mt-2">
            {submitting && <Loader2 className="animate-spin" />}
            Save
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
