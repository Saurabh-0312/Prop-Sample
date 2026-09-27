"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  Check,
  Gamepad2,
  Gauge,
  LayoutDashboard,
  RefreshCw,
  ShieldAlert,
  TrendingDown,
  TrendingUp,
  Trophy,
  X,
} from "lucide-react";
import { palettes, paletteOrder } from "@/config/brand";
import { cn } from "@/lib/cn";
import { runDemoAction, type DemoActionKey } from "@/lib/demoActions";
import { formatUSD } from "@/lib/format";
import { getObjectives, usageTone } from "@/lib/rules";
import { accountLabel, isLive, useDemoStore } from "@/lib/store";
import { setPalette, usePalette } from "@/lib/theme";
import { toast } from "@/lib/toast";
import { Kbd } from "@/components/ui/Misc";
import type { TradingAccount } from "@/lib/types";

const ACTIONS: { key: DemoActionKey; label: string; hint: string; icon: typeof Gauge; tone: string }[] = [
  { key: "win", label: "Winning trade", hint: "+$1.2K – $2.5K", icon: TrendingUp, tone: "text-profit bg-profit/10 border-profit/20" },
  { key: "loss", label: "Losing trade", hint: "−$0.8K – $1.8K", icon: TrendingDown, tone: "text-loss bg-loss/10 border-loss/20" },
  { key: "push", label: "Push to daily limit", hint: "Gauge → gold → red", icon: Gauge, tone: "text-warning bg-warning/10 border-warning/20" },
  { key: "breach", label: "Trigger breach", hint: "Daily loss exceeded", icon: ShieldAlert, tone: "text-loss bg-loss/10 border-loss/25" },
  { key: "pass", label: "Pass phase", hint: "Target + min days", icon: Trophy, tone: "text-accent-1 bg-accent-1/10 border-accent-1/20" },
];

function Meter({ label, used, detail }: { label: string; used: number; detail: string }) {
  const tone = usageTone(used);
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-[11px]">
        <span className="text-muted">{label}</span>
        <span className={cn("num font-semibold", tone === "danger" ? "text-loss" : tone === "warn" ? "text-warning" : "text-fg")}>
          {Math.round(used * 100)}% used
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
        <div
          className={cn(
            "h-full rounded-full transition-[width,background-color] duration-700 ease-expo",
            tone === "danger" ? "bg-loss" : tone === "warn" ? "bg-warning" : "bg-gradient-brand",
          )}
          style={{ width: `${Math.max(2, used * 100)}%` }}
        />
      </div>
      <p className="num mt-1 text-[10.5px] text-muted">{detail}</p>
    </div>
  );
}

