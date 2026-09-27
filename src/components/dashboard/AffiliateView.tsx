"use client";

import dynamic from "next/dynamic";
import { Crown, Download, Link2, MousePointerClick, Send, UserPlus, Wallet } from "lucide-react";
import { NumberRoll } from "@/components/fx/NumberRoll";
import { SpotlightCard } from "@/components/fx/SpotlightCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { Skeleton } from "@/components/ui/Misc";
import { Progress } from "@/components/ui/Progress";
import { brand } from "@/config/brand";
import { flag } from "@/data/countries";
import { cn } from "@/lib/cn";
import { formatUSD } from "@/lib/format";
import { useDemoStore } from "@/lib/store";
import { toast } from "@/lib/toast";
import type { EarningPoint } from "./AffiliateChart";

const AffiliateChart = dynamic(() => import("./AffiliateChart"), { ssr: false, loading: () => <Skeleton className="h-[260px] rounded-xl" /> });

const EARNINGS: EarningPoint[] = [
  { month: "Feb", earned: 184.2, conversions: 4 },
  { month: "Mar", earned: 236.9, conversions: 5 },
  { month: "Apr", earned: 312.4, conversions: 7 },
  { month: "May", earned: 288.1, conversions: 6 },
  { month: "Jun", earned: 402.75, conversions: 9 },
  { month: "Jul", earned: 455.3, conversions: 10 },
  { month: "Aug", earned: 437.65, conversions: 9 },
  { month: "Sep", earned: 530.25, conversions: 11 },
];

const TIERS = [
  { name: "Bronze", pct: 10, from: 0, color: "text-[#e0a574]" },
  { name: "Silver", pct: 12, from: 25, color: "text-[#c8d3e6]" },
  { name: "Gold", pct: 15, from: 75, color: "text-warning" },
];

const REFERRALS = [
  { name: "Kwame A.", country: "GH", plan: "$100K 2-Step", commission: 59.88, status: "Paid", date: "Sep 24" },
  { name: "Lina M.", country: "DE", plan: "$50K 1-Step", commission: 41.88, status: "Pending", date: "Sep 23" },
  { name: "Rahul V.", country: "IN", plan: "$200K 2-Step", commission: 113.88, status: "Paid", date: "Sep 21" },
  { name: "Joao P.", country: "BR", plan: "$25K 2-Step", commission: 21.48, status: "Paid", date: "Sep 19" },
  { name: "Aylin K.", country: "TR", plan: "$100K Instant", commission: 149.88, status: "Pending", date: "Sep 18" },
  { name: "Sam O.", country: "NG", plan: "$50K 2-Step", commission: 35.88, status: "Paid", date: "Sep 15" },
];

