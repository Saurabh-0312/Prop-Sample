"use client";

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from "recharts";
import { formatUSD } from "@/lib/format";

export type EarningPoint = { month: string; earned: number; conversions: number };

function Tip({ active, payload }: TooltipContentProps) {
  const p = payload?.[0]?.payload as EarningPoint | undefined;
  if (!active || !p) return null;
  return (
    <div className="rounded-xl border border-line-strong bg-[#0d1321]/95 px-3 py-2 text-xs shadow-2xl backdrop-blur-xl">
      <p className="text-muted">{p.month}</p>
      <p className="num mt-1 text-sm font-semibold">{formatUSD(p.earned)}</p>
      <p className="text-muted">{p.conversions} conversions</p>
    </div>
  );
}

export default function AffiliateChart({ data }: { data: EarningPoint[] }) {
  return (
    <div className="h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 4, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="aff-bar" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent-1)" />
              <stop offset="100%" stopColor="var(--accent-3)" stopOpacity={0.55} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.045)" vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tick={{ fill: "var(--muted)", fontSize: 11 }} />
          <YAxis orientation="right" tickLine={false} axisLine={false} width={48} tick={{ fill: "var(--muted)", fontSize: 11 }} tickFormatter={(v: number) => `$${v}`} />
          <Tooltip content={(p) => <Tip {...p} />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
          <Bar dataKey="earned" fill="url(#aff-bar)" radius={[8, 8, 3, 3]} maxBarSize={42} animationDuration={900} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
