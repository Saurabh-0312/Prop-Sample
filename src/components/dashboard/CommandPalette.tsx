"use client";

import { useEffect, useRef, useState, useSyncExternalStore, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  ArrowRight,
  Award,
  CornerDownLeft,
  ExternalLink,
  Gauge,
  Layers,
  LayoutDashboard,
  LogOut,
  Palette,
  RefreshCw,
  Search,
  Settings,
  ShieldAlert,
  ShieldCheck,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
  Trophy,
  Users,
  Wallet,
} from "lucide-react";
import { palettes, paletteOrder } from "@/config/brand";
import { planLabel } from "@/data/plans";
import { cn } from "@/lib/cn";
import { runDemoAction } from "@/lib/demoActions";
import { useMounted } from "@/lib/hooks";
import { phaseLabel, useDemoStore } from "@/lib/store";
import { setPalette } from "@/lib/theme";
import { toast } from "@/lib/toast";

type Command = {
  id: string;
  group: "Navigate" | "Demo actions" | "Accounts" | "Theme";
  label: string;
  hint?: string;
  keywords?: string;
  icon: ComponentType<{ className?: string }>;
  run: () => void;
};

export const OPEN_PALETTE_EVENT = "novaedge:command-palette";

const noop = () => () => {};
export function useIsMac() {
  return useSyncExternalStore(
    noop,
    () => /Mac|iPhone|iPad/.test(navigator.platform),
    () => false,
  );
}

function score(query: string, text: string): number {
  const q = query.trim().toLowerCase();
  if (!q) return 1;
  const t = text.toLowerCase();
  const at = t.indexOf(q);
  if (at >= 0) return 200 - at;
  let from = 0;
  let total = 0;
  let streak = 0;
  for (const ch of q) {
    if (ch === " ") continue;
    const found = t.indexOf(ch, from);
    if (found < 0) return 0;
    streak = found === from ? streak + 1 : 0;
    total += 1 + streak * 2;
    from = found + 1;
  }
  return total;
}

