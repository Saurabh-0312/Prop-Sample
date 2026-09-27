"use client";

import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from "recharts";
import { REVENUE_SERIES, SALES_BY_MODEL } from "@/data/admin";
import { formatDate, formatUSD } from "@/lib/format";
import { useNow } from "@/lib/hooks";

const DAY = 86_400_000;

function RevTooltip({ active, payload }: TooltipContentProps) {
  const p = payload?.[0]?.payload as { label: string; revenue: number; orders: number } | undefined;
  if (!active || !p) return null;
  return (
    <div className="rounded-xl border border-line-strong bg-[#0d1321]/95 px-3 py-2 text-xs shadow-2xl backdrop-blur-xl">
      <p className="text-muted">{p.label}</p>
      <p className="num mt-1 text-sm font-semibold">{formatUSD(p.revenue, 0)}</p>
      <p className="num text-muted">{p.orders} orders</p>
    </div>
  );
}

export function RevenueChart() {
  const now = useNow();
  const data = REVENUE_SERIES.map((d) => ({ ...d, label: now ? formatDate(now - d.day * DAY) : d.day === 0 ? "Today" : `−${d.day}d` }));
  return (
    <div className="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 6, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="rev-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent-1)" stopOpacity={0.35} />
              <stop offset="100%" stopColor="var(--accent-1)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="rev-stroke" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="var(--accent-1)" />
              <stop offset="100%" stopColor="var(--accent-2)" />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.045)" vertical={false} />
          <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: "var(--muted)", fontSize: 11 }} minTickGap={36} />
          <YAxis
            orientation="right"
            tickLine={false}
            axisLine={false}
            width={52}
            tick={{ fill: "var(--muted)", fontSize: 11 }}
            tickFormatter={(v: number) => `$${Math.round(v / 1000)}K`}
          />
          <Tooltip content={(p) => <RevTooltip {...p} />} cursor={{ stroke: "rgba(255,255,255,0.18)", strokeDasharray: "4 4" }} />
          <Area type="monotone" dataKey="revenue" stroke="url(#rev-stroke)" strokeWidth={2.2} fill="url(#rev-fill)" animationDuration={1100} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

const DONUT = ["var(--accent-1)", "var(--accent-2)", "var(--accent-3)"];

export function SalesDonut() {
  const total = SALES_BY_MODEL.reduce((a, s) => a + s.value, 0);
  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row xl:flex-col 2xl:flex-row">
      <div className="relative size-[190px] shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={SALES_BY_MODEL} dataKey="value" nameKey="name" innerRadius={62} outerRadius={88} paddingAngle={3} stroke="none" animationDuration={1000}>
              {SALES_BY_MODEL.map((s, i) => (
                <Cell key={s.id} fill={DONUT[i]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-[11px] text-muted">30-day sales</span>
          <span className="num text-lg font-semibold">${(total / 1_000_000).toFixed(2)}M</span>
        </div>
      </div>
      <ul className="w-full space-y-3">
        {SALES_BY_MODEL.map((s, i) => (
          <li key={s.id} className="flex items-center justify-between gap-3 whitespace-nowrap text-sm">
            <span className="flex items-center gap-2">
              <span className="size-2.5 rounded-full" style={{ background: DONUT[i] }} />
              {s.name}
            </span>
            <span className="num text-muted">
              {formatUSD(s.value, 0)} · <span className="text-fg">{Math.round((s.value / total) * 100)}%</span>
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
