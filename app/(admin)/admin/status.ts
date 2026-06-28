import type { StudentStatus } from "@/lib/models/Student"

type BadgeVariant = "default" | "secondary" | "destructive" | "outline" | "success"

export function statusBadgeVariant(status: StudentStatus): BadgeVariant {
  switch (status) {
    case "selected":
    case "active":
      return "success"
    case "shortlisted":
      return "default"
    case "rejected":
      return "destructive"
    default:
      return "secondary"
  }
}
