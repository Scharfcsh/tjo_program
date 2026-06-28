"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Inbox, Users } from "lucide-react"

export function AdminNav({ pendingCount }: { pendingCount: number }) {
  const pathname = usePathname()
  if (pathname === "/admin/login") return null

  const tabs = [
    { href: "/admin", label: "Applications", icon: Users, exact: true },
    {
      href: "/admin/submissions",
      label: "Submissions",
      icon: Inbox,
      badge: pendingCount,
    },
  ]

  return (
    <header className="border-b">
      <div className="mx-auto flex w-full max-w-6xl items-center gap-1 px-6">
        <span className="mr-3 text-xs font-medium tracking-wide text-primary uppercase">
          Admin
        </span>
        <nav className="flex">
          {tabs.map((tab) => {
            const active = tab.exact
              ? pathname === tab.href
              : pathname.startsWith(tab.href)
            const Icon = tab.icon
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={
                  "inline-flex items-center gap-1.5 border-b-2 px-3 py-3 text-sm transition-colors " +
                  (active
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground")
                }
              >
                <Icon className="size-4" />
                {tab.label}
                {tab.badge ? (
                  <span className="ml-0.5 inline-flex min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                    {tab.badge}
                  </span>
                ) : null}
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