/** Live readout so the presenter sees the rules engine react even while the panel covers the page. */
function RiskMonitor({ account }: { account: TradingAccount }) {
  const o = getObjectives(account.state, account.rules);
  const status = account.state.status;
  return (
    <div className="mb-3 rounded-2xl border border-line bg-[#080c15] p-3">
      <div className="mb-2.5 flex items-center justify-between text-[11px]">
        <span className="font-semibold uppercase tracking-wider text-muted">Risk engine</span>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 font-semibold",
            status === "breached" ? "bg-loss/15 text-loss" : status === "passed" ? "bg-profit/15 text-profit" : "bg-accent-1/12 text-accent-1",
          )}
        >
          {status === "breached" ? "Breached" : status === "passed" ? "Passed" : "Monitoring"}
        </span>
      </div>
      <div className="space-y-2.5">
        <Meter label="Daily loss" used={o.dailyUsedPct} detail={`Equity ${formatUSD(account.state.equity)} · floor ${formatUSD(o.dailyFloor, 0)}`} />
        <Meter label="Max loss" used={o.maxUsedPct} detail={`${account.rules.maxLossType} floor ${formatUSD(o.maxFloor, 0)}`} />
        {o.profitTarget !== null && (
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-muted">Profit target</span>
            <span className="num font-semibold text-fg">
              {Math.round(o.profitProgress * 100)}% · days {Math.min(o.tradingDays, o.minTradingDays)}/{o.minTradingDays}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

export function DemoControls() {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const palette = usePalette();
  const inDashboard = pathname.startsWith("/dashboard");
  const hideLauncher = pathname === "/login" || pathname === "/signup";

  const hydrated = useDemoStore((s) => s.hydrated);
  const accounts = useDemoStore((s) => s.accounts);
  const selectedId = useDemoStore((s) => s.selectedAccountId);
  const selected = accounts.find((a) => a.id === selectedId) ?? accounts[0];

  // Shift + D toggles the panel (handy while presenting).
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable)) return;
      if (e.shiftKey && (e.key === "D" || e.key === "d")) setOpen((o) => !o);
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (!confirmReset) return;
    const t = setTimeout(() => setConfirmReset(false), 3500);
    return () => clearTimeout(t);
  }, [confirmReset]);

  const run = (key: DemoActionKey) => {
    if (!selected) return;
    const ok = runDemoAction(key, selected.id);
    // Breach / pass open a full-screen modal — get the panel out of the way.
    if (ok && (key === "breach" || key === "pass")) setOpen(false);
  };

  const reset = () => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    useDemoStore.getState().resetDemo();
    setConfirmReset(false);
    toast.success("Demo reset", "All accounts, trades and payouts are back to the seeded data.");
  };

  if (hideLauncher) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[60] flex flex-col items-end gap-3 sm:bottom-5 sm:right-5">
      <AnimatePresence>
        {open && (
          <motion.div
            ref={panelRef}
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 380, damping: 30 }}
            style={{ transformOrigin: "bottom right" }}
            className="glass-solid max-h-[min(78dvh,680px)] w-[min(calc(100vw-2rem),340px)] overflow-y-auto rounded-3xl p-4 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.85)] backdrop-blur-2xl"
            role="dialog"
            aria-label="Demo controls"
          >
            <div className="mb-3 flex items-start justify-between gap-3">
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold">
                  <Gamepad2 className="size-4 text-accent-1" /> Demo Controls
                </p>
                <p className="mt-0.5 text-xs text-muted">
                  {inDashboard ? "Drive the risk engine live." : "Preview the product live."}{" "}
                  <span className="hidden sm:inline">
                    <Kbd>Shift</Kbd> + <Kbd>D</Kbd>
                  </span>
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close demo controls"
                className="grid size-8 place-items-center rounded-full text-muted hover:bg-white/[0.06] hover:text-fg"
              >
                <X className="size-4" />
              </button>
            </div>

            {inDashboard && hydrated && selected && (
              <section className="mb-4">
                <label htmlFor="demo-target" className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted">
                  Target account
                </label>
                <select
                  id="demo-target"
                  className="field h-10 text-[13px]"
                  value={selected.id}
                  onChange={(e) => useDemoStore.getState().selectAccount(e.target.value)}
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      #{a.login} · {accountLabel(a)} · {a.state.status}
                    </option>
                  ))}
                </select>
                {!isLive(selected) && (
                  <p className="mt-1.5 text-[11.5px] text-warning">This account isn’t live — pick an active or funded one.</p>
                )}
                <div className="mt-3">
                  <RiskMonitor account={selected} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  {ACTIONS.map((a) => (
                    <button
                      key={a.key}
                      type="button"
                      onClick={() => run(a.key)}
                      className={cn(
                        "group flex items-start gap-2.5 rounded-2xl border border-line bg-white/[0.025] p-2.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-white/15 hover:bg-white/[0.05] active:translate-y-0",
                        a.key === "pass" && "col-span-2",
                      )}
                    >
                      <span className={cn("grid size-8 shrink-0 place-items-center rounded-xl border", a.tone)}>
                        <a.icon className="size-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[12.5px] font-semibold leading-tight text-fg">{a.label}</span>
                        <span className="mt-0.5 block text-[11px] leading-tight text-muted">{a.hint}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </section>
            )}

            {!inDashboard && (
              <button
                type="button"
                onClick={() => {
                  const s = useDemoStore.getState();
                  if (!s.session) s.loginDemo();
                  setOpen(false);
                  router.push("/dashboard");
                }}
                className="mb-4 flex w-full items-center gap-3 rounded-2xl border border-line bg-white/[0.025] p-3 text-left transition-colors hover:border-white/15 hover:bg-white/[0.05]"
              >
                <span className="grid size-9 place-items-center rounded-xl bg-gradient-brand text-ink">
                  <LayoutDashboard className="size-4" />
                </span>
                <span>
                  <span className="block text-[13px] font-semibold">Open live dashboard</span>
                  <span className="block text-[11.5px] text-muted">Trades, gauges, breach &amp; pass demos</span>
                </span>
              </button>
            )}

            <section>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted">Theme</p>
              <div className="grid grid-cols-3 gap-2">
                {paletteOrder.map((id) => {
                  const p = palettes[id];
                  const active = palette === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      title={`${p.name} — ${p.vibe}`}
                      onClick={() => {
                        setPalette(id);
                        toast.info(`Theme: ${p.name}`, p.vibe);
                      }}
                      aria-pressed={active}
                      className={cn(
                        "relative flex flex-col items-center gap-2 rounded-2xl border px-2 py-2.5 text-center transition-all duration-200",
                        active ? "border-accent-2/50 bg-accent-2/[0.07]" : "border-line bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.04]",
                      )}
                    >
                      <span
                        className="h-5 w-full rounded-lg"
                        style={{ background: `linear-gradient(135deg, ${p.accents[0]}, ${p.accents[1]}, ${p.accents[2]})` }}
                      />
                      <span className="text-[11.5px] font-semibold leading-tight">{p.name}</span>
                      {active && (
                        <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-accent-2 text-ink">
                          <Check className="size-2.5" strokeWidth={3.5} />
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </section>

            <button
              type="button"
              onClick={reset}
              className={cn(
                "mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border px-3 py-2.5 text-[13px] font-medium transition-colors",
                confirmReset
                  ? "border-loss/40 bg-loss/10 text-loss"
                  : "border-line text-muted hover:border-white/15 hover:text-fg",
              )}
            >
              <RefreshCw className="size-3.5" />
              {confirmReset ? "Click again to reset all demo data" : "Reset Demo"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-label="Demo Controls"
        className={cn(
          "group relative flex h-12 items-center gap-2 overflow-hidden rounded-full border border-line-strong bg-[#0b111c]/90 pl-2 pr-2 sm:pr-4 text-[13px] font-semibold shadow-[0_12px_40px_-10px_rgba(0,0,0,0.9)] backdrop-blur-xl transition-all duration-300 hover:border-accent-2/50",
          open && "border-accent-2/50",
        )}
      >
        <span className="grid size-8 place-items-center rounded-full bg-gradient-brand text-ink shadow-[0_0_18px_-4px_var(--accent-1)]">
          <Gamepad2 className="size-4" />
        </span>
        <span className="hidden sm:inline">Demo Controls</span>
        <span className="absolute inset-0 -z-10 rounded-full opacity-0 transition-opacity duration-300 group-hover:opacity-100 [background:radial-gradient(120px_circle_at_30%_50%,color-mix(in_oklab,var(--accent-2)_18%,transparent),transparent)]" />
      </button>
    </div>
  );
}
