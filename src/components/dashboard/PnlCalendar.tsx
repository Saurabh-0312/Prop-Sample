"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Tooltip } from "@/components/ui/Tooltip";
import { cn } from "@/lib/cn";
import { dayKey, formatLongDate, formatSignedUSD } from "@/lib/format";
import { dailyPnl } from "@/lib/stats";
import type { Trade } from "@/lib/types";

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const monthName = new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" });

function compact(v: number) {
  const a = Math.abs(v);
  const s = a >= 1000 ? `$${(a / 1000).toFixed(1)}K` : `$${Math.round(a)}`;
  return `${v >= 0 ? "+" : "−"}${s}`;
}

/** Month grid of daily P/L with green/red intensity and a glass tooltip per day. */
export function PnlCalendar({ trades, anchor }: { trades: Trade[]; anchor: number }) {
  const daily = dailyPnl(trades);
  const [cursor, setCursor] = useState(() => {
    const d = new Date(trades[0]?.closeTime ?? anchor);
    return { y: d.getFullYear(), m: d.getMonth() };
  });

  const first = new Date(cursor.y, cursor.m, 1);
  const daysInMonth = new Date(cursor.y, cursor.m + 1, 0).getDate();
  const lead = (first.getDay() + 6) % 7; // Monday first
  const cells: (number | null)[] = [...Array.from({ length: lead }, () => null), ...Array.from({ length: daysInMonth }, (_, i) => i + 1)];
  while (cells.length % 7) cells.push(null);

  const monthDays = [...daily.values()].filter((d) => {
    const dt = new Date(d.ts);
    return dt.getFullYear() === cursor.y && dt.getMonth() === cursor.m;
  });
  const maxAbs = Math.max(1, ...monthDays.map((d) => Math.abs(d.pnl)));
  const total = monthDays.reduce((a, d) => a + d.pnl, 0);
  const green = monthDays.filter((d) => d.pnl > 0).length;

  const move = (delta: number) =>
    setCursor((c) => {
      const d = new Date(c.y, c.m + delta, 1);
      return { y: d.getFullYear(), m: d.getMonth() };
    });

  return (
    <section className="card rounded-2xl p-5 sm:p-6" aria-label="Daily P/L calendar">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Daily P/L</h2>
          <p className="text-xs text-muted">
            {monthDays.length ? (
              <>
                <span className={cn("num font-semibold", total >= 0 ? "text-profit" : "text-loss")}>{formatSignedUSD(total)}</span> ·{" "}
                {green}/{monthDays.length} green days
              </>
            ) : (
              "No trading days this month"
            )}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button type="button" onClick={() => move(-1)} aria-label="Previous month" className="grid size-8 place-items-center rounded-lg border border-line text-muted hover:text-fg">
            <ChevronLeft className="size-4" />
          </button>
          <span className="min-w-[128px] text-center text-sm font-medium">{monthName.format(first)}</span>
          <button type="button" onClick={() => move(1)} aria-label="Next month" className="grid size-8 place-items-center rounded-lg border border-line text-muted hover:text-fg">
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-1.5 text-center">
        {WEEKDAYS.map((w) => (
          <span key={w} className="pb-1 text-[11px] text-muted">
            {w}
          </span>
        ))}
        {cells.map((day, i) => {
          if (day === null) return <span key={`e-${i}`} className="aspect-square" />;
          const key = dayKey(new Date(cursor.y, cursor.m, day).getTime());
          const d = daily.get(key);
          if (!d) {
            return (
              <span key={key} className="flex aspect-square flex-col items-start justify-start rounded-lg border border-line/60 p-1.5 text-[11px] text-muted/70">
                {day}
              </span>
            );
          }
          const intensity = Math.min(1, Math.abs(d.pnl) / maxAbs);
          const pct = Math.round(10 + intensity * 42);
          const up = d.pnl >= 0;
          return (
            <Tooltip
              key={key}
              className="block"
              content={
                <div>
                  <p className="font-semibold text-fg">{formatLongDate(d.ts)}</p>
                  <p className={cn("num mt-1 text-sm font-semibold", up ? "text-profit" : "text-loss")}>{formatSignedUSD(d.pnl)}</p>
                  <p className="text-muted">
                    {d.count} trades · {Math.round((d.wins / d.count) * 100)}% win rate
                  </p>
                </div>
              }
            >
              <button
                type="button"
                className={cn(
                  "flex aspect-square w-full flex-col items-start justify-between rounded-lg border p-1.5 text-left transition-transform duration-200 hover:scale-[1.06]",
                  up ? "border-profit/30" : "border-loss/30",
                )}
                style={{ background: `color-mix(in oklab, var(${up ? "--profit" : "--loss"}) ${pct}%, transparent)` }}
                aria-label={`${formatLongDate(d.ts)}: ${formatSignedUSD(d.pnl)}`}
              >
                <span className="text-[11px] text-fg/90">{day}</span>
                <span className="num hidden w-full truncate text-[10px] font-semibold text-fg sm:block">{compact(d.pnl)}</span>
              </button>
            </Tooltip>
          );
        })}
      </div>
    </section>
  );
}
