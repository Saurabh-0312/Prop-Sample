"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, KeyRound, RotateCcw, Star, Wallet } from "lucide-react";
import { LiveDot } from "@/components/fx/LiveDot";
import { PhaseBadge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Misc";
import { Segmented } from "@/components/ui/Segmented";
import { CredentialRow } from "@/components/checkout/CheckoutSuccess";
import { MODELS, planLabel } from "@/data/plans";
import { cn } from "@/lib/cn";
import { formatDate, formatNumber, formatPct, formatUSD } from "@/lib/format";
import { tradeStats } from "@/lib/stats";
import { isLive, phaseLabel, useDemoStore } from "@/lib/store";
import { toast } from "@/lib/toast";
import { AccountBanner } from "./AccountBanner";
import { TIMEFRAMES, type Timeframe } from "./CandleChart";
import { ObjectivesPanel } from "./ObjectivesPanel";
import { PnlCalendar } from "./PnlCalendar";
import { TradeHistory } from "./TradeHistory";

const CandleChart = dynamic(() => import("./CandleChart"), {
  ssr: false,
  loading: () => <Skeleton className="h-[380px] w-full rounded-xl" />,
});

const CHART_SYMBOLS = ["XAUUSD", "EURUSD", "NAS100", "BTCUSD"];

function Stat({ label, value, hint, tone }: { label: string; value: string; hint?: string; tone?: "profit" | "loss" }) {
  return (
    <div className="rounded-2xl border border-line bg-[#0a0e17]/80 p-4">
      <p className="text-xs text-muted">{label}</p>
      <p className={cn("num mt-1.5 text-xl font-semibold tracking-tight", tone === "profit" && "text-profit", tone === "loss" && "text-loss")}>{value}</p>
      {hint && <p className="mt-0.5 text-[11px] text-muted">{hint}</p>}
    </div>
  );
}

export function AccountDetailView() {
  const params = useParams<{ id: string }>();
  const account = useDemoStore((s) => s.accounts.find((a) => a.id === params.id));
  const selectedId = useDemoStore((s) => s.selectedAccountId);
  const [symbol, setSymbol] = useState("XAUUSD");
  const [tf, setTf] = useState<Timeframe>("M15");

  if (!account) {
    return (
      <div className="card mx-auto max-w-lg rounded-3xl p-10 text-center">
        <p className="text-lg font-semibold">Account not found</p>
        <p className="mt-2 text-sm text-muted">It may have been removed when the demo was reset.</p>
        <Button href="/dashboard/accounts" className="mt-6" iconLeft={<ArrowLeft className="size-4" />}>
          All accounts
        </Button>
      </div>
    );
  }

  const s = tradeStats(account.trades, account.state.initialBalance);
  const m = MODELS[account.model];
  const live = isLive(account);

  return (
    <div className="space-y-6">
      <div>
        <Link href="/dashboard/accounts" className="inline-flex items-center gap-1.5 text-sm text-muted hover:text-fg">
          <ArrowLeft className="size-4" /> All accounts
        </Link>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="flex flex-wrap items-center gap-2.5 text-2xl font-semibold tracking-tight sm:text-[28px]">
              {planLabel(account.model, account.size)} · {phaseLabel(account)}
              <PhaseBadge account={account} />
              <StatusBadge account={account} />
            </h2>
            <p className="num mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted">
              <span>#{account.login}</span>
              <span className="rounded-md border border-line px-2 py-0.5 text-[11px]">{account.platform}</span>
              <span>{m.name}</span>
              <span>Since {formatDate(account.createdAt)}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {selectedId !== account.id && (
              <Button
                variant="secondary"
                size="sm"
                iconLeft={<Star className="size-3.5" />}
                onClick={() => {
                  useDemoStore.getState().selectAccount(account.id);
                  toast.success("Active account switched", `#${account.login} now drives the live simulation.`);
                }}
              >
                Make active
              </Button>
            )}
            {account.phase === "funded" && (
              <Button href="/dashboard/payouts" size="sm" iconLeft={<Wallet className="size-3.5" />}>
                Request payout
              </Button>
            )}
            {account.state.status === "breached" && (
              <Button
                size="sm"
                iconLeft={<RotateCcw className="size-3.5" />}
                onClick={() => {
                  const r = useDemoStore.getState().resetAccount(account.id);
                  toast.success("Account reset (−20%)", r.message);
                }}
              >
                Reset account
              </Button>
            )}
          </div>
        </div>
      </div>

      <AccountBanner account={account} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_340px]">
        <section className="card flex flex-col rounded-2xl p-4 sm:p-5" aria-label="Price chart">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2.5">
              <LiveDot className="hidden sm:inline-flex" />
              <Segmented size="sm" ariaLabel="Symbol" options={CHART_SYMBOLS.map((v) => ({ value: v, label: v }))} value={symbol} onChange={setSymbol} />
            </div>
            <Segmented
              size="sm"
              ariaLabel="Timeframe"
              options={(Object.keys(TIMEFRAMES) as Timeframe[]).map((v) => ({ value: v, label: v }))}
              value={tf}
              onChange={setTf}
            />
          </div>
          <div className="flex min-h-[380px] flex-1 flex-col">
            <CandleChart key={`${symbol}-${tf}`} symbol={symbol} tf={tf} />
          </div>
        </section>

        <div className="space-y-4">
          <section className="card rounded-2xl p-5" aria-label="Credentials">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-base font-semibold">Credentials</h2>
              <span className={cn("flex items-center gap-1.5 text-xs", live ? "text-accent-1" : "text-muted")}>
                {live ? <LiveDot className="size-1.5" /> : null}
                {live ? "Trading enabled" : "Trading disabled"}
              </span>
            </div>
            <div className="space-y-2">
              <CredentialRow label="Login" value={account.login} />
              <CredentialRow label="Server" value={account.server} />
              <CredentialRow label="Password" value={account.password} secret />
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="mt-3 w-full"
              iconLeft={<KeyRound className="size-3.5" />}
              onClick={() => {
                useDemoStore.getState().resetPassword(account.id);
                toast.success("Password reset", "A new trading password was issued and emailed to you.");
              }}
            >
              Reset password
            </Button>
          </section>
          <section className="card rounded-2xl p-5 text-sm" aria-label="Rules">
            <h2 className="mb-3 text-base font-semibold">Rule snapshot</h2>
            <dl className="space-y-2">
              {[
                ["Profit target", account.rules.profitTargetPct ? formatPct(account.rules.profitTargetPct, 0) : "None"],
                ["Daily loss", formatPct(account.rules.dailyLossPct, 0)],
                ["Max loss", `${formatPct(account.rules.maxLossPct, 0)} ${account.rules.maxLossType}`],
                ["Min trading days", account.rules.minTradingDays ? String(account.rules.minTradingDays) : "None"],
                ["Reward share", formatPct(account.rewardShare, 0)],
                ["Leverage", m.leverage],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-3">
                  <dt className="text-muted">{k}</dt>
                  <dd className="num font-medium capitalize">{v}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Win rate" value={formatPct(s.winRate, 1)} hint={`${s.count} trades`} />
        <Stat label="Profit factor" value={s.profitFactor >= 99 ? "∞" : s.profitFactor.toFixed(2)} hint="Gross win ÷ gross loss" />
        <Stat label="Avg win" value={formatUSD(s.avgWin)} tone="profit" />
        <Stat label="Avg loss" value={formatUSD(s.avgLoss)} tone={s.avgLoss < 0 ? "loss" : undefined} />
        <Stat label="Best day" value={formatUSD(s.bestDay)} tone={s.bestDay > 0 ? "profit" : undefined} />
        <Stat label="Total lots" value={formatNumber(s.totalLots, 2)} />
        <Stat label="Expectancy" value={formatUSD(s.expectancy)} hint="Average P/L per trade" tone={s.expectancy >= 0 ? "profit" : "loss"} />
        <Stat label="Sharpe" value={s.sharpe.toFixed(2)} hint="Annualised, daily returns" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <ObjectivesPanel account={account} />
        <PnlCalendar trades={account.trades} anchor={account.createdAt} />
      </div>

      <TradeHistory trades={account.trades} />
    </div>
  );
}
