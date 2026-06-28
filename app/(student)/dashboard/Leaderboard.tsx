import type { LeaderboardRow } from "@/lib/points"
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
        No ambassadors have started their mission yet. Sync your stats to claim
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
            <TableHead>College</TableHead>
            <TableHead className="text-right">Points</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const isYou = row.studentId === currentStudentId
            return (
              <TableRow
                key={row.studentId}
                className={isYou ? "bg-primary/10 hover:bg-primary/15" : undefined}
              >
                <TableCell className="font-medium">{row.rank}</TableCell>
                <TableCell>
                  {row.name}
                  {isYou && (
                    <span className="ml-2 text-xs text-primary">(you)</span>
                  )}
                </TableCell>
                <TableCell className="max-w-[200px] truncate" title={row.college}>
                  {row.college}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {row.points.toLocaleString()}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
