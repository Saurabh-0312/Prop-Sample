"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { LiveDot } from "@/components/fx/LiveDot";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { brand } from "@/config/brand";
import { cn } from "@/lib/cn";
import { useDemoStore } from "@/lib/store";
import { DASH_NAV, isNavActive } from "./nav";

export function SidebarContent({ onNavigate, layoutId = "dash-nav" }: { onNavigate?: () => void; layoutId?: string }) {
  const pathname = usePathname();
  const liveCount = useDemoStore((s) => s.accounts.filter((a) => a.state.status === "active" || a.state.status === "funded").length);

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center px-5">
        <Logo href="/dashboard" />
      </div>
      <div className="px-3 pt-3">
        <div className="mb-3 flex items-center justify-between rounded-xl border border-line bg-white/[0.02] px-3 py-2 text-xs text-muted">
          <span className="flex items-center gap-2">
            <LiveDot className="size-1.5" /> {brand.server}
          </span>
          <span className="num">{liveCount} live</span>
        </div>
      </div>
      <nav aria-label="Dashboard" className="flex-1 space-y-1 px-3">
        {DASH_NAV.map((item) => {
          const active = isNavActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                active ? "text-fg" : "text-muted hover:bg-white/[0.03] hover:text-fg",
              )}
            >
              {active && (
                <motion.span
                  layoutId={layoutId}
                  className="absolute inset-0 -z-10 rounded-xl border border-white/[0.08] bg-[linear-gradient(90deg,color-mix(in_oklab,var(--accent-2)_14%,transparent),transparent)]"
                  transition={{ type: "spring", stiffness: 420, damping: 36 }}
                >
                  <span className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-gradient-brand shadow-[0_0_12px_var(--accent-2)]" />
                </motion.span>
              )}
              <item.icon className={cn("size-[18px] transition-colors", active ? "text-accent-2" : "text-muted group-hover:text-fg")} />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <div className="p-4">
        <div className="rounded-2xl border border-line bg-[linear-gradient(160deg,color-mix(in_oklab,var(--accent-3)_14%,transparent),transparent_60%)] p-4">
          <p className="text-sm font-semibold">Ready for the next level?</p>
          <p className="mt-1 text-xs text-muted">Add another account — up to $200K.</p>
          <Button href="/challenges" size="sm" fullWidth className="mt-3" iconLeft={<Plus className="size-3.5" />} onClick={onNavigate}>
            Buy Challenge
          </Button>
        </div>
      </div>
    </div>
  );
}

export function Sidebar() {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[264px] border-r border-line bg-elevated/80 backdrop-blur-xl lg:block">
      <SidebarContent />
    </aside>
  );
}
