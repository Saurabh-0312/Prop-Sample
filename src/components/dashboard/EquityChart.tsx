"use client";

import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from "recharts";
import { Segmented } from "@/components/ui/Segmented";
import { formatDate, formatDateTime, formatUSD } from "@/lib/format";
import { maxLossFloor, targetBalance } from "@/lib/rules";
import { useDemoStore } from "@/lib/store";
import type { EquityPoint, TradingAccount } from "@/lib/types";

type Range = "all" | "20" | "live";
type Point = EquityPoint & { i: number; live?: boolean };

const EMPTY: EquityPoint[] = [];

function ChartTooltip({ active, payload }: TooltipContentProps) {
  const p = payload?.[0]?.payload as Point | undefined;
  if (!active || !p) return null;
  return (
    <div className="rounded-xl border border-line-strong bg-[#0d1321]/95 px-3 py-2 text-xs shadow-2xl backdrop-blur-xl">
      <p className="text-muted">{p.live ? `Live · ${formatDateTime(p.t)}` : formatDateTime(p.t)}</p>
      <p className="num mt-1 text-sm font-semibold text-fg">{formatUSD(p.equity)}</p>
      <p className="num text-muted">Balance {formatUSD(p.balance)}</p>
    </div>
  );
}

const compact = (v: number) => (v >= 1000 ? `$${(v / 1000).toFixed(1)}K` : `$${v}`);

/** Equity curve with the profit-target line and the max-loss floor drawn in. */
export default function EquityChart({ account, height = 300 }: { account: TradingAccount; height?: number }) {
  const tail = useDemoStore((s) => s.liveTail[account.id]) ?? EMPTY;
  const [range, setRange] = useState<Range>("all");
  const [animate, setAnimate] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setAnimate(false), 1400);
    return () => clearTimeout(t);
  }, []);

  const base = account.history;
  const hist = range === "20" ? base.slice(-20) : range === "live" ? base.slice(-1) : base;
  const data: Point[] = [...hist, ...tail.map((p) => ({ ...p, live: true }))].map((p, i) => ({ ...p, i }));

  const target = targetBalance(account.state, account.rules);
  const floor = maxLossFloor({ ...account.state, peakEquity: Math.max(account.state.peakEquity, account.state.equity) }, account.rules);
  const values = data.map((d) => d.equity);
  const lo = Math.min(...values, floor);
  const hi = Math.max(...values, target ?? -Infinity);
  const pad = (hi - lo) * 0.08 || account.size * 0.01;
  const domain: [number, number] = [Math.floor((lo - pad) / 100) * 100, Math.ceil((hi + pad) / 100) * 100];
  const last = data[data.length - 1];
  // One tick per trading day (first point of each day), at most 6.
  const dayTicks: number[] = [];
  data.forEach((d, i) => {
    if (i === 0 || formatDate(d.t) !== formatDate(data[i - 1].t)) dayTicks.push(i);
  });
  const step = Math.ceil(dayTicks.length / 6);
  const ticks = dayTicks.filter((_, k) => k % step === 0);

  return (
    <section className="card flex h-full flex-col rounded-2xl p-4 sm:p-6" aria-label="Equity curve">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Equity curve</h2>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-muted">
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-4 rounded bg-gradient-brand" /> Equity
            </span>
            {target !== null && (
              <span className="flex items-center gap-1.5">
                <span className="w-4 border-t border-dashed border-accent-1" /> Profit target
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <span className="w-4 border-t border-dashed border-loss" /> Max loss floor
            </span>
          </div>
        </div>
        <Segmented
          size="sm"
          ariaLabel="Chart range"
          options={[
            { value: "all" as Range, label: "All" },
            { value: "20" as Range, label: "Last 20" },
            { value: "live" as Range, label: "Live" },
          ]}
          value={range}
          onChange={setRange}
        />
      </div>
      <div style={{ minHeight: height }} className="relative -ml-2 flex-1">
        <div className="absolute inset-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 12, right: 8, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="eq-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--accent-2)" stopOpacity={0.32} />
                <stop offset="100%" stopColor="var(--accent-2)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="eq-stroke" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="var(--accent-1)" />
                <stop offset="60%" stopColor="var(--accent-2)" />
                <stop offset="100%" stopColor="var(--accent-3)" />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.045)" vertical={false} />
            <XAxis
              dataKey="i"
              type="number"
              domain={["dataMin", "dataMax"]}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--muted)", fontSize: 11 }}
              ticks={ticks}
              tickFormatter={(i: number) => (data[i] ? formatDate(data[i].t) : "")}
              minTickGap={24}
            />
            <YAxis
              orientation="right"
              domain={domain}
              tickLine={false}
              axisLine={false}
              width={62}
              tick={{ fill: "var(--muted)", fontSize: 11, fontFamily: "var(--font-jetbrains)" }}
              tickFormatter={compact}
            />
            <Tooltip content={(p) => <ChartTooltip {...p} />} cursor={{ stroke: "rgba(255,255,255,0.18)", strokeDasharray: "4 4" }} />
            {target !== null && (
              <ReferenceLine
                y={target}
                stroke="var(--accent-1)"
                strokeDasharray="6 6"
                strokeOpacity={0.8}
                label={{ value: `Target ${compact(target)}`, position: "insideTopLeft", fill: "var(--accent-1)", fontSize: 11 }}
              />
            )}
            <ReferenceLine
              y={floor}
              stroke="var(--loss)"
              strokeDasharray="6 6"
              strokeOpacity={0.75}
              label={{ value: `Max loss floor ${compact(floor)}`, position: "insideBottomLeft", fill: "var(--loss)", fontSize: 11 }}
            />
            <Area
              type="monotone"
              dataKey="equity"
              stroke="url(#eq-stroke)"
              strokeWidth={2.2}
              fill="url(#eq-fill)"
              isAnimationActive={animate}
              animationDuration={1100}
              activeDot={{ r: 4, fill: "var(--accent-2)", stroke: "#05070d", strokeWidth: 2 }}
              dot={(props: { cx?: number; cy?: number; index?: number }) =>
                props.index === data.length - 1 && props.cx !== undefined && props.cy !== undefined ? (
                  <g key="live-dot">
                    <circle cx={props.cx} cy={props.cy} r={9} fill="var(--accent-2)" opacity={0.2} className="animate-ping [transform-box:fill-box] [transform-origin:center]" />
                    <circle cx={props.cx} cy={props.cy} r={4} fill="var(--accent-2)" stroke="#05070d" strokeWidth={2} />
                  </g>
                ) : (
                  <g key={`d-${props.index}`} />
                )
              }
            />
          </AreaChart>
        </ResponsiveContainer>
        </div>
      </div>
      {last && (
        <p className="mt-2 text-right text-[11px] text-muted">
          {data.length} points · last update {formatDateTime(last.t)}
        </p>
      )}
    </section>
  );
}
