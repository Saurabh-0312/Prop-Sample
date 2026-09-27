"use client";

import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight, BadgeCheck, CircleDollarSign, Percent, Scale, ShoppingCart, Wallet } from "lucide-react";
import { NumberRoll } from "@/components/fx/NumberRoll";
import { SpotlightCard } from "@/components/fx/SpotlightCard";
import { ADMIN_KPIS, PAYOUT_QUEUE } from "@/data/admin";
import { cn } from "@/lib/cn";
import { formatPct } from "@/lib/format";
import { useDemoStore } from "@/lib/store";

function Delta({ value, invert }: { value: number; invert?: boolean }) {
  const good = invert ? value < 0 : value > 0;
  return (
    <span className={cn("num inline-flex items-center gap-0.5 text-xs font-medium", good ? "text-profit" : "text-loss")}>
      {value > 0 ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
      {formatPct(value, 1, true)}
    </span>
  );
}

function Kpi({ label, icon, children, foot }: { label: string; icon: ReactNode; children: ReactNode; foot: ReactNode }) {
  return (
    <SpotlightCard className="rounded-2xl p-4 sm:p-5">
      <div className="flex items-center justify-between">
        <span className="text-[13px] text-muted">{label}</span>
        <span className="grid size-8 place-items-center rounded-lg bg-white/[0.04] text-muted [&>svg]:size-4">{icon}</span>
      </div>
      <div className="mt-3 text-[26px] font-semibold tracking-tight">{children}</div>
      <div className="mt-1 flex items-center gap-2 text-xs text-muted">{foot}</div>
    </SpotlightCard>
  );
}

export function KpiGrid() {
  const decided = useDemoStore((s) => Object.keys(s.adminDecisions).filter((id) => PAYOUT_QUEUE.some((q) => q.id === id)).length);
  const k = ADMIN_KPIS;
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 2xl:grid-cols-6">
      <Kpi label="Revenue (30d)" icon={<CircleDollarSign />} foot={<><Delta value={k.revenueDelta} /> vs prior 30d</>}>
        <NumberRoll value={k.revenue30d / 1_000_000} format="dec2" prefix="$" suffix="M" countUp />
      </Kpi>
      <Kpi label="Orders" icon={<ShoppingCart />} foot={<><Delta value={k.ordersDelta} /> AOV $258</>}>
        <NumberRoll value={k.orders} format="int" countUp />
      </Kpi>
      <Kpi label="Pass Rate" icon={<Percent />} foot={<><Delta value={k.passRateDelta} /> all phases</>}>
        <NumberRoll value={k.passRate} format="pct1" countUp />
      </Kpi>
      <Kpi label="Funded Accounts" icon={<BadgeCheck />} foot={<><Delta value={k.fundedDelta} /> active</>}>
        <NumberRoll value={k.funded} format="int" countUp />
      </Kpi>
      <Kpi label="Payout Ratio" icon={<Scale />} foot={<><Delta value={k.payoutRatioDelta} invert /> payouts ÷ fees</>}>
        <NumberRoll value={k.payoutRatio} format="pct1" countUp />
      </Kpi>
      <Kpi label="Pending Payouts" icon={<Wallet />} foot={<>{decided ? `${decided} decided this session` : "Awaiting review"}</>}>
        <NumberRoll value={k.pendingPayouts - decided} format="int" countUp />
      </Kpi>
    </div>
  );
}
