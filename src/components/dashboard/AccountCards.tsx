"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { PhaseBadge, StatusBadge } from "@/components/ui/Badge";
import { Progress } from "@/components/ui/Progress";
import { MODELS, planLabel } from "@/data/plans";
import { cn } from "@/lib/cn";
import { formatUSD } from "@/lib/format";
import { getObjectives } from "@/lib/rules";
import { availablePayout, useDemoStore } from "@/lib/store";
import type { TradingAccount } from "@/lib/types";

export function AccountCard({ account, selected, onSelect }: { account: TradingAccount; selected: boolean; onSelect: () => void }) {
  const o = getObjectives(account.state, account.rules);
  const funded = account.phase === "funded";
  const payout = availablePayout(account);
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        "relative flex w-[276px] shrink-0 flex-col rounded-2xl border p-4 text-left transition-all duration-300",
        selected
          ? "border-transparent bg-[linear-gradient(160deg,color-mix(in_oklab,var(--accent-2)_13%,#0c1220),#0a0e17_70%)] shadow-[0_18px_50px_-24px_var(--accent-2)]"
          : "border-line bg-[#0a0e17]/80 hover:-translate-y-0.5 hover:border-white/15",
      )}
    >
      {selected && (
        <motion.span
          layoutId="acc-selected"
          className="pointer-events-none absolute inset-0 rounded-2xl border border-accent-2/55 shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]"
          transition={{ type: "spring", stiffness: 420, damping: 36 }}
        />
      )}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[15px] font-semibold">{planLabel(account.model, account.size)}</p>
          <p className="num mt-0.5 text-[11px] text-muted">
            #{account.login} · {account.platform}
          </p>
        </div>
        <PhaseBadge account={account} />
      </div>
      <div className="mt-4 flex items-end justify-between gap-2">
        <div>
          <p className="text-[11px] text-muted">Balance</p>
          <p className="num text-lg font-semibold">{formatUSD(account.state.balance)}</p>
        </div>
        <StatusBadge account={account} />
      </div>
      <div className="mt-3 min-h-[26px]">
        {funded ? (
          <p className="text-xs text-muted">
            Reward available <span className="num font-semibold text-fg">{formatUSD(payout)}</span>
          </p>
        ) : o.profitTarget ? (
          <>
            <div className="mb-1.5 flex justify-between text-[11px] text-muted">
              <span>{MODELS[account.model].phases === 2 ? (account.phase === "phase-2" ? "Phase 2" : "Phase 1") : "Target"}</span>
              <span className="num">{Math.round(o.profitProgress * 100)}%</span>
            </div>
            <Progress value={o.profitProgress} height="xs" />
          </>
        ) : null}
      </div>
    </button>
  );
}

export function AccountSwitcher() {
  const accounts = useDemoStore((s) => s.accounts);
  const selectedId = useDemoStore((s) => s.selectedAccountId);
  return (
    <div className="-mx-4 overflow-x-auto px-4 pb-2 no-scrollbar sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="flex w-max gap-3">
        {accounts.map((a) => (
          <AccountCard key={a.id} account={a} selected={a.id === selectedId} onSelect={() => useDemoStore.getState().selectAccount(a.id)} />
        ))}
        <Link
          href="/challenges"
          className="flex w-[180px] shrink-0 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-line-strong text-sm text-muted transition-colors hover:border-accent-2/50 hover:text-fg"
        >
          <span className="grid size-10 place-items-center rounded-xl bg-white/[0.04]">
            <Plus className="size-5" />
          </span>
          New challenge
        </Link>
      </div>
    </div>
  );
}
