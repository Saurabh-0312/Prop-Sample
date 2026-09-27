"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { ArrowRight, Plus, Wallet } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { PhaseBadge, StatusBadge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Misc";
import { MODELS, planLabel } from "@/data/plans";
import { useNow } from "@/lib/hooks";
import { selectSelected, useDemoStore } from "@/lib/store";
import { AccountBanner, EmptyAccounts } from "./AccountBanner";
import { AccountSwitcher } from "./AccountCards";
import { KpiCards } from "./KpiCards";
import { ObjectivesPanel } from "./ObjectivesPanel";
import { TradesTable } from "./TradesTable";

const EquityChart = dynamic(() => import("./EquityChart"), {
  ssr: false,
  loading: () => <Skeleton className="h-[420px] rounded-2xl" />,
});

function greeting(now: number) {
  if (!now) return "Welcome back";
  const h = new Date(now).getHours();
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}

export function OverviewView() {
  const account = useDemoStore(selectSelected);
  const session = useDemoStore((s) => s.session);
  const now = useNow();

  if (!account) return <EmptyAccounts />;
  const first = session?.name.split(" ")[0] ?? "Trader";
  const funded = account.phase === "funded";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm text-muted">
            {greeting(now)}, {first}
          </p>
          <h2 className="mt-1 flex flex-wrap items-center gap-2.5 text-2xl font-semibold tracking-tight sm:text-[28px]">
            {planLabel(account.model, account.size)} {MODELS[account.model].name.replace(MODELS[account.model].shortName, "").trim()}
            <PhaseBadge account={account} />
            <StatusBadge account={account} />
          </h2>
        </div>
        <div className="flex gap-2">
          <Button href={`/dashboard/accounts/${account.id}`} variant="secondary" size="sm" iconRight={<ArrowRight className="size-3.5" />}>
            Account details
          </Button>
          {funded ? (
            <Button href="/dashboard/payouts" size="sm" iconLeft={<Wallet className="size-3.5" />}>
              Request payout
            </Button>
          ) : (
            <Button href="/challenges" size="sm" iconLeft={<Plus className="size-3.5" />}>
              New challenge
            </Button>
          )}
        </div>
      </div>

      <AccountSwitcher />
      <AccountBanner account={account} />
      <KpiCards account={account} />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1.45fr]">
        <ObjectivesPanel account={account} />
        <EquityChart key={account.id} account={account} height={360} />
      </div>

      <section className="card overflow-hidden rounded-2xl" aria-label="Recent trades">
        <div className="flex items-center justify-between gap-3 px-5 pb-2 pt-5">
          <div>
            <h2 className="text-base font-semibold">Recent trades</h2>
            <p className="text-xs text-muted">Closed positions stream in as they happen.</p>
          </div>
          <Link href={`/dashboard/accounts/${account.id}#history`} className="inline-flex items-center gap-1 text-sm font-medium text-accent-2 hover:underline">
            Full history <ArrowRight className="size-3.5" />
          </Link>
        </div>
        <TradesTable trades={account.trades.slice(0, 8)} relative animateNew />
      </section>
    </div>
  );
}
