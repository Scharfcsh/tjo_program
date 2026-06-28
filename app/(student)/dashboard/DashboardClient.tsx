"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Check,
  Copy,
  ExternalLink,
  Loader2,
  MessageCircle,
  RefreshCw,
  Trophy,
} from "lucide-react"
import { toast } from "sonner"

import type { MissionBreakdown, MissionRow } from "@/lib/points"
import {
  MISSIONS,
  REWARD_TIERS,
  WHATSAPP_GROUP_URL,
  WHATSAPP_MESSAGE_TEMPLATE,
  type MissionDef,
  type MissionKey,
  type RewardTier,
  type SubmissionType,
} from "@/lib/missions-config"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export type SubmissionView = {
  id: string
  url: string
  status: "pending" | "approved" | "rejected"
  note: string | null
  createdAt: string
}

const DEF_BY_KEY = new Map<MissionKey, MissionDef>(MISSIONS.map((m) => [m.key, m]))

export function DashboardClient({
  name,
  initialBreakdown,
  initialRank,
  initialReward,
  daysLeft,
  lastSyncedAt,
  initialSubmissions,
  initialWhatsappJoined,
}: {
  name: string
  initialBreakdown: MissionBreakdown
  initialRank: number | null
  initialReward: RewardTier | null
  daysLeft: number
  lastSyncedAt: string | null
  initialSubmissions: Record<SubmissionType, SubmissionView[]>
  initialWhatsappJoined: boolean
}) {
  const router = useRouter()
  const [breakdown, setBreakdown] = React.useState(initialBreakdown)
  const [rank, setRank] = React.useState(initialRank)
  const [reward, setReward] = React.useState(initialReward)
  const [syncedAt, setSyncedAt] = React.useState(lastSyncedAt)
  const [syncing, setSyncing] = React.useState(false)
  const [submissions, setSubmissions] = React.useState(initialSubmissions)

  async function sync() {
    setSyncing(true)
    try {
      const res = await fetch("/api/missions/sync", { method: "POST" })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        toast.error(data.error ?? "Sync failed.")
        return
      }
      setBreakdown(data.breakdown as MissionBreakdown)
      setRank(data.rank as number | null)
      setReward(rewardFor(data.rank as number | null))
      setSyncedAt(data.lastSyncedAt as string)
      toast.success(`Synced — ${data.total} points`)
      router.refresh()
    } catch {
      toast.error("Network error. Please try again.")
    } finally {
      setSyncing(false)
    }
  }

  function onSubmitted(type: SubmissionType, submission: SubmissionView) {
    setSubmissions((prev) => ({ ...prev, [type]: [submission, ...prev[type]] }))
  }

  const apiRows = breakdown.rows.filter((r) => DEF_BY_KEY.get(r.key)?.kind === "api")
  const submissionRows = breakdown.rows.filter(
    (r) => DEF_BY_KEY.get(r.key)?.kind === "submission"
  )
  const apiGroups = groupRows(apiRows)

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-medium tracking-wide text-primary uppercase">
            30-day mission
          </p>
          <h1 className="text-xl font-semibold">Welcome back, {name}</h1>
          <p className="text-sm text-muted-foreground">
            {daysLeft > 0 ? `${daysLeft} days left` : "Mission complete"}
            {syncedAt && ` · last synced ${new Date(syncedAt).toLocaleString()}`}
          </p>
        </div>
        <Button onClick={sync} disabled={syncing}>
          {syncing ? <Loader2 className="animate-spin" /> : <RefreshCw />}
          Sync my stats
        </Button>
      </header>

      <div className="grid gap-3 sm:grid-cols-3">
        <Stat label="Points balance" value={breakdown.total.toLocaleString()} />
        <Stat label="Leaderboard rank" value={rank ? `#${rank}` : "—"} />
        <Stat
          label="Projected reward"
          value={reward ? reward.reward : "Keep climbing"}
          hint={reward?.label}
        />
      </div>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">Auto-tracked (from your referrals)</h2>
        {apiGroups.map((group) =>
          group.name ? (
            <Card key={group.name} className="py-4">
              <CardHeader className="pb-0">
                <CardTitle className="text-sm">{group.name}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                {group.rows.map((row) => (
                  <MissionRowView key={row.key} row={row} nested />
                ))}
              </CardContent>
            </Card>
          ) : (
            <Card key={group.rows[0].key} className="py-4">
              <CardContent>
                <MissionRowView row={group.rows[0]} />
              </CardContent>
            </Card>
          )
        )}
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="text-sm font-medium">Submit your work (admin reviewed)</h2>
        <WhatsappJoinCard initialJoined={initialWhatsappJoined} />
        {submissionRows.map((row) => {
          const def = DEF_BY_KEY.get(row.key)
          if (!def?.submissionType) return null
          return (
            <SubmissionMission
              key={row.key}
              row={row}
              type={def.submissionType}
              submissions={submissions[def.submissionType]}
              onSubmitted={onSubmitted}
            />
          )
        })}
      </section>

      <RewardsTable currentRank={rank} />
    </div>
  )
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string
  value: string
  hint?: string
}) {
  return (
    <Card className="gap-1 py-4">
      <CardHeader className="pb-0">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-xl">{value}</CardTitle>
      </CardHeader>
      {hint && (
        <CardContent>
          <Badge variant="success">{hint}</Badge>
        </CardContent>
      )}
    </Card>
  )
}

