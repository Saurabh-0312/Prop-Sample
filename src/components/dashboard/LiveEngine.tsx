"use client";

import { useEffect } from "react";
import { PAYOUT_METHODS } from "@/data/payouts";
import { formatUSD } from "@/lib/format";
import { useDemoStore } from "@/lib/store";
import { toast } from "@/lib/toast";

const STAGE_TOAST = {
  review: (amount: string) => ["Payout under review", `${amount} is being checked by the risk team.`],
  approved: (amount: string) => ["Payout approved", `${amount} was approved by finance.`],
  paid: (amount: string, method: string) => ["Reward paid ✓", `${amount} was sent via ${method}.`],
} as const;

/**
 * Drives the live simulation while the dashboard is open:
 * equity ticks every ~1.5s (through the rules engine) and payout requests advance every ~2s.
 */
export function LiveEngine() {
  useEffect(() => {
    const tick = setInterval(() => {
      if (document.hidden) return;
      useDemoStore.getState().tick(Date.now());
    }, 1500);
    const payouts = setInterval(() => {
      const changes = useDemoStore.getState().advancePayouts(Date.now());
      for (const { payout, stage } of changes) {
        if (stage === "requested" || stage === "rejected") continue;
        const amount = formatUSD(payout.amount);
        const [title, body] =
          stage === "paid" ? STAGE_TOAST.paid(amount, PAYOUT_METHODS[payout.method].label) : STAGE_TOAST[stage](amount);
        (stage === "paid" ? toast.success : toast.info)(title, body);
      }
    }, 400);
    return () => {
      clearInterval(tick);
      clearInterval(payouts);
    };
  }, []);
  return null;
}