/** ⌘K / Ctrl+K palette for pages, demo actions, accounts and themes. */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const router = useRouter();
  const mounted = useMounted();
  const isMac = useIsMac();
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const accounts = useDemoStore((s) => s.accounts);
  const selectedId = useDemoStore((s) => s.selectedAccountId);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
        setQuery("");
        setActive(0);
      }
    };
    const onOpen = () => {
      setOpen(true);
      setQuery("");
      setActive(0);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_PALETTE_EVENT, onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_PALETTE_EVENT, onOpen);
    };
  }, []);

  useEffect(() => {
    itemRefs.current[active]?.scrollIntoView({ block: "nearest" });
  }, [active]);

  const go = (href: string) => () => router.push(href);
  const target = accounts.find((a) => a.id === selectedId) ?? accounts[0];
  const act = (key: Parameters<typeof runDemoAction>[0]) => () => {
    if (!target) return;
    if (!location.pathname.startsWith("/dashboard")) router.push("/dashboard");
    runDemoAction(key, target.id);
  };

  const commands: Command[] = [
    { id: "p-overview", group: "Navigate", label: "Overview", icon: LayoutDashboard, run: go("/dashboard"), keywords: "home dashboard" },
    { id: "p-accounts", group: "Navigate", label: "Accounts", icon: Layers, run: go("/dashboard/accounts") },
    { id: "p-detail", group: "Navigate", label: "Active account details", hint: target ? `#${target.login}` : undefined, icon: Gauge, run: go(`/dashboard/accounts/${target?.id ?? ""}`), keywords: "chart candles stats calendar history" },
    { id: "p-payouts", group: "Navigate", label: "Payouts", icon: Wallet, run: go("/dashboard/payouts"), keywords: "withdraw reward" },
    { id: "p-certs", group: "Navigate", label: "Certificates", icon: Award, run: go("/dashboard/certificates") },
    { id: "p-aff", group: "Navigate", label: "Affiliate", icon: Users, run: go("/dashboard/affiliate"), keywords: "referral commission" },
    { id: "p-lead", group: "Navigate", label: "Leaderboard", icon: Trophy, run: go("/dashboard/leaderboard") },
    { id: "p-settings", group: "Navigate", label: "Settings", icon: Settings, run: go("/dashboard/settings"), keywords: "kyc 2fa profile" },
    { id: "p-admin", group: "Navigate", label: "Admin preview", icon: ShieldCheck, run: go("/admin"), keywords: "back office risk payout queue" },
    { id: "p-buy", group: "Navigate", label: "Buy a challenge", icon: ShoppingCart, run: go("/challenges"), keywords: "checkout plans" },
    { id: "p-site", group: "Navigate", label: "Website home", icon: ExternalLink, run: go("/") },
    { id: "a-win", group: "Demo actions", label: "Simulate winning trade", hint: target ? `#${target.login}` : undefined, icon: TrendingUp, run: act("win") },
    { id: "a-loss", group: "Demo actions", label: "Simulate losing trade", hint: target ? `#${target.login}` : undefined, icon: TrendingDown, run: act("loss") },
    { id: "a-push", group: "Demo actions", label: "Push toward daily limit", icon: Gauge, run: act("push"), keywords: "drawdown gauge" },
    { id: "a-breach", group: "Demo actions", label: "Trigger breach", icon: ShieldAlert, run: act("breach"), keywords: "fail daily loss" },
    { id: "a-pass", group: "Demo actions", label: "Pass phase", icon: Trophy, run: act("pass"), keywords: "target funded" },
    {
      id: "a-reset",
      group: "Demo actions",
      label: "Reset demo data",
      icon: RefreshCw,
      run: () => {
        useDemoStore.getState().resetDemo();
        toast.success("Demo reset", "All accounts, trades and payouts are back to the seeded data.");
      },
    },
    {
      id: "a-logout",
      group: "Demo actions",
      label: "Log out",
      icon: LogOut,
      run: () => {
        useDemoStore.getState().logout();
        router.push("/login");
      },
    },
    ...accounts.map((a) => ({
      id: `acc-${a.id}`,
      group: "Accounts" as const,
      label: `Switch to #${a.login} · ${planLabel(a.model, a.size)} ${phaseLabel(a)}`,
      hint: a.state.status,
      icon: ArrowRight,
      keywords: `${a.platform} ${a.state.status}`,
      run: () => {
        useDemoStore.getState().selectAccount(a.id);
        toast.success("Active account switched", `#${a.login} now drives the overview.`);
      },
    })),
    ...paletteOrder.map((id) => ({
      id: `t-${id}`,
      group: "Theme" as const,
      label: `Theme: ${palettes[id].name}`,
      hint: palettes[id].vibe,
      icon: Palette,
      keywords: "palette colour color",
      run: () => {
        setPalette(id);
        toast.info(`Theme: ${palettes[id].name}`, palettes[id].vibe);
      },
    })),
  ];

  const results = commands
    .map((c) => ({ c, s: Math.max(score(query, c.label), score(query, `${c.group} ${c.keywords ?? ""}`) * 0.6) }))
    .filter((r) => r.s > 0)
    .sort((a, b) => b.s - a.s)
    .map((r) => r.c);
  const list = query ? results : commands;
  const current = Math.min(active, Math.max(0, list.length - 1));

  const runAt = (i: number) => {
    const cmd = list[i];
    if (!cmd) return;
    setOpen(false);
    setQuery("");
    cmd.run();
  };

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[85] flex items-start justify-center px-3 pt-[12vh]">
          <motion.div
            className="absolute inset-0 bg-[#020308]/65 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 420, damping: 32 }}
            className="glass-solid relative w-full max-w-xl overflow-hidden rounded-2xl shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)] backdrop-blur-2xl"
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search className="size-4 shrink-0 text-muted" />
              <input
                autoFocus
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setActive(0);
                }}
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    setActive((i) => Math.min(list.length - 1, i + 1));
                  } else if (e.key === "ArrowUp") {
                    e.preventDefault();
                    setActive((i) => Math.max(0, i - 1));
                  } else if (e.key === "Enter") {
                    e.preventDefault();
                    runAt(current);
                  } else if (e.key === "Escape") {
                    setOpen(false);
                  }
                }}
                placeholder="Search pages, actions, accounts, themes…"
                aria-label="Search commands"
                className="h-14 flex-1 bg-transparent text-[15px] text-fg outline-none placeholder:text-muted/80"
              />
              <kbd className="rounded-md border border-line-strong px-1.5 py-0.5 font-mono text-[11px] text-muted">Esc</kbd>
            </div>
            <div className="max-h-[min(56vh,420px)] overflow-y-auto p-2" role="listbox" aria-label="Commands">
              {list.length === 0 && <p className="px-3 py-10 text-center text-sm text-muted">No results for “{query}”.</p>}
              {list.map((cmd, i) => {
                const header = !query && (i === 0 || list[i - 1].group !== cmd.group) ? cmd.group : null;
                const on = i === current;
                return (
                  <div key={cmd.id}>
                    {header && <p className="px-3 pb-1.5 pt-3 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted">{header}</p>}
                    <button
                      ref={(el) => {
                        itemRefs.current[i] = el;
                      }}
                      type="button"
                      role="option"
                      aria-selected={on}
                      onMouseMove={() => setActive(i)}
                      onClick={() => runAt(i)}
                      className={cn(
                        "relative flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm transition-colors",
                        on ? "bg-accent-2/[0.1] text-fg" : "text-fg/85",
                      )}
                    >
                      {on && <span className="absolute inset-y-2 left-0 w-[3px] rounded-r-full bg-gradient-brand" />}
                      <cmd.icon className={cn("size-4 shrink-0", on ? "text-accent-2" : "text-muted")} />
                      <span className="min-w-0 flex-1 truncate">{cmd.label}</span>
                      {cmd.hint && <span className="shrink-0 text-xs capitalize text-muted">{cmd.hint}</span>}
                      {on && <CornerDownLeft className="size-3.5 shrink-0 text-muted" />}
                    </button>
                  </div>
                );
              })}
            </div>
            <div className="flex items-center justify-between border-t border-line px-4 py-2.5 text-[11px] text-muted">
              <span>↑↓ navigate · ↵ run · esc close</span>
              <span>{isMac ? "⌘" : "Ctrl"} K to toggle</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
