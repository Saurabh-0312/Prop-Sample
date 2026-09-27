"use client";

import { useState } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Marquee } from "@/components/fx/Marquee";
import { SYMBOLS, TICKER_SYMBOLS } from "@/data/symbols";
import { cn } from "@/lib/cn";
import { formatPct, formatPrice } from "@/lib/format";
import { useInterval } from "@/lib/hooks";
import { createRng } from "@/lib/rng";

type Quote = { symbol: string; price: number; change: number; dir: -1 | 0 | 1; v: number };

const seed = createRng("ticker-open");
const INITIAL: Quote[] = TICKER_SYMBOLS.map((symbol) => ({
  symbol,
  price: SYMBOLS[symbol].base,
  change: seed.range(-0.011, 0.013),
  dir: 0,
  v: 0,
}));

function TickerItem({ q }: { q: Quote }) {
  const up = q.change >= 0;
  return (
    <div className="flex items-center gap-2.5 border-r border-line/70 px-5 py-2 text-[12.5px]">
      <span className="font-semibold tracking-wide text-fg/85">{q.symbol}</span>
      <span
        key={q.v}
        className={cn("num rounded px-1 text-fg", q.dir === 1 && "tick-up", q.dir === -1 && "tick-down")}
      >
        {formatPrice(q.symbol, q.price)}
      </span>
      <span className={cn("num inline-flex items-center", up ? "text-profit" : "text-loss")}>
        {up ? <ArrowUpRight className="size-3.5" /> : <ArrowDownRight className="size-3.5" />}
        {formatPct(q.change, 2, true)}
      </span>
    </div>
  );
}

/** Live-ticking market strip under the navbar. */
export function TickerTape() {
  const [quotes, setQuotes] = useState(INITIAL);

  useInterval(() => {
    // Randomness is drawn here (in the timer), not inside render or the state updater.
    const draws = quotes.map(() => ({ move: Math.random() > 0.45, r: Math.random() }));
    setQuotes((qs) =>
      qs.map((q, i) => {
        const d = draws[i];
        if (!d?.move) return q;
        const info = SYMBOLS[q.symbol];
        const delta = (d.r - 0.48) * info.vol * 2.4 * q.price;
        return {
          ...q,
          price: q.price + delta,
          change: q.change + delta / info.base,
          dir: delta >= 0 ? 1 : -1,
          v: q.v + 1,
        };
      }),
    );
  }, 1500);

  return (
    <div className="relative border-b border-line bg-elevated/70" aria-label="Live market prices (simulated)">
      <Marquee duration={60} gap={0} fade>
        {quotes.map((q) => (
          <TickerItem key={q.symbol} q={q} />
        ))}
      </Marquee>
    </div>
  );
}
