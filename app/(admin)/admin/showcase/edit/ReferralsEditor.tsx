"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { Loader2, Plus, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { REFERRAL_PLANS, type ReferralPlan } from "@/lib/validation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

export type ReferralRow = {
  name: string
  email: string
  plan: ReferralPlan
  joinedAt: string // yyyy-mm-dd
  earned: number
}

function today() {
  return new Date().toISOString().slice(0, 10)
}

export function ReferralsEditor({ initial }: { initial: ReferralRow[] }) {
  const router = useRouter()
  const [rows, setRows] = React.useState<ReferralRow[]>(initial)
  const [saving, setSaving] = React.useState(false)

  function update(i: number, patch: Partial<ReferralRow>) {
    setRows((prev) => prev.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))
  }

  function addRow() {
    setRows((prev) => [
      ...prev,
      { name: "", email: "", plan: "free", joinedAt: today(), earned: 0 },
    ])
  }

  function removeRow(i: number) {
    setRows((prev) => prev.filter((_, idx) => idx !== i))
  }

  async function save() {
    setSaving(true)
    try {
      const res = await fetch("/api/admin/showcase/referrals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ referrals: rows }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        toast.error(data.error ?? "Couldn't save users.")
        return
      }
      toast.success("Referred users saved.")
      router.refresh()
    } catch {
      toast.error("Network error. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-medium">Referred users ({rows.length})</h2>
          <Button type="button" size="sm" variant="outline" onClick={addRow}>
            <Plus className="size-4" />
            Add user
          </Button>
        </div>

        {rows.length === 0 && (
          <p className="text-sm text-muted-foreground">
            No users yet. Click “Add user” to create one.
          </p>
        )}

        <div className="flex flex-col gap-3">
          {rows.map((row, i) => (
            <div
              key={i}
              className="grid grid-cols-1 items-end gap-2 border-b pb-3 last:border-0 sm:grid-cols-[1fr_1fr_auto_auto_auto_auto]"
            >
              <Field label="Name">
                <Input
                  value={row.name}
                  onChange={(e) => update(i, { name: e.target.value })}
                  placeholder="Full name"
                />
              </Field>
              <Field label="Email">
                <Input
                  value={row.email}
                  onChange={(e) => update(i, { email: e.target.value })}
                  placeholder="email@example.com"
                />
              </Field>
              <Field label="Plan">
                <select
                  value={row.plan}
                  onChange={(e) => update(i, { plan: e.target.value as ReferralPlan })}
                  className="h-8 rounded-none border border-input bg-transparent px-2.5 text-sm capitalize outline-none focus-visible:border-ring focus-visible:ring-1 focus-visible:ring-ring/50"
                >
                  {REFERRAL_PLANS.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Joined">
                <Input
                  type="date"
                  value={row.joinedAt}
                  onChange={(e) => update(i, { joinedAt: e.target.value })}
                  className="w-[9.5rem]"
                />
              </Field>
              <Field label="Earned ₹">
                <Input
                  type="number"
                  min={0}
                  value={row.earned}
                  onChange={(e) => update(i, { earned: Number(e.target.value) })}
                  className="w-24"
                />
              </Field>
              <Button
                type="button"
                size="icon-sm"
                variant="ghost"
                onClick={() => removeRow(i)}
                aria-label="Delete user"
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>

        <Button type="button" onClick={save} disabled={saving} className="mt-1 self-start">
          {saving && <Loader2 className="animate-spin" />}
          Save users
        </Button>
      </CardContent>
    </Card>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      {children}
    </div>
  )
}
