import { DashboardNav } from "./DashboardNav"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-svh">
      <DashboardNav />
      {children}
    </div>
  )
}
