"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Select } from "@/components/ui/Field";
import { Segmented } from "@/components/ui/Segmented";
import { cn } from "@/lib/cn";
import type { Trade } from "@/lib/types";
import { TradesTable, type SortKey } from "./TradesTable";

const PAGE = 10;
type Filter = "all" | "wins" | "losses";

/** Full trade history with result + symbol filters, sortable columns and pagination. */
export function TradeHistory({ trades }: { trades: Trade[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [symbol, setSymbol] = useState("all");
  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "closeTime", dir: "desc" });
  const [page, setPage] = useState(0);

  const symbols = [...new Set(trades.map((t) => t.symbol))].sort();
  const filtered = trades
    .filter((t) => (filter === "wins" ? t.pnl > 0 : filter === "losses" ? t.pnl < 0 : true))
    .filter((t) => symbol === "all" || t.symbol === symbol)
    .toSorted((a, b) => (sort.dir === "asc" ? 1 : -1) * (a[sort.key] - b[sort.key]));
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const current = Math.min(page, pages - 1);
  const rows = filtered.slice(current * PAGE, current * PAGE + PAGE);

  const counts = {
    all: trades.filter((t) => symbol === "all" || t.symbol === symbol).length,
    wins: trades.filter((t) => t.pnl > 0 && (symbol === "all" || t.symbol === symbol)).length,
    losses: trades.filter((t) => t.pnl < 0 && (symbol === "all" || t.symbol === symbol)).length,
  };

  return (
    <section id="history" className="card scroll-mt-24 overflow-hidden rounded-2xl" aria-label="Trade history">
      <div className="flex flex-col gap-3 px-5 pb-3 pt-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-base font-semibold">Trade history</h2>
          <p className="text-xs text-muted">{trades.length} closed trades on this account</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Segmented
            size="sm"
            ariaLabel="Filter by result"
            options={[
              { value: "all" as Filter, label: `All ${counts.all}` },
              { value: "wins" as Filter, label: `Wins ${counts.wins}` },
              { value: "losses" as Filter, label: `Losses ${counts.losses}` },
            ]}
            value={filter}
            onChange={(v) => {
              setFilter(v);
              setPage(0);
            }}
          />
          <Select
            aria-label="Filter by symbol"
            className="h-9 w-[150px] text-[13px]"
            value={symbol}
            onChange={(e) => {
              setSymbol(e.target.value);
              setPage(0);
            }}
          >
            <option value="all">All symbols</option>
            {symbols.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <TradesTable
        trades={rows}
        sort={sort}
        onSort={(key) => setSort((s) => ({ key, dir: s.key === key && s.dir === "desc" ? "asc" : "desc" }))}
        emptyText="No trades match these filters."
      />
      <div className="flex flex-col items-center justify-between gap-3 border-t border-line px-5 py-3.5 text-xs text-muted sm:flex-row">
        <span>
          {filtered.length ? `Showing ${current * PAGE + 1}–${Math.min(filtered.length, (current + 1) * PAGE)} of ${filtered.length}` : "No results"}
        </span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPage(Math.max(0, current - 1))}
            disabled={current === 0}
            aria-label="Previous page"
            className="grid size-8 place-items-center rounded-lg border border-line hover:text-fg disabled:opacity-40"
          >
            <ChevronLeft className="size-4" />
          </button>
          {Array.from({ length: pages }, (_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setPage(i)}
              aria-current={i === current ? "page" : undefined}
              className={cn(
                "num grid size-8 place-items-center rounded-lg border text-xs transition-colors",
                i === current ? "border-accent-2/50 bg-accent-2/10 text-fg" : "border-line hover:text-fg",
              )}
            >
              {i + 1}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setPage(Math.min(pages - 1, current + 1))}
            disabled={current >= pages - 1}
            aria-label="Next page"
            className="grid size-8 place-items-center rounded-lg border border-line hover:text-fg disabled:opacity-40"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
