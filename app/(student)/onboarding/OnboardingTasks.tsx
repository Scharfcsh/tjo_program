"use client"

import * as React from "react"
import Link from "next/link"
import { CheckCircle2, Circle, ExternalLink, Loader2, PartyPopper } from "lucide-react"
import { toast } from "sonner"

import { ONBOARDING_TASKS } from "@/lib/onboarding"
import type { OnboardingTaskKey } from "@/lib/models/Onboarding"
import type { OnboardingView, TaskView } from "@/lib/onboarding-service"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

export function OnboardingTasks({
  referralCode,
  initial,
  initialSelected,
}: {
  referralCode: string
  initial: OnboardingView
  initialSelected: boolean
}) {
  const [view, setView] = React.useState(initial)
  const [selected, setSelected] = React.useState(initialSelected)
  const [pending, setPending] = React.useState<OnboardingTaskKey | null>(null)

  async function verify(task: OnboardingTaskKey) {
    setPending(task)
    try {
      const res = await fetch("/api/tasks/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        toast.error(data.error ?? "Verification failed.")
        return
      }
      setView(data.onboarding as OnboardingView)
      if (data.verified) {
        toast.success(data.detail ?? "Verified!")
      } else {
        toast.warning(data.detail ?? "Not verified yet — try again once you're done.")
      }
      if (data.justSelected) {
        setSelected(true)
        toast.success("You're now an official ambassador! 🎉")
      }
    } catch {
      toast.error("Network error. Please try again.")
    } finally {
      setPending(null)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {selected && (
        <Card className="border-primary/40 bg-primary/5 py-4">
          <CardContent className="flex items-center gap-3">
            <PartyPopper className="size-5 text-primary" />
            <div className="flex-1 text-sm">
              <p className="font-medium">You&apos;re officially selected!</p>
              <p className="text-muted-foreground">
                Your 30-day mission is ready.
              </p>
            </div>
            <Button asChild size="sm">
              <Link href="/dashboard">Open dashboard</Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {ONBOARDING_TASKS.map((task, index) => {
        const state = view[task.key]
        const isSubmission = task.kind === "submission"
        return (
          <Card key={task.key} className="py-4">
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <div className="pt-0.5">
                {state.verified ? (
                  <CheckCircle2 className="size-5 text-primary" />
                ) : (
                  <Circle className="size-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-medium">
                    {index + 1}. {task.title}
                  </h2>
                  <TaskStatusBadge state={state} />
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {task.description}
                </p>
                {task.cta && (
                  <a
                    href={task.cta.href({ referralCode })}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1 text-xs text-primary underline-offset-4 hover:underline"
                  >
                    {task.cta.label}
                    <ExternalLink className="size-3" />
                  </a>
                )}
                {isSubmission && (
                  <SocialSubmission state={state} onUpdated={setView} />
                )}
              </div>
              {!isSubmission && (
                <div className="sm:self-center">
                  <Button
                    size="sm"
                    variant={state.verified ? "outline" : "default"}
                    disabled={pending !== null}
                    onClick={() => verify(task.key)}
                  >
                    {pending === task.key && <Loader2 className="animate-spin" />}
                    {state.verified ? "Re-check" : "Verify"}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}

function TaskStatusBadge({ state }: { state: TaskView }) {
  if (state.verified) {
    return <Badge variant="success">{state.detail ?? "Verified"}</Badge>
  }
  if (state.reviewStatus === "pending") {
    return <Badge variant="secondary">Pending review</Badge>
  }
  if (state.reviewStatus === "rejected") {
    return <Badge variant="destructive">Not approved</Badge>
  }
  return null
}

function SocialSubmission({
  state,
  onUpdated,
}: {
  state: TaskView
  onUpdated: (view: OnboardingView) => void
}) {
  const [url, setUrl] = React.useState("")
  const [submitting, setSubmitting] = React.useState(false)

  async function submit() {
    if (!url.trim()) return
    setSubmitting(true)
    try {
      const res = await fetch("/api/tasks/social", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        toast.error(data.error ?? "Submission failed.")
        return
      }
      onUpdated(data.onboarding as OnboardingView)
      setUrl("")
      toast.success("Submitted — an admin will review it shortly.")
    } catch {
      toast.error("Network error. Please try again.")
    } finally {
      setSubmitting(false)
    }
  }

  // Approved: the status badge already says it all.
  if (state.verified) return null

  if (state.reviewStatus === "pending") {
    return (
      <p className="mt-2 text-xs text-muted-foreground">
        Submitted{" "}
        <a
          href={state.url ?? "#"}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary underline-offset-4 hover:underline"
        >
          your post
        </a>{" "}
        — waiting for an admin to approve it.
      </p>
    )
  }

  return (
    <div className="mt-2 flex flex-col gap-2">
      {state.reviewStatus === "rejected" && (
        <p className="text-xs text-destructive">
          That post wasn&apos;t approved. Please share again and submit a new link.
        </p>
      )}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://linkedin.com/posts/…"
        />
        <Button size="sm" onClick={submit} disabled={submitting || !url.trim()}>
          {submitting && <Loader2 className="animate-spin" />}
          {state.reviewStatus === "rejected" ? "Resubmit" : "Submit for review"}
        </Button>
      </div>
    </div>
  )
}
