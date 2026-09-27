"use client";

import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, Percent, Scale, Wallet, Activity } from "lucide-react";
import { LiveDot } from "@/components/fx/LiveDot";
import { NumberRoll } from "@/components/fx/NumberRoll";
import { SpotlightCard } from "@/components/fx/SpotlightCard";
import { cn } from "@/lib/cn";
import { formatPct, formatUSD } from "@/lib/format";
import { getObjectives } from "@/lib/rules";
import { availablePayout, isLive } from "@/lib/store";
import type { TradingAccount } from "@/lib/types";

function Kpi({ label, icon, children, foot, live }: { label: string; icon: ReactNode; children: ReactNode; foot?: ReactNode; live?: boolean }) {
  return (
    <SpotlightCard className="rounded-2xl p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <span className="flex items-center gap-2 text-[13px] text-muted">
          {label}
          {live && <LiveDot className="size-1.5" />}
        </span>
        <span className="grid size-8 place-items-center rounded-lg bg-white/[0.04] text-muted [&>svg]:size-4">{icon}</span>
      </div>
      <div className="mt-3 text-[22px] font-semibold tracking-tight sm:text-[26px]">{children}</div>
      {foot && <div className="mt-1.5 text-xs text-muted">{foot}</div>}
    </SpotlightCard>
  );
}

export function KpiCards({ account }: { account: TradingAccount }) {
  const o = getObjectives(account.state, account.rules);
  const live = isLive(account);
  const today = o.todayPnl;
  const up = today >= 0;
  const funded = account.phase === "funded";
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      <Kpi label="Balance" icon={<Wallet />} foot={`Initial ${formatUSD(account.state.initialBalance, 0)}`}>
        <NumberRoll value={account.state.balance} format="usd" />
      </Kpi>
      <Kpi label="Equity" icon={<Activity />} live={live} foot={live ? "Updates every tick" : "Trading disabled"}>
        <NumberRoll value={account.state.equity} format="usd" flash={live} />
      </Kpi>
      <Kpi
        label="Today’s P/L"
        icon={up ? <ArrowUpRight /> : <ArrowDownRight />}
        live={live}
        foot={`${formatPct(today / account.state.initialBalance, 2, true)} of initial balance`}
      >
        <span className={cn("inline-flex items-center gap-1", Math.abs(today) < 0.005 ? "text-fg" : up ? "text-profit" : "text-loss")}>
          {Math.abs(today) >= 0.005 && (up ? <ArrowUpRight className="size-5 shrink-0" /> : <ArrowDownRight className="size-5 shrink-0" />)}
          <NumberRoll value={today} format="usd" signed flash={live} />
        </span>
      </Kpi>
      <Kpi
        label="Reward Share"
        icon={funded ? <Scale /> : <Percent />}
        foot={funded ? <>Available now <span className="num text-fg">{formatUSD(availablePayout(account))}</span></> : "Up to 90% with add-on"}
      >
        <NumberRoll value={account.rewardShare} format="pct1" />
      </Kpi>
    </div>
  );
}
