"use client";

import { AnimatePresence, motion } from "motion/react";
import { Check, X } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { flag } from "@/data/countries";
import { PAYOUT_QUEUE } from "@/data/admin";
import { PAYOUT_METHODS } from "@/data/payouts";
import { cn } from "@/lib/cn";
import { formatUSD } from "@/lib/format";
import { useDemoStore } from "@/lib/store";
import { toast } from "@/lib/toast";

const RISK_TONE = { Low: "passed", Medium: "warning", High: "breached" } as const;

/** Payout review queue — approve / reject with animated status changes (persisted). */
export function PayoutQueue() {
  const decisions = useDemoStore((s) => s.adminDecisions);
  const session = useDemoStore((s) => s.session);
  const traderPayouts = useDemoStore((s) => s.payouts);
  const seededAt = useDemoStore((s) => s.seededAt);
  // Requests the trader made in this demo session show up for review here too.
  const mine = traderPayouts.filter((p) => p.requestedAt > seededAt).slice(0, 3);

  const decide = (id: string, d: "approved" | "rejected", amount: number, name: string) => {
    useDemoStore.getState().adminDecide(id, d);
    (d === "approved" ? toast.success : toast.warning)(
      d === "approved" ? "Payout approved" : "Payout rejected",
      d === "approved" ? `${formatUSD(amount)} to ${name} queued for the next batch.` : `${name} was notified with the review notes.`,
    );
  };

  return (
    <section id="payouts" className="card scroll-mt-24 overflow-hidden rounded-2xl" aria-label="Payout queue">
      <div className="px-5 pb-3 pt-5">
        <h2 className="text-base font-semibold">Payout queue</h2>
        <p className="text-xs text-muted">Review → approve / reject → batch → mark paid. Every action is written to the audit log.</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs text-muted">
              <th className="px-5 py-3 font-medium">Request</th>
              <th className="px-3 py-3 font-medium">Trader</th>
              <th className="px-3 py-3 font-medium">Method</th>
              <th className="px-3 py-3 font-medium">Risk</th>
              <th className="px-3 py-3 text-right font-medium">Amount</th>
              <th className="px-5 py-3 text-right font-medium">Decision</th>
            </tr>
          </thead>
          <tbody>
            {mine.map((p) => (
              <tr key={p.id} className="border-b border-line/60 bg-accent-2/[0.03]">
                <td className="px-5 py-3">
                  <span className="num block text-muted">{p.id}</span>
                  <span className="text-xs text-muted">From the trader dashboard</span>
                </td>
                <td className="px-3 py-3">
                  <span className="flex items-center gap-3">
                    <Avatar name={session?.name ?? "Alex Morgan"} size="sm" />
                    <span>
                      <span className="block font-medium">{session?.name ?? "Alex Morgan"}</span>
                      <span className="block text-xs text-muted">{p.accountLabel}</span>
                    </span>
                  </span>
                </td>
                <td className="px-3 py-3 text-muted">{PAYOUT_METHODS[p.method].label}</td>
                <td className="px-3 py-3">
                  <Badge tone="passed">Low · auto</Badge>
                </td>
                <td className="num px-3 py-3 text-right font-semibold">{formatUSD(p.amount)}</td>
                <td className="px-5 py-3 text-right">
                  <Badge tone={p.stage === "paid" ? "passed" : "info"} pulse={p.stage !== "paid"}>
                    {p.stage === "paid" ? "Paid · auto-approved" : "Auto-review"}
                  </Badge>
                </td>
              </tr>
            ))}
            {PAYOUT_QUEUE.map((q) => {
              const d = decisions[q.id];
              return (
                <tr
                  key={q.id}
                  className={cn(
                    "border-b border-line/60 transition-colors duration-700 last:border-0",
                    d === "approved" && "bg-profit/[0.05]",
                    d === "rejected" && "bg-loss/[0.05]",
                  )}
                >
                  <td className="px-5 py-3">
                    <span className="num block text-muted">{q.id}</span>
                    <span className="text-xs text-muted">{q.requested}</span>
                  </td>
                  <td className="px-3 py-3">
                    <span className="flex items-center gap-3">
                      <Avatar name={q.trader} size="sm" />
                      <span>
                        <span className="block font-medium">
                          {q.trader} {flag(q.country)}
                        </span>
                        <span className="block text-xs text-muted">{q.account}</span>
                      </span>
                    </span>
                  </td>
                  <td className="px-3 py-3 text-muted">{PAYOUT_METHODS[q.method].label}</td>
                  <td className="px-3 py-3">
                    <span className="flex flex-col items-start gap-1">
                      <Badge tone={RISK_TONE[q.risk]}>{q.risk}</Badge>
                      <span className="text-[11px] text-muted">{q.note}</span>
                    </span>
                  </td>
                  <td className="num px-3 py-3 text-right font-semibold">{formatUSD(q.amount)}</td>
                  <td className="px-5 py-3">
                    <div className="flex justify-end">
                      <AnimatePresence mode="wait" initial={false}>
                        {d ? (
                          <motion.span
                            key="done"
                            initial={{ opacity: 0, scale: 0.8, y: 6 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            transition={{ type: "spring", stiffness: 400, damping: 22 }}
                          >
                            <Badge tone={d === "approved" ? "passed" : "breached"}>{d === "approved" ? "Approved" : "Rejected"}</Badge>
                          </motion.span>
                        ) : (
                          <motion.span key="actions" exit={{ opacity: 0, scale: 0.9 }} className="flex gap-1.5">
                            <button
                              type="button"
                              onClick={() => decide(q.id, "approved", q.amount, q.trader)}
                              className="inline-flex h-8 items-center gap-1 rounded-lg border border-profit/30 bg-profit/10 px-2.5 text-xs font-semibold text-profit transition-colors hover:bg-profit/20"
                            >
                              <Check className="size-3.5" /> Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => decide(q.id, "rejected", q.amount, q.trader)}
                              className="inline-flex h-8 items-center gap-1 rounded-lg border border-loss/30 bg-loss/10 px-2.5 text-xs font-semibold text-loss transition-colors hover:bg-loss/20"
                            >
                              <X className="size-3.5" /> Reject
                            </button>
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
