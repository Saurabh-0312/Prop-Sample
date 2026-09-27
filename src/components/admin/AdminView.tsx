"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/Misc";
import { ChallengeBuilder } from "./ChallengeBuilder";
import { KpiGrid } from "./KpiGrid";
import { PayoutQueue } from "./PayoutQueue";
import { RiskConsole } from "./RiskConsole";

const RevenueChart = dynamic(() => import("./AdminCharts").then((m) => m.RevenueChart), {
  ssr: false,
  loading: () => <Skeleton className="h-[280px] rounded-xl" />,
});
const SalesDonut = dynamic(() => import("./AdminCharts").then((m) => m.SalesDonut), {
  ssr: false,
  loading: () => <Skeleton className="h-[190px] rounded-xl" />,
});

export function AdminView() {
  return (
    <div className="space-y-6">
      <div id="overview" className="scroll-mt-24">
        <h2 className="text-2xl font-semibold tracking-tight">Firm overview</h2>
        <p className="text-sm text-muted">The numbers the business runs on — revenue, pass rate and the payout ratio.</p>
      </div>
      <KpiGrid />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.6fr_1fr]">
        <section className="card rounded-2xl p-5 sm:p-6" aria-label="Revenue">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Revenue · last 30 days</h2>
              <p className="text-xs text-muted">Challenge fees, resets and add-ons</p>
            </div>
            <span className="rounded-full border border-accent-1/30 bg-accent-1/10 px-2.5 py-1 text-xs text-accent-1">Promo week +35%</span>
          </div>
          <RevenueChart />
        </section>
        <section className="card rounded-2xl p-5 sm:p-6" aria-label="Sales by model">
          <h2 className="text-base font-semibold">Sales by model</h2>
          <p className="mb-4 text-xs text-muted">Share of 30-day revenue</p>
          <SalesDonut />
        </section>
      </div>
      <RiskConsole />
      <PayoutQueue />
      <ChallengeBuilder />
    </div>
  );
}
