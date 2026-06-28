import Link from "next/link"
import {
  ArrowRight,
  Briefcase,
  FileSearch,
  FileText,
  Gift,
  HelpCircle,
  IndianRupee,
  Info,
  LayoutGrid,
  LogOut,
  Mail,
  Mic,
  Pencil,
  Settings,
  Share2,
  Sparkles,
  User,
  Users,
  type LucideIcon,
} from "lucide-react"

import { connectToDatabase } from "@/lib/db"
import { getShowcase, type ReferralPlan } from "@/lib/models/Showcase"

import { CopyButton } from "./CopyButton"

export const dynamic = "force-dynamic"

function inr(n: number) {
  return `₹${n.toLocaleString("en-IN")}`
}

const PLAN_BADGE: Record<ReferralPlan, { label: string; className: string }> = {
  premium: { label: "Premium", className: "bg-emerald-100 text-emerald-700" },
  pro: { label: "Pro", className: "bg-emerald-100 text-emerald-700" },
  free: { label: "Pending", className: "bg-amber-100 text-amber-700" },
}

const MENU: { label: string; icon: LucideIcon; soon?: boolean }[] = [
  { label: "Dashboard", icon: LayoutGrid },
  { label: "Resume Analyser", icon: FileSearch },
  { label: "Cover Letter & Outreach", icon: Mail },
  { label: "My Resumes", icon: FileText },
  { label: "Jobs", icon: Briefcase },
  { label: "AI Interviews", icon: Mic, soon: true },
]

