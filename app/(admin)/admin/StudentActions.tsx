"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import type { StudentStatus } from "@/lib/models/Student"
import { Button } from "@/components/ui/button"

type Action = "shortlist" | "select" | "reject"

export function StudentActions({
  id,
  status,
}: {
  id: string
  status: StudentStatus
}) {
  const router = useRouter()
  const [pending, setPending] = React.useState<Action | null>(null)

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

  const canShortlist = status === "registered"
  const canSelect = status === "shortlisted"
  const canReject = status !== "rejected" && status !== "active"

  return (
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
  )
}
