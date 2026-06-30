import Link from "next/link"

import { connectToDatabase } from "@/lib/db"
import { Student, STUDENT_STATUSES, type StudentStatus } from "@/lib/models/Student"
import { Mission } from "@/lib/models/Mission"
import { Submission } from "@/lib/models/Submission"
import { Badge } from "@/components/ui/badge"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { StudentActions } from "./StudentActions"
import { statusBadgeVariant } from "./status"

export const dynamic = "force-dynamic"

type SearchParams = Promise<{ status?: string }>

export default async function AdminPage({
  searchParams,
}: {
  searchParams: SearchParams
}) {
  const { status } = await searchParams
  const activeStatus =
    status && (STUDENT_STATUSES as readonly string[]).includes(status)
      ? (status as StudentStatus)
      : undefined

  await connectToDatabase()
  const query = activeStatus ? { status: activeStatus } : {}
  const docs = await Student.find(query).sort({ createdAt: -1 }).limit(200).lean()

  // Global points + rank for monitoring (ranked by points, earliest update wins ties).
  const missions = await Mission.find()
    .select("studentId pointsTotal")
    .sort({ pointsTotal: -1, updatedAt: 1 })
    .lean()
  const pointsById = new Map<string, number>()
  const rankById = new Map<string, number>()
  missions.forEach((m, i) => {
    const id = String(m.studentId)
    pointsById.set(id, m.pointsTotal)
    rankById.set(id, i + 1)
  })
  const totalPoints = missions.reduce((sum, m) => sum + m.pointsTotal, 0)

  const students = docs.map((d) => {
    const id = String(d._id)
    return {
      id,
      name: d.name,
      email: d.email,
      college: d.college,
      mobile: d.mobile,
      semester: d.semester,
      status: d.status as StudentStatus,
      referralCode: d.referralCode,
      points: pointsById.get(id) ?? null,
      rank: rankById.get(id) ?? null,
    }
  })

  const counts = await Student.aggregate<{ _id: StudentStatus; n: number }>([
    { $group: { _id: "$status", n: { $sum: 1 } } },
  ])
  const countByStatus = new Map(counts.map((c) => [c._id, c.n]))
  const total = counts.reduce((sum, c) => sum + c.n, 0)
  const activeCount =
    (countByStatus.get("active") ?? 0) + (countByStatus.get("selected") ?? 0)
  const pendingSubmissions = await Submission.countDocuments({ status: "pending" })

  return (
    <main className="mx-auto w-full max-w-6xl p-6">
      <header className="mb-6">
        <h1 className="text-lg font-medium">Ambassador applications</h1>
        <p className="text-sm text-muted-foreground">
          Review registrations, shortlist into onboarding, and monitor performance.
        </p>
      </header>

      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard label="Total interns" value={total.toLocaleString()} />
        <MetricCard
          label="Active ambassadors"
          value={activeCount.toLocaleString()}
        />
        <MetricCard
          label="Pending submissions"
          value={pendingSubmissions.toLocaleString()}
        />
        <MetricCard
          label="Points distributed"
          value={totalPoints.toLocaleString()}
        />
      </div>

      <nav className="mb-4 flex flex-wrap gap-2 text-xs">
        <FilterTab label={`All (${total})`} href="/admin" active={!activeStatus} />
        {STUDENT_STATUSES.map((s) => (
          <FilterTab
            key={s}
            label={`${s} (${countByStatus.get(s) ?? 0})`}
            href={`/admin?status=${s}`}
            active={activeStatus === s}
          />
        ))}
      </nav>

      <div className="border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>College</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Sem</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Points</TableHead>
              <TableHead className="text-right">Rank</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-muted-foreground">
                  No students{activeStatus ? ` with status “${activeStatus}”` : ""} yet.
                </TableCell>
              </TableRow>
            )}
            {students.map((s) => (
              <TableRow key={s.id}>
                <TableCell>
                  <div className="font-medium">{s.name}</div>
                  <div className="font-mono text-xs text-muted-foreground">
                    {s.referralCode}
                  </div>
                </TableCell>
                <TableCell className="max-w-[180px] truncate" title={s.college}>
                  {s.college}
                </TableCell>
                <TableCell>
                  <div>{s.email}</div>
                  <div className="text-xs text-muted-foreground">{s.mobile}</div>
                </TableCell>
                <TableCell>{s.semester}</TableCell>
                <TableCell>
                  <Badge variant={statusBadgeVariant(s.status)}>{s.status}</Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {s.points !== null ? s.points.toLocaleString() : "—"}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {s.rank !== null ? `#${s.rank}` : "—"}
                </TableCell>
                <TableCell className="text-right">
                  <StudentActions id={s.id} status={s.status} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </main>
  )
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <Card className="gap-1 py-4">
      <CardHeader className="pb-0">
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-xl">{value}</CardTitle>
      </CardHeader>
    </Card>
  )
}

function FilterTab({
  label,
  href,
  active,
}: {
  label: string
  href: string
  active: boolean
}) {
  return (
    <Link
      href={href}
      className={
        "border px-2.5 py-1 capitalize transition-colors " +
        (active
          ? "border-primary bg-primary/10 text-primary"
          : "border-border text-muted-foreground hover:text-foreground")
      }
    >
      {label}
    </Link>
  )
}
