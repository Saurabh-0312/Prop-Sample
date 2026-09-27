"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { PnL } from "@/components/ui/Misc";
import { cn } from "@/lib/cn";
import { formatDateTime, formatDuration, formatPrice, timeAgo } from "@/lib/format";
import { useNow } from "@/lib/hooks";
import type { Trade } from "@/lib/types";

export function SideBadge({ side }: { side: Trade["side"] }) {
  const buy = side === "buy";
  return (
    <span
      className={cn(
        "inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[11px] font-semibold uppercase",
        buy ? "bg-accent-2/12 text-accent-2" : "bg-accent-3/15 text-accent-3",
      )}
    >
      {buy ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
      {side}
    </span>
  );
}

export type SortKey = "closeTime" | "pnl" | "lots";

type Props = {
  trades: Trade[];
  /** relative "time ago" instead of absolute date */
  relative?: boolean;
  sort?: { key: SortKey; dir: "asc" | "desc" };
  onSort?: (key: SortKey) => void;
  emptyText?: string;
  /** slide new trades in (live feeds); off for filtered/paginated tables */
  animateNew?: boolean;
};

function SortHeader({ label, k, sort, onSort, className }: { label: string; k: SortKey; sort?: Props["sort"]; onSort?: Props["onSort"]; className?: string }) {
  if (!onSort) return <th className={cn("px-3 py-3 font-medium", className)}>{label}</th>;
  const active = sort?.key === k;
  return (
    <th className={cn("px-3 py-3 font-medium", className)} aria-sort={active ? (sort?.dir === "asc" ? "ascending" : "descending") : "none"}>
      <button type="button" onClick={() => onSort(k)} className={cn("inline-flex items-center gap-1 transition-colors hover:text-fg", active && "text-fg")}>
        {label}
        <span className={cn("text-[10px]", active ? "opacity-100" : "opacity-30")}>{active && sort?.dir === "asc" ? "▲" : "▼"}</span>
      </button>
    </th>
  );
}

/** Closed trades. New trades slide in at the top. */
function TradeCells({ t, relative, now }: { t: Trade; relative?: boolean; now: number }) {
  return (
    <>
      <td className="px-3 py-3 pl-5">
        <span className="flex items-center gap-2.5">
          <span className="font-semibold">{t.symbol}</span>
          <SideBadge side={t.side} />
        </span>
      </td>
      <td className="num px-3 py-3">{t.lots.toFixed(2)}</td>
      <td className="num px-3 py-3 text-muted">{formatPrice(t.symbol, t.openPrice)}</td>
      <td className="num px-3 py-3 text-muted">{formatPrice(t.symbol, t.closePrice)}</td>
      <td className="px-3 py-3 text-right">
        <PnL value={t.pnl} className="font-semibold" />
      </td>
      <td className="num px-3 py-3 text-muted">{formatDuration((t.closeTime - t.openTime) / 60_000)}</td>
      <td className="num px-3 py-3 pr-5 text-right text-muted">{relative && now ? timeAgo(t.closeTime, now) : formatDateTime(t.closeTime)}</td>
    </>
  );
}

export function TradesTable({
  trades,
  relative,
  sort,
  onSort,
  animateNew,
  emptyText = "No trades yet — the first closed trade will appear here.",
}: Props) {
  const now = useNow();
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[760px] text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs text-muted">
            <th className="px-3 py-3 pl-5 font-medium">Symbol</th>
            <SortHeader label="Lots" k="lots" sort={sort} onSort={onSort} />
            <th className="px-3 py-3 font-medium">Open</th>
            <th className="px-3 py-3 font-medium">Close</th>
            <SortHeader label="P/L" k="pnl" sort={sort} onSort={onSort} className="text-right" />
            <th className="px-3 py-3 font-medium">Duration</th>
            <SortHeader label="Closed" k="closeTime" sort={sort} onSort={onSort} className="pr-5 text-right" />
          </tr>
        </thead>
        <tbody>
          {animateNew ? (
            <AnimatePresence initial={false}>
              {trades.map((t) => (
                <motion.tr
                  key={t.id}
                  layout="position"
                  initial={{ opacity: 0, y: -14, backgroundColor: t.pnl >= 0 ? "rgba(0,211,149,0.12)" : "rgba(255,77,94,0.12)" }}
                  animate={{ opacity: 1, y: 0, backgroundColor: "rgba(0,0,0,0)" }}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className="border-b border-line/60 last:border-0 hover:bg-white/[0.02]"
                >
                  <TradeCells t={t} relative={relative} now={now} />
                </motion.tr>
              ))}
            </AnimatePresence>
          ) : (
            trades.map((t) => (
              <tr key={t.id} className="border-b border-line/60 transition-colors last:border-0 hover:bg-white/[0.02]">
                <TradeCells t={t} relative={relative} now={now} />
              </tr>
            ))
          )}
          {trades.length === 0 && (
            <tr>
              <td colSpan={7} className="px-5 py-12 text-center text-sm text-muted">
                {emptyText}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