function MissionRowView({ row, nested }: { row: MissionRow; nested?: boolean }) {
  const pct = row.goal > 0 ? Math.min(100, (row.count / row.goal) * 100) : 0
  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className={nested ? "text-sm" : "text-sm font-medium"}>{row.title}</h3>
          <p className="text-xs text-muted-foreground">{row.description}</p>
        </div>
        <div className="text-right">
          <div className="text-sm font-medium">{row.points} pts</div>
          <div className="text-xs text-muted-foreground">
            {row.count}/{row.goal} {row.unit}
          </div>
        </div>
      </div>
      <Progress value={pct} className="mt-2" />
    </div>
  )
}

function SubmissionMission({
  row,
  type,
  submissions,
  onSubmitted,
}: {
  row: MissionRow
  type: SubmissionType
  submissions: SubmissionView[]
  onSubmitted: (type: SubmissionType, submission: SubmissionView) => void
}) {
  const [url, setUrl] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)
  const pct = row.goal > 0 ? Math.min(100, (row.count / row.goal) * 100) : 0

  async function submit() {
    if (!url.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, url: url.trim() }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        toast.error(data.error ?? "Submission failed.")
        return
      }
      onSubmitted(type, data.submission as SubmissionView)
      setUrl("")
      toast.success("Submitted — an admin will review it shortly.")
    } catch {
      toast.error("Network error. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card className="py-4">
      <CardContent className="flex flex-col gap-3">
        <MissionRowView row={row} />

        {type === "whatsapp_promo" && <WhatsappTemplate />}

        <div className="flex flex-col gap-2 sm:flex-row">
          <Input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={
              type === "whatsapp_promo"
                ? "https://… (screenshot image link)"
                : "https://… (link to your post)"
            }
          />
          <Button size="sm" onClick={submit} disabled={submitting || !url.trim()}>
            {submitting && <Loader2 className="animate-spin" />}
            Submit for review
          </Button>
        </div>

        {submissions.length > 0 && (
          <ul className="flex flex-col gap-1.5">
            {submissions.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-2 text-xs">
                <a
                  href={s.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 truncate text-primary underline-offset-4 hover:underline"
                >
                  <span className="truncate">{s.url}</span>
                  <ExternalLink className="size-3 shrink-0" />
                </a>
                <SubmissionStatusBadge status={s.status} />
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

function SubmissionStatusBadge({
  status,
}: {
  status: SubmissionView["status"]
}) {
  if (status === "approved") return <Badge variant="success">Approved</Badge>
  if (status === "rejected") return <Badge variant="destructive">Rejected</Badge>
  return <Badge variant="secondary">Pending</Badge>
}

function WhatsappTemplate() {
  const [copied, setCopied] = React.useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(WHATSAPP_MESSAGE_TEMPLATE)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error("Couldn't copy — select and copy manually.")
    }
  }

  return (
    <div className="border bg-muted/40 p-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium">Message to share</p>
        <Button size="xs" variant="outline" onClick={copy}>
          {copied ? <Check className="size-3" /> : <Copy className="size-3" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">{WHATSAPP_MESSAGE_TEMPLATE}</p>
    </div>
  )
}

function WhatsappJoinCard({ initialJoined }: { initialJoined: boolean }) {
  const [joined, setJoined] = React.useState(initialJoined)
  const [saving, setSaving] = React.useState(false)

  async function confirm() {
    setSaving(true)
    try {
      const res = await fetch("/api/missions/whatsapp-join", { method: "POST" })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        toast.error(data.error ?? "Couldn't save. Try again.")
        return
      }
      setJoined(true)
      toast.success("Thanks for joining!")
    } catch {
      toast.error("Network error. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card className="py-4">
      <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <MessageCircle className="mt-0.5 size-5 text-primary" />
          <div>
            <h3 className="text-sm font-medium">Join our WhatsApp group</h3>
            <p className="text-xs text-muted-foreground">
              Stay in the loop with announcements and support from the team.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild size="sm" variant="outline">
            <a href={WHATSAPP_GROUP_URL} target="_blank" rel="noopener noreferrer">
              Open invite
              <ExternalLink className="size-3" />
            </a>
          </Button>
          {joined ? (
            <Badge variant="success">Joined</Badge>
          ) : (
            <Button size="sm" onClick={confirm} disabled={saving}>
              {saving && <Loader2 className="animate-spin" />}
              I&apos;ve joined
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function RewardsTable({ currentRank }: { currentRank: number | null }) {
  return (
    <Card className="py-4">
      <CardHeader className="pb-0">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Trophy className="size-4 text-primary" />
          Reward tiers
        </CardTitle>
        <CardDescription>Final standings at the end of the 30 days.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {REWARD_TIERS.map((tier) => {
          const active =
            currentRank !== null &&
            currentRank >= tier.from &&
            currentRank <= tier.to
          return (
            <div
              key={tier.position}
              className={
                "flex items-center justify-between border px-3 py-2 text-sm " +
                (active ? "border-primary bg-primary/10" : "border-border")
              }
            >
              <span className="font-medium">{tier.position}</span>
              <span className="text-muted-foreground">{tier.label}</span>
              <span>{tier.reward}</span>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}

type RowGroup = { name: string | null; rows: MissionRow[] }

function groupRows(rows: MissionRow[]): RowGroup[] {
  const groups: RowGroup[] = []
  for (const row of rows) {
    if (row.group) {
      const existing = groups.find((g) => g.name === row.group)
      if (existing) {
        existing.rows.push(row)
        continue
      }
      groups.push({ name: row.group, rows: [row] })
    } else {
      groups.push({ name: null, rows: [row] })
    }
  }
  return groups
}

function rewardFor(rank: number | null): RewardTier | null {
  if (!rank) return null
  return REWARD_TIERS.find((t) => rank >= t.from && rank <= t.to) ?? null
}
