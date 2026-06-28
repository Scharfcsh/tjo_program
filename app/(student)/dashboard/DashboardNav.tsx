"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { LogOut, Trophy, Target } from "lucide-react"

import { Button } from "@/components/ui/button"

const TABS = [
  { href: "/dashboard", label: "Tasks", icon: Target },
  { href: "/dashboard/leaderboard", label: "Leaderboard", icon: Trophy },
] as const

export function DashboardNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [signingOut, setSigningOut] = React.useState(false)

  async function signOut() {
    setSigningOut(true)
    try {
      await fetch("/api/portal/sign-out", { method: "POST" })
    } finally {
      router.push("/portal/sign-in")
    }
  }

  return (
    <header className="border-b">
      <div className="mx-auto flex w-full max-w-4xl items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-1">
          <span className="mr-3 text-xs font-medium tracking-wide text-primary uppercase">
            TopJobOffer
          </span>
          <nav className="flex">
            {TABS.map((tab) => {
              const active =
                tab.href === "/dashboard"
                  ? pathname === "/dashboard"
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
                </Link>
              )
            })}
          </nav>
        </div>
        <Button variant="ghost" size="sm" onClick={signOut} disabled={signingOut}>
          <LogOut className="size-4" />
          Sign out
        </Button>
      </div>
    </header>
  )
}