export function AffiliateView() {
  const session = useDemoStore((s) => s.session);
  const code = `${(session?.name ?? "Alex Morgan").split(" ")[0].toUpperCase()}25`;
  const link = `https://${brand.shortName.toLowerCase()}.capital/r/${code}`;
  const conversions = 61;
  const tierIdx = TIERS.findLastIndex((t) => conversions >= t.from);
  const next = TIERS[tierIdx + 1];
  const earned = EARNINGS.reduce((a, e) => a + e.earned, 0);

  const stats = [
    { label: "Clicks", value: 3482, icon: MousePointerClick, format: "int" as const },
    { label: "Signups", value: 214, icon: UserPlus, format: "int" as const },
    { label: "Conversions", value: conversions, icon: Send, format: "int" as const },
    { label: "Earned", value: earned, icon: Wallet, format: "usd" as const },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Affiliate program</h2>
          <p className="text-sm text-muted">Earn up to 15% on every challenge your referrals buy — paid monthly in USDT.</p>
        </div>
        <Button variant="secondary" size="sm" iconLeft={<Download className="size-3.5" />} onClick={() => toast.success("Banner kit downloaded", "12 creatives in 6 sizes, with your referral code baked in.")}>
          Banner kit
        </Button>
      </div>

      <section className="card rounded-2xl p-5 sm:p-6">
        <p className="flex items-center gap-2 text-sm font-semibold">
          <Link2 className="size-4 text-accent-2" /> Your referral link
        </p>
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-line bg-[#080c15] py-1.5 pl-4 pr-1.5">
          <span className="num min-w-0 flex-1 truncate text-sm text-fg">{link}</span>
          <CopyButton value={link} label="Copy referral link" toastLabel="Referral link copied" />
        </div>
        <p className="mt-2 text-xs text-muted">
          Code <span className="num font-semibold text-fg">{code}</span> gives your referrals 10% off their first challenge.
        </p>
      </section>

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {stats.map((s) => (
          <SpotlightCard key={s.label} className="rounded-2xl p-4 sm:p-5">
            <div className="flex items-center justify-between text-[13px] text-muted">
              {s.label}
              <span className="grid size-8 place-items-center rounded-lg bg-white/[0.04]">
                <s.icon className="size-4" />
              </span>
            </div>
            <NumberRoll value={s.value} format={s.format} countUp className="mt-3 text-[26px] font-semibold tracking-tight" />
          </SpotlightCard>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.5fr_1fr]">
        <section className="card rounded-2xl p-5 sm:p-6" aria-label="Monthly earnings">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Monthly earnings</h2>
              <p className="text-xs text-muted">Commission earned per month</p>
            </div>
            <Button size="sm" iconLeft={<Wallet className="size-3.5" />} onClick={() => toast.success("Commission payout requested", `${formatUSD(530.25)} will be sent in the next USDT batch.`)}>
              Withdraw
            </Button>
          </div>
          <AffiliateChart data={EARNINGS} />
        </section>

        <section className="card rounded-2xl p-5 sm:p-6" aria-label="Commission tiers">
          <h2 className="text-base font-semibold">Commission tiers</h2>
          <p className="text-xs text-muted">Based on lifetime conversions</p>
          <div className="mt-5 grid grid-cols-3 gap-2">
            {TIERS.map((t, i) => (
              <div
                key={t.name}
                className={cn(
                  "rounded-xl border p-3 text-center transition-all",
                  i === tierIdx ? "border-accent-2/50 bg-accent-2/[0.08] shadow-[0_0_24px_-10px_var(--accent-2)]" : "border-line bg-white/[0.02]",
                )}
              >
                <Crown className={cn("mx-auto size-5", t.color)} />
                <p className="mt-1.5 text-sm font-semibold">{t.name}</p>
                <p className="num text-lg font-semibold">{t.pct}%</p>
                <p className="text-[11px] text-muted">{t.from}+ conv.</p>
              </div>
            ))}
          </div>
          {next ? (
            <div className="mt-5">
              <div className="mb-2 flex justify-between text-xs">
                <span className="text-muted">
                  {TIERS[tierIdx].name} → {next.name}
                </span>
                <span className="num text-fg">
                  {conversions} / {next.from}
                </span>
              </div>
              <Progress value={conversions / next.from} height="md" />
              <p className="mt-2 text-xs text-muted">
                {next.from - conversions} more conversions to unlock {next.pct}% commission.
              </p>
            </div>
          ) : (
            <p className="mt-5 text-sm text-accent-1">Top tier unlocked — 15% on every sale.</p>
          )}
        </section>
      </div>

      <section className="card overflow-hidden rounded-2xl" aria-label="Recent referrals">
        <div className="px-5 pb-2 pt-5">
          <h2 className="text-base font-semibold">Recent referrals</h2>
          <p className="text-xs text-muted">Names are masked for privacy</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[600px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-muted">
                <th className="px-5 py-3 font-medium">Referral</th>
                <th className="px-3 py-3 font-medium">Plan</th>
                <th className="px-3 py-3 font-medium">Date</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-5 py-3 text-right font-medium">Commission</th>
              </tr>
            </thead>
            <tbody>
              {REFERRALS.map((r) => (
                <tr key={r.name} className="border-b border-line/60 last:border-0 hover:bg-white/[0.02]">
                  <td className="px-5 py-3 font-medium">
                    {r.name} {flag(r.country)}
                  </td>
                  <td className="px-3 py-3 text-muted">{r.plan}</td>
                  <td className="px-3 py-3 text-muted">{r.date}</td>
                  <td className="px-3 py-3">
                    <Badge tone={r.status === "Paid" ? "passed" : "warning"}>{r.status}</Badge>
                  </td>
                  <td className="num px-5 py-3 text-right font-semibold">{formatUSD(r.commission)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
