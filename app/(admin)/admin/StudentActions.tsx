"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ExternalLink } from "lucide-react"
import { toast } from "sonner"

import type { StudentStatus } from "@/lib/models/Student"
import type { ReviewStatus } from "@/lib/onboarding-service"
import { Button } from "@/components/ui/button"

type Action = "shortlist" | "select" | "reject"

export function StudentActions({
  id,
  status,
  social,
}: {
  id: string
  status: StudentStatus
  social: { url: string | null; reviewStatus: ReviewStatus | null }
}) {
  const router = useRouter()
  const [pending, setPending] = React.useState<Action | null>(null)
  const [reviewing, setReviewing] = React.useState(false)

  async function run(action: Action) {
    setPending(action)
    try {
      const res = await fetch(`/api/admin/students/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        toast.error(data.error ?? "Action failed.")
        return
      }
      toast.success(`Marked as ${data.status}.`)
      router.refresh()
    } catch {
      toast.error("Network error. Please try again.")
    } finally {
      setPending(null)
    }
  }

  async function reviewSocial(decision: "approve" | "reject") {
    setReviewing(true)
    try {
      const res = await fetch(`/api/admin/students/${id}/social`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        toast.error(data.error ?? "Review failed.")
        return
      }
      toast.success(decision === "approve" ? "Post approved." : "Post rejected.")
      router.refresh()
    } catch {
      toast.error("Network error. Please try again.")
    } finally {
      setReviewing(false)
    }
  }

  const canShortlist = status === "registered"
  const canSelect = status === "shortlisted"
  const canReject = status !== "rejected" && status !== "active"

  return (
    <div className="flex flex-col items-end gap-2">
      {social.reviewStatus === "pending" && (
        <div className="flex items-center gap-1.5">
          {social.url && (
            <a
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-primary underline-offset-4 hover:underline"
            >
              View post
              <ExternalLink className="size-3" />
            </a>
          )}
          <Button
            size="xs"
            disabled={reviewing}
            onClick={() => reviewSocial("approve")}
          >
            Approve
          </Button>
          <Button
            size="xs"
            variant="ghost"
            disabled={reviewing}
            onClick={() => reviewSocial("reject")}
          >
            Reject
          </Button>
        </div>
      )}
      {social.reviewStatus === "approved" && (
        <span className="text-xs text-muted-foreground">Social: approved</span>
      )}
      {social.reviewStatus === "rejected" && (
        <span className="text-xs text-muted-foreground">Social: rejected</span>
      )}
      <div className="flex justify-end gap-1.5">
      {canShortlist && (
        <Button
          size="xs"
          variant="outline"
          disabled={pending !== null}
          onClick={() => run("shortlist")}
        >
          Shortlist
        </Button>
      )}
      {canSelect && (
        <Button
          size="xs"
          disabled={pending !== null}
          onClick={() => run("select")}
        >
          Select
        </Button>
      )}
      {canReject && (
        <Button
          size="xs"
          variant="ghost"
          disabled={pending !== null}
          onClick={() => run("reject")}
        >
          Reject
        </Button>
      )}
      </div>
    </div>
  )
}
