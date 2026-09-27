"use client";

import Link from "next/link";
import { ArrowRight, BadgeCheck, RotateCcw, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { MODELS } from "@/data/plans";
import { formatDateTime, formatUSD } from "@/lib/format";
import { useDemoStore } from "@/lib/store";
import { toast } from "@/lib/toast";
import type { TradingAccount } from "@/lib/types";

/** Contextual banner for breached / passed accounts. */
export function AccountBanner({ account }: { account: TradingAccount }) {
  const child = useDemoStore((s) => s.accounts.find((a) => a.parentId === account.id));

  if (account.state.status === "breached") {
    const reset = Math.round(MODELS[account.model].prices[account.size] * 0.8);
    return (
      <div className="flex flex-col gap-4 rounded-2xl border border-loss/30 bg-[linear-gradient(90deg,color-mix(in_oklab,var(--loss)_12%,transparent),transparent)] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-start gap-3">
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-loss" />
          <div>
            <p className="text-sm font-semibold text-fg">
              Account #{account.login} was breached{account.breach ? ` · ${account.breach.rule === "DAILY_LOSS" ? "daily loss limit" : "max loss limit"}` : ""}
            </p>
            <p className="text-xs text-muted">
              {account.breach ? `Equity hit ${formatUSD(account.breach.equity)} on ${formatDateTime(account.breach.at)}. ` : ""}
              Trading is disabled. Reset with 20% off or start a new challenge.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => useDemoStore.setState({ event: { type: "breach", accountId: account.id, at: Date.now() } })}
          >
            Breach report
          </Button>
          <Button
            size="sm"
            iconLeft={<RotateCcw className="size-3.5" />}
            onClick={() => {
              const r = useDemoStore.getState().resetAccount(account.id);
              toast.success("Account reset (−20%)", `${r.message} Paid ${formatUSD(reset, 0)}.`);
            }}
          >
            Reset · {formatUSD(reset, 0)}
          </Button>
        </div>
      </div>
    );
  }

  if (account.state.status === "passed") {
    return (
      <div className="flex flex-col gap-4 rounded-2xl border border-profit/25 bg-[linear-gradient(90deg,color-mix(in_oklab,var(--profit)_10%,transparent),transparent)] p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div className="flex items-start gap-3">
          <BadgeCheck className="mt-0.5 size-5 shrink-0 text-profit" />
          <div>
            <p className="text-sm font-semibold">Objectives met — account #{account.login} passed</p>
            <p className="text-xs text-muted">
              {child
                ? `Your ${child.phase === "funded" ? "funded" : "Phase 2"} account #${child.login} is live.`
                : account.note ?? "Complete KYC to unlock your funded account."}
            </p>
          </div>
        </div>
        {child ? (
          <Button size="sm" iconRight={<ArrowRight className="size-3.5" />} onClick={() => useDemoStore.getState().selectAccount(child.id)}>
            Switch to #{child.login}
          </Button>
        ) : (
          <Button href="/dashboard/settings#kyc" size="sm" iconRight={<ArrowRight className="size-3.5" />}>
            Complete KYC
          </Button>
        )}
      </div>
    );
  }
  return null;
}

export function EmptyAccounts() {
  return (
    <div className="card flex flex-col items-center rounded-3xl px-6 py-16 text-center">
      <p className="text-lg font-semibold">No trading accounts yet</p>
      <p className="mt-2 max-w-sm text-sm text-muted">Buy your first challenge — your account appears here the moment checkout completes.</p>
      <Link href="/challenges" className="mt-6">
        <span className="btn-primary inline-flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold">
          Browse challenges <ArrowRight className="size-4" />
        </span>
      </Link>
    </div>
  );
}
