"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Bell, CheckCheck, ExternalLink, LogOut, Menu, Search, Settings, ShieldCheck } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { DemoPill } from "@/components/ui/Misc";
import { cn } from "@/lib/cn";
import { timeAgo } from "@/lib/format";
import { useNow } from "@/lib/hooks";
import { useDemoStore } from "@/lib/store";
import { toast } from "@/lib/toast";
import { OPEN_PALETTE_EVENT, useIsMac } from "./CommandPalette";
import { pageTitle } from "./nav";

function useDismiss(open: boolean, close: () => void) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) close();
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);
  return ref;
}

const TONE_DOT = {
  info: "bg-accent-2",
  success: "bg-accent-1",
  warning: "bg-warning",
  danger: "bg-loss",
} as const;

function Notifications() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const ref = useDismiss(open, close);
  const router = useRouter();
  const notifications = useDemoStore((s) => s.notifications);
  const now = useNow();
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={`Notifications${unread ? `, ${unread} unread` : ""}`}
        aria-expanded={open}
        className="relative grid size-10 place-items-center rounded-xl border border-line bg-white/[0.02] text-muted transition-colors hover:text-fg"
      >
        <Bell className="size-[18px]" />
        {unread > 0 && (
          <span className="num absolute -right-1 -top-1 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-gradient-brand px-1 text-[10px] font-bold text-ink shadow-[0_0_12px_var(--accent-1)]">
            {unread}
          </span>
        )}
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="glass-solid absolute right-0 top-12 z-50 w-[min(92vw,380px)] overflow-hidden rounded-2xl shadow-[0_30px_80px_-20px_rgba(0,0,0,0.85)]"
          >
            <div className="flex items-center justify-between border-b border-line px-4 py-3">
              <p className="text-sm font-semibold">Notifications</p>
              <button
                type="button"
                onClick={() => {
                  useDemoStore.getState().markAllRead();
                  toast.info("All caught up", "Notifications marked as read.");
                }}
                className="flex items-center gap-1 text-xs font-medium text-accent-2 hover:underline disabled:opacity-40"
                disabled={!unread}
              >
                <CheckCheck className="size-3.5" /> Mark all read
              </button>
            </div>
            <ul className="max-h-[380px] divide-y divide-line overflow-y-auto">
              {notifications.slice(0, 8).map((n) => (
                <li key={n.id}>
                  <button
                    type="button"
                    onClick={() => {
                      useDemoStore.getState().markRead(n.id);
                      close();
                      if (n.href) router.push(n.href);
                    }}
                    className="flex w-full gap-3 px-4 py-3 text-left transition-colors hover:bg-white/[0.03]"
                  >
                    <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", n.read ? "bg-white/15" : TONE_DOT[n.tone])} />
                    <span className="min-w-0">
                      <span className={cn("block text-[13px] font-medium", n.read ? "text-fg/70" : "text-fg")}>{n.title}</span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-muted">{n.body}</span>
                      <span className="mt-1 block text-[11px] text-muted/80">{now ? timeAgo(n.at, now) : ""}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function UserMenu() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const ref = useDismiss(open, close);
  const router = useRouter();
  const session = useDemoStore((s) => s.session);
  const kyc = useDemoStore((s) => s.kycStatus);
  if (!session) return null;

  const item = "flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-fg/85 transition-colors hover:bg-white/[0.05] hover:text-fg";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="Account menu"
        className="flex items-center gap-2.5 rounded-xl border border-line bg-white/[0.02] py-1 pl-1 pr-3 transition-colors hover:border-white/15"
      >
        <Avatar name={session.name} size="sm" />
        <span className="hidden text-left sm:block">
          <span className="block text-[13px] font-semibold leading-tight">{session.name}</span>
          <span className="block text-[11px] leading-tight text-muted">{kyc === "verified" ? "Verified trader" : "KYC pending"}</span>
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="glass-solid absolute right-0 top-12 z-50 w-64 rounded-2xl p-2 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.85)]"
          >
            <div className="border-b border-line px-3 pb-3 pt-2">
              <p className="text-sm font-semibold">{session.name}</p>
              <p className="truncate text-xs text-muted">{session.email}</p>
            </div>
            <div className="py-1.5">
              <Link href="/dashboard/settings" onClick={close} className={item}>
                <Settings className="size-4 text-muted" /> Settings
              </Link>
              <Link href="/admin" onClick={close} className={item}>
                <ShieldCheck className="size-4 text-warning" /> Admin preview
              </Link>
              <Link href="/" onClick={close} className={item}>
                <ExternalLink className="size-4 text-muted" /> Back to website
              </Link>
            </div>
            <div className="border-t border-line pt-1.5">
              <button
                type="button"
                className={cn(item, "text-loss hover:text-loss")}
                onClick={() => {
                  close();
                  useDemoStore.getState().logout();
                  toast.info("Signed out", "See you next session.");
                  router.push("/login");
                }}
              >
                <LogOut className="size-4" /> Log out
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SearchButton() {
  const isMac = useIsMac();
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event(OPEN_PALETTE_EVENT))}
      aria-label="Open command palette"
      className="flex h-10 items-center gap-2 rounded-xl border border-line bg-white/[0.02] px-3 text-sm text-muted transition-colors hover:border-white/15 hover:text-fg"
    >
      <Search className="size-4" />
      <span className="hidden lg:inline">Search…</span>
      <kbd className="hidden rounded-md border border-line-strong px-1.5 py-0.5 font-mono text-[10.5px] lg:inline">{isMac ? "⌘K" : "Ctrl K"}</kbd>
    </button>
  );
}

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-[#05070d]/75 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onMenu}
          aria-label="Open navigation"
          className="grid size-10 place-items-center rounded-xl border border-line text-fg lg:hidden"
        >
          <Menu className="size-5" />
        </button>
        <h1 className="min-w-0 truncate text-lg font-semibold tracking-tight">{pageTitle(pathname)}</h1>
        <DemoPill className="hidden md:inline-flex" />
        <div className="ml-auto flex items-center gap-2">
          <SearchButton />
          <Notifications />
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
