"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowRight, Download, Plus } from "lucide-react";
import { SpotlightCard } from "@/components/fx/SpotlightCard";
import { PhaseBadge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PnL } from "@/components/ui/Misc";
import { Progress } from "@/components/ui/Progress";
import { Segmented } from "@/components/ui/Segmented";
import { MODELS, planLabel } from "@/data/plans";
import { formatDate, formatUSD } from "@/lib/format";
import { getObjectives } from "@/lib/rules";
import { availablePayout, useDemoStore } from "@/lib/store";
import { toast } from "@/lib/toast";
import type { TradingAccount } from "@/lib/types";

type Filter = "all" | "active" | "funded" | "passed" | "breached";

const matches = (a: TradingAccount, f: Filter) =>
  f === "all" ? true : f === "active" ? a.state.status === "active" : a.state.status === f;

export function AccountsListView() {
  const accounts = useDemoStore((s) => s.accounts);
  const orders = useDemoStore((s) => s.orders);
  const selectedId = useDemoStore((s) => s.selectedAccountId);
  const [filter, setFilter] = useState<Filter>("all");
  const shown = accounts.filter((a) => matches(a, filter));
  const count = (f: Filter) => accounts.filter((a) => matches(a, f)).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Your accounts</h2>
          <p className="text-sm text-muted">Every evaluation and funded account, with its own rule snapshot.</p>
        </div>
        <Button href="/challenges" size="sm" iconLeft={<Plus className="size-3.5" />}>
          Buy challenge
        </Button>
      </div>

      <div className="-mx-1 overflow-x-auto px-1 no-scrollbar">
        <Segmented
          size="sm"
          ariaLabel="Filter accounts"
          options={(["all", "active", "funded", "passed", "breached"] as Filter[]).map((f) => ({
            value: f,
            label: `${f[0].toUpperCase()}${f.slice(1)} ${count(f)}`,
          }))}
          value={filter}
          onChange={setFilter}
        />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
        {shown.map((a) => {
          const o = getObjectives(a.state, a.rules);
          return (
            <SpotlightCard key={a.id} className="flex flex-col rounded-2xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold">{planLabel(a.model, a.size)}</p>
                  <p className="num text-xs text-muted">
                    #{a.login} · {a.platform} · {MODELS[a.model].name}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <PhaseBadge account={a} />
                  <StatusBadge account={a} />
                </div>
              </div>
              <div className="mt-5 grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-[11px] text-muted">Balance</p>
                  <p className="num font-semibold">{formatUSD(a.state.balance, 0)}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted">Equity</p>
                  <p className="num font-semibold">{formatUSD(a.state.equity, 0)}</p>
                </div>
                <div>
                  <p className="text-[11px] text-muted">Total P/L</p>
                  <PnL value={a.state.balance - a.state.initialBalance} decimals={0} className="text-sm font-semibold" />
                </div>
              </div>
              <div className="mt-4 min-h-[34px]">
                {a.phase === "funded" ? (
                  <p className="text-xs text-muted">
                    Reward available <span className="num font-semibold text-fg">{formatUSD(availablePayout(a))}</span> ·{" "}
                    {Math.round(a.rewardShare * 100)}% share
                  </p>
                ) : o.profitTarget ? (
                  <>
                    <div className="mb-1.5 flex justify-between text-[11px] text-muted">
                      <span>Profit target</span>
                      <span className="num">{Math.round(o.profitProgress * 100)}%</span>
                    </div>
                    <Progress value={o.profitProgress} />
                  </>
                ) : null}
              </div>
              <div className="mt-5 flex items-center gap-2 border-t border-line pt-4">
                <Button href={`/dashboard/accounts/${a.id}`} size="sm" variant="secondary" className="flex-1" iconRight={<ArrowRight className="size-3.5" />}>
                  Details
                </Button>
                <Button
                  size="sm"
                  variant={selectedId === a.id ? "ghost" : "outline"}
                  className="flex-1"
                  disabled={selectedId === a.id}
                  onClick={() => {
                    useDemoStore.getState().selectAccount(a.id);
                    toast.success("Active account switched", `#${a.login} now drives the overview and simulation.`);
                  }}
                >
                  {selectedId === a.id ? "Active on overview" : "Make active"}
                </Button>
              </div>
            </SpotlightCard>
          );
        })}
        {shown.length === 0 && (
          <div className="card col-span-full rounded-2xl p-10 text-center text-sm text-muted">No accounts in this state yet.</div>
        )}
      </div>

      <section className="card overflow-hidden rounded-2xl" aria-label="Orders">
        <div className="px-5 pb-2 pt-5">
          <h2 className="text-base font-semibold">Orders &amp; invoices</h2>
          <p className="text-xs text-muted">Purchases and resets made in this demo session.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-muted">
                <th className="px-5 py-3 font-medium">Order</th>
                <th className="px-3 py-3 font-medium">Item</th>
                <th className="px-3 py-3 font-medium">Method</th>
                <th className="px-3 py-3 font-medium">Date</th>
                <th className="px-3 py-3 text-right font-medium">Amount</th>
                <th className="px-5 py-3 text-right font-medium">Invoice</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-line/60 last:border-0">
                  <td className="num px-5 py-3 text-muted">{o.id}</td>
                  <td className="px-3 py-3">
                    {o.label}
                    {o.coupon && <span className="ml-2 rounded-md bg-accent-1/10 px-1.5 py-0.5 text-[11px] text-accent-1">{o.coupon}</span>}
                  </td>
                  <td className="px-3 py-3 capitalize text-muted">{o.method}</td>
                  <td className="px-3 py-3 text-muted">{formatDate(o.at)}</td>
                  <td className="num px-3 py-3 text-right font-semibold">{formatUSD(o.amount)}</td>
                  <td className="px-5 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => toast.success("Invoice downloaded", `${o.id}.pdf saved to your downloads.`)}
                      className="inline-flex items-center gap-1 text-xs font-medium text-accent-2 hover:underline"
                    >
                      <Download className="size-3.5" /> PDF
                    </button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-sm text-muted">
                    No orders yet this session —{" "}
                    <Link href="/challenges" className="text-accent-2 hover:underline">
                      buy a challenge
                    </Link>{" "}
                    and it will appear here.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
