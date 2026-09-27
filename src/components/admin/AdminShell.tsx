"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { Activity, ArrowLeft, Blocks, LayoutDashboard, ShieldAlert, Wallet } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { LogoMark } from "@/components/ui/Logo";
import { DemoPill } from "@/components/ui/Misc";
import { brand } from "@/config/brand";

export const ADMIN_NAV = [
  { href: "#overview", label: "Overview", icon: Activity },
  { href: "#risk", label: "Risk Console", icon: ShieldAlert },
  { href: "#payouts", label: "Payout Queue", icon: Wallet },
  { href: "#builder", label: "Challenge Builder", icon: Blocks },
];

export function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="relative min-h-dvh">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_60%_40%_at_70%_-10%,color-mix(in_oklab,var(--warning)_7%,transparent),transparent)]"
      />
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[248px] flex-col border-r border-line bg-elevated/85 backdrop-blur-xl lg:flex">
        <div className="flex h-16 items-center gap-2.5 px-5">
          <LogoMark className="size-8" />
          <span className="text-[15px] font-semibold">{brand.shortName}</span>
          <span className="rounded-md border border-warning/40 bg-warning/12 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-warning">
            Admin
          </span>
        </div>
        <nav aria-label="Admin" className="mt-4 flex-1 space-y-1 px-3">
          {ADMIN_NAV.map((n) => (
            <a
              key={n.href}
              href={n.href}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted transition-colors hover:bg-white/[0.04] hover:text-fg"
            >
              <n.icon className="size-[18px]" />
              {n.label}
            </a>
          ))}
        </nav>
        <div className="space-y-1 border-t border-line p-3">
          <Link href="/dashboard" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted hover:bg-white/[0.04] hover:text-fg">
            <LayoutDashboard className="size-[18px]" /> Trader dashboard
          </Link>
          <Link href="/" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted hover:bg-white/[0.04] hover:text-fg">
            <ArrowLeft className="size-[18px]" /> Back to website
          </Link>
        </div>
      </aside>

      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-30 border-b border-line bg-[#05070d]/75 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <span className="flex items-center gap-2 lg:hidden">
              <LogoMark className="size-7" />
              <span className="rounded-md border border-warning/40 bg-warning/12 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-warning">
                Admin
              </span>
            </span>
            <h1 className="hidden text-lg font-semibold tracking-tight sm:block">Back office</h1>
            <DemoPill className="hidden md:inline-flex" />
            <div className="ml-auto flex items-center gap-3">
              <span className="hidden rounded-full border border-line px-2.5 py-1 text-[11px] text-muted sm:inline">2FA enforced · IP allow-listed</span>
              <span className="flex items-center gap-2.5 rounded-xl border border-line bg-white/[0.02] py-1 pl-1 pr-3">
                <Avatar name="Ops Lead" size="sm" />
                <span className="hidden text-left sm:block">
                  <span className="block text-[13px] font-semibold leading-tight">Maya Chen</span>
                  <span className="block text-[11px] leading-tight text-muted">Super Admin</span>
                </span>
              </span>
            </div>
          </div>
          <nav aria-label="Admin sections" className="flex gap-1 overflow-x-auto border-t border-line px-3 py-2 no-scrollbar lg:hidden">
            {ADMIN_NAV.map((n) => (
              <a key={n.href} href={n.href} className="flex shrink-0 items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs text-muted">
                <n.icon className="size-3.5" /> {n.label}
              </a>
            ))}
            <Link href="/dashboard" className="flex shrink-0 items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs text-muted">
              <LayoutDashboard className="size-3.5" /> Dashboard
            </Link>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-[1480px] px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pt-8">{children}</main>
      </div>
    </div>
  );
}
