import { connectToDatabase } from "@/lib/db"
import { Submission } from "@/lib/models/Submission"

import { AdminNav } from "./AdminNav"

export const dynamic = "force-dynamic"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  let pending = 0
  try {
    await connectToDatabase()
    pending = await Submission.countDocuments({ status: "pending" })
  } catch {
    // DB may be unavailable on the login page; the nav still renders.
  }

  return (
    <div className="min-h-svh">
      <AdminNav pendingCount={pending} />
      {children}
    </div>
  )
}
