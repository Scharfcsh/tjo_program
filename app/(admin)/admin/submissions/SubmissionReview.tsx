"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"

export function SubmissionReview({ id }: { id: string }) {
  const router = useRouter()
  const [pending, setPending] = React.useState(false)

  async function review(decision: "approve" | "reject") {
    setPending(true)
    try {
      const res = await fetch(`/api/admin/submissions/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision }),
      })
      const data = await res.json()
      if (!res.ok || !data.ok) {
        toast.error(data.error ?? "Review failed.")
        return
      }
      toast.success(decision === "approve" ? "Approved." : "Rejected.")
      router.refresh()
    } catch {
      toast.error("Network error. Please try again.")
    } finally {
      setPending(false)
    }
  }

  return (
    <div className="flex justify-end gap-1.5">
      <Button size="xs" disabled={pending} onClick={() => review("approve")}>
        Approve
      </Button>
      <Button
        size="xs"
        variant="ghost"
        disabled={pending}
        onClick={() => review("reject")}
      >
        Reject
      </Button>
    </div>
  )
}