export default async function ShowcasePage() {
  await connectToDatabase()
  const s = await getShowcase()
  const year = new Date().getFullYear()

  return (
    <div className="flex h-svh overflow-hidden bg-white text-[#1a1a1a]">
      {/* Decorative app sidebar */}
      <aside className="hidden h-svh w-64 shrink-0 flex-col overflow-y-auto bg-[#0b0f0e] px-3 py-5 text-[#cbd5d1] md:flex">
        <div className="px-2 pb-6">
          <span className="text-lg font-extrabold tracking-tight text-white">
            TOP<span className="text-emerald-400">JOB</span>OFFER
          </span>
        </div>

        <SidebarLabel>Menu</SidebarLabel>
        <nav className="flex flex-col gap-0.5">
          {MENU.map((item) => (
            <SidebarItem key={item.label} icon={item.icon} label={item.label} soon={item.soon} />
          ))}
        </nav>

        <SidebarLabel className="mt-5">Personal</SidebarLabel>
        <nav className="flex flex-col gap-0.5">
          <SidebarItem icon={User} label="Profile" />
          <div className="flex items-center justify-between rounded-md px-3 py-2 text-sm">
            <span className="flex items-center gap-2.5 text-emerald-400">
              <Sparkles className="size-4" />
              Premium
            </span>
            <span className="text-xs text-[#7c8a85]">Manage</span>
          </div>
        </nav>

        <div className="flex-1" />

        {/* Active: Invite & Earn promo */}
        <div className="mb-3 rounded-xl border border-white/10 bg-white/[0.03] p-3">
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-white">
            <Gift className="size-4 text-emerald-400" />
            <div>
              Invite &amp; Earn
              <div className="text-xs font-normal text-[#7c8a85]">Up to ₹10,000</div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-1.5 rounded-lg bg-emerald-400 px-3 py-2 text-sm font-semibold text-emerald-950">
            Refer a friend
            <ArrowRight className="size-4" />
          </div>
        </div>

        <nav className="flex flex-col gap-0.5">
          <SidebarItem icon={Settings} label="Settings" />
          <SidebarItem icon={HelpCircle} label="FAQs" />
          <SidebarItem icon={LogOut} label="Log out" />
        </nav>
        <p className="px-3 pt-3 text-[11px] text-[#5b6863]">© TopJobOffer {year}</p>
      </aside>

      {/* Main panel */}
      <main className="flex flex-1 flex-col overflow-hidden px-5 py-8 sm:px-10">
        <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col overflow-hidden">
          <div className="mb-1 flex items-start justify-between gap-4">
            <h1 className="text-2xl font-bold tracking-tight">Invite &amp; Earn</h1>
            <Link
              href="/admin/showcase/edit"
              className="inline-flex items-center gap-1.5 text-xs text-[#8A938D] underline-offset-4 hover:text-foreground hover:underline"
            >
              <Pencil className="size-3" />
              Edit numbers
            </Link>
          </div>
          <p className="mb-8 text-sm text-[#8A938D]">
            Share TopJobOffer with your colleagues and friends and earn payouts for every
            successful referral.
          </p>

          <div className="grid gap-5 lg:grid-cols-2">
            {/* Total earned */}
            <div className="rounded-2xl border border-[#E7E3D9] p-6">
              <div className="flex items-start justify-between">
                <span className="text-xs font-semibold tracking-wide text-[#8A938D] uppercase">
                  Total earned
                </span>
                <span className="flex size-8 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                  <IndianRupee className="size-4" />
                </span>
              </div>
              <div className="mt-6 flex items-end justify-between">
                <div>
                  <div className="text-4xl font-bold">{inr(s.totalEarned)}</div>
                  <div className="mt-1 text-sm text-[#8A938D]">Transferable to bank</div>
                </div>
                <span className="text-5xl leading-none" aria-hidden>
                  💰
                </span>
              </div>
            </div>

            {/* Referral link */}
            <div className="rounded-2xl border border-[#E7E3D9] p-6">
              <div className="flex items-start justify-between">
                <span className="text-xs font-semibold tracking-wide text-[#8A938D] uppercase">
                  Your referral link
                </span>
                <span className="flex size-8 items-center justify-center rounded-lg bg-indigo-50 text-indigo-500">
                  <Share2 className="size-4" />
                </span>
              </div>
              <div className="mt-6 flex flex-col gap-2">
                <div className="truncate rounded-lg bg-[#f5f5f4] px-3 py-2.5 text-sm text-[#6b6b6b]">
                  {s.referralLink}
                </div>
                <CopyButton text={s.referralLink} />
              </div>
            </div>
          </div>

          {/* How it works */}
          <div className="mt-5 flex gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
            <Info className="mt-0.5 size-4 shrink-0 text-emerald-600" />
            <div className="text-sm">
              <p className="font-semibold">How does the referral program work?</p>
              <p className="mt-1 text-[#5f6b66]">
                Share your link with candidates. Once they sign up, finish onboarding, and make
                their first purchase, you earn ₹500 directly, and they get ₹200 wallet cashback!
                Payouts are reconciled on the 1st of every month.
              </p>
            </div>
          </div>

          {/* Referred users */}
          <div className="mt-6 flex min-h-0 flex-1 flex-col rounded-2xl border border-[#E7E3D9]">
            <div className="flex items-center justify-between p-5">
              <h2 className="text-lg font-bold">Referred Users</h2>
              <span className="inline-flex items-center gap-1.5 text-sm text-[#8A938D]">
                <Users className="size-4" />
                {s.referrals.length} sign-ups
              </span>
            </div>
            <div className="min-h-0 flex-1 overflow-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="sticky top-0 z-10 border-y border-[#E7E3D9] bg-[#faf9f7] text-left text-[11px] tracking-wide text-[#8A938D] uppercase">
                    <th className="px-5 py-3 font-medium">Friend details</th>
                    <th className="px-5 py-3 font-medium">Date joined</th>
                    <th className="px-5 py-3 font-medium">Status</th>
                    <th className="px-5 py-3 text-right font-medium">Your earnings</th>
                  </tr>
                </thead>
                <tbody>
                  {s.referrals.map((r, i) => {
                    const badge = PLAN_BADGE[r.plan]
                    return (
                      <tr key={`${r.email}-${i}`} className="border-b border-[#F1EEE7] last:border-0">
                        <td className="px-5 py-4">
                          <div className="font-semibold">{r.name}</div>
                          <div className="text-xs text-indigo-400">{r.email}</div>
                        </td>
                        <td className="px-5 py-4 text-[#6b6b6b]">
                          {r.joinedAt.toLocaleDateString("en-US")}
                        </td>
                        <td className="px-5 py-4">
                          <span
                            className={
                              "inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold tracking-wide uppercase " +
                              badge.className
                            }
                          >
                            {badge.label}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right font-semibold">
                          {r.earned > 0 ? inr(r.earned) : "₹0"}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

function SidebarLabel({
  children,
  className = "",
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <p className={"px-3 pb-1 text-[10px] font-semibold tracking-widest text-[#5b6863] uppercase " + className}>
      {children}
    </p>
  )
}

function SidebarItem({
  icon: Icon,
  label,
  soon,
}: {
  icon: LucideIcon
  label: string
  soon?: boolean
}) {
  return (
    <div className="flex items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-white/[0.04]">
      <span className="flex items-center gap-2.5">
        <Icon className="size-4" />
        {label}
      </span>
      {soon && (
        <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-medium tracking-wide text-[#9aa8a3] uppercase">
          Soon
        </span>
      )}
    </div>
  )
}
