import type { LeaderboardRow } from "@/lib/points"
import { milestoneProgress } from "@/lib/missions-config"
import { Progress } from "@/components/ui/progress"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

export function Leaderboard({
  rows,
  currentStudentId,
}: {
  rows: LeaderboardRow[]
  currentStudentId: string
}) {
  if (rows.length === 0) {
    return (
      <p className="border p-4 text-sm text-muted-foreground">
        No ambassadors from your college have started yet. Sync your stats to claim
        the top spot.
      </p>
    )
  }

  return (
    <div className="border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">#</TableHead>
            <TableHead>Ambassador</TableHead>
            <TableHead className="text-right">Points</TableHead>
            <TableHead className="w-[42%]">Nearest reward</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const isYou = row.studentId === currentStudentId
            const { next, remaining, pct } = milestoneProgress(row.points)
            return (
              <TableRow
                key={row.studentId}
                className={isYou ? "bg-primary/10 hover:bg-primary/15" : undefined}
              >
                <TableCell className="font-medium">{row.rank}</TableCell>
                <TableCell>
                  {row.name}
                  {isYou && <span className="ml-2 text-xs text-primary">(you)</span>}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {row.points.toLocaleString()}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className="text-xs text-muted-foreground">
                      {next
                        ? `${remaining.toLocaleString()} pts to ${next.reward}`
                        : "All rewards unlocked 🎉"}
                    </span>
                    <Progress value={pct} />
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
