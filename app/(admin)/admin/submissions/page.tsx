import { ExternalLink } from "lucide-react"

import { connectToDatabase } from "@/lib/db"
import { Student } from "@/lib/models/Student"
import { Submission } from "@/lib/models/Submission"
import type { SubmissionType } from "@/lib/missions-config"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { SubmissionReview } from "./SubmissionReview"

export const dynamic = "force-dynamic"

const TYPE_LABEL: Record<SubmissionType, string> = {
  linkedin: "LinkedIn post",
  whatsapp_promo: "WhatsApp promo",
  review: "Review",
}

export default async function AdminSubmissionsPage() {
  await connectToDatabase()
  const docs = await Submission.find({ status: "pending" })
    .sort({ createdAt: 1 })
    .limit(200)
    .lean()

  const students = await Student.find({
    _id: { $in: docs.map((d) => d.studentId) },
  })
    .select("name email")
    .lean()
  const studentById = new Map(students.map((s) => [String(s._id), s]))

  const rows = docs.map((d) => {
    const student = studentById.get(String(d.studentId))
    return {
      id: String(d._id),
      type: d.type as SubmissionType,
      url: d.url,
      createdAt: new Date(d.createdAt),
      name: student?.name ?? "Unknown",
      email: student?.email ?? "",
    }
  })

  return (
    <main className="mx-auto w-full max-w-6xl p-6">
      <header className="mb-6">
        <h1 className="text-lg font-medium">Submission review queue</h1>
        <p className="text-sm text-muted-foreground">
          Approve or reject mission proof. Approving updates the intern&apos;s points
          and leaderboard rank instantly.
        </p>
      </header>

      <div className="border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Intern</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Proof</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Review</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  Nothing pending. All caught up. 🎉
                </TableCell>
              </TableRow>
            )}
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>
                  <div className="font-medium">{r.name}</div>
                  <div className="text-xs text-muted-foreground">{r.email}</div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{TYPE_LABEL[r.type]}</Badge>
                </TableCell>
                <TableCell className="max-w-[260px]">
                  <a
                    href={r.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 truncate text-primary underline-offset-4 hover:underline"
                  >
                    <span className="truncate">{r.url}</span>
                    <ExternalLink className="size-3 shrink-0" />
                  </a>
                </TableCell>
                <TableCell className="text-xs text-muted-foreground">
                  {r.createdAt.toLocaleString()}
                </TableCell>
                <TableCell className="text-right">
                  <SubmissionReview id={r.id} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  )
}
