import { createRng, type Rng } from "@/lib/rng";
import type { EquityPoint, Trade } from "@/lib/types";
import { SYMBOLS, TRADED_SYMBOLS, moveValue } from "./symbols";

const DAY = 86_400_000;
const round2 = (n: number) => Math.round(n * 100) / 100;

/** Start of the local day for a timestamp. */
export function startOfDay(ts: number): number {
  const d = new Date(ts);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function isWeekend(ts: number) {
  const day = new Date(ts).getDay();
  return day === 0 || day === 6;
}

/** Most recent `count` weekdays strictly before `beforeTs`, oldest first, optionally skipping some days. */
export function pastTradingDays(beforeTs: number, count: number, rng: Rng, skipChance = 0): number[] {
  const days: number[] = [];
  let cursor = startOfDay(beforeTs) - DAY;
  let guard = 0;
  while (days.length < count && guard < 400) {
    guard++;
    if (!isWeekend(cursor) && !(skipChance > 0 && rng.chance(skipChance))) days.push(cursor);
    cursor -= DAY;
  }
  return days.reverse();
}

/** Builds one closed trade with prices consistent with its P/L. */
export function makeTrade(rng: Rng, opts: { id: string; pnl: number; openTime: number; durationMin: number; symbol?: string }): Trade {
  const symbol = opts.symbol ?? rng.pick(TRADED_SYMBOLS);
  const info = SYMBOLS[symbol];
  const side: Trade["side"] = rng.chance(0.55) ? "buy" : "sell";
  const openPrice = info.base * (1 + rng.normal(0, 0.0045));
  const targetMove = rng.range(info.move[0], info.move[1]);
  const perLot = moveValue(info, 1, targetMove, openPrice);
  let lots = Math.max(0.01, Math.round((Math.abs(opts.pnl) / perLot) * 100) / 100);
  if (lots > 50) lots = 50;
  // Exact move for this lot size so price and P/L agree.
  const signedMove = opts.pnl / moveValue(info, lots, 1, openPrice);
  const closePrice = side === "buy" ? openPrice + signedMove : openPrice - signedMove;
  return {
    id: opts.id,
    symbol,
    side,
    lots,
    openPrice,
    closePrice,
    openTime: opts.openTime,
    closeTime: opts.openTime + opts.durationMin * 60_000,
    pnl: round2(opts.pnl),
  };
}

type GenerateOptions = {
  seed: string;
  count: number;
  totalPnl: number;
  days: number[];
  size: number;
  winRate?: number;
};

/**
 * Deterministic trade history whose P/L sums exactly to `totalPnl`.
 * Returns trades sorted newest first.
 */
export function generateTrades({ seed, count, totalPnl, days, size, winRate = 0.58 }: GenerateOptions): Trade[] {
  const rng = createRng(seed);
  const wins = Math.max(1, Math.round(count * winRate));
  const losses = count - wins;

  const lossValues = Array.from({ length: losses }, () => -size * rng.range(0.0012, 0.0058));
  const winRaw = Array.from({ length: wins }, () => size * rng.range(0.002, 0.0095));
  const lossSum = lossValues.reduce((a, b) => a + b, 0);
  const scale = (totalPnl - lossSum) / winRaw.reduce((a, b) => a + b, 0);
  const winValues = winRaw.map((w) => w * scale);

  const pnls = rng.shuffle([...winValues, ...lossValues].map(round2));
  // Fix rounding drift on the largest win.
  const drift = round2(totalPnl - pnls.reduce((a, b) => a + b, 0));
  let maxIdx = 0;
  pnls.forEach((p, i) => {
    if (p > pnls[maxIdx]) maxIdx = i;
  });
  pnls[maxIdx] = round2(pnls[maxIdx] + drift);

  // Spread trades across the trading days.
  const perDay = days.map(() => 1);
  for (let i = days.length; i < count; i++) perDay[rng.int(0, days.length - 1)]++;

  const trades: Trade[] = [];
  let k = 0;
  days.forEach((day, di) => {
    const n = perDay[di];
    for (let j = 0; j < n && k < pnls.length; j++, k++) {
      // Positions may overlap, like a real session between 07:00 and 20:30.
      const openTime = day + rng.range(7, 20.5) * 3_600_000;
      const maxMinutes = Math.max(3, (day + 23.5 * 3_600_000 - openTime) / 60_000);
      const duration = Math.min(maxMinutes, Math.round(Math.exp(rng.range(Math.log(3), Math.log(240)))));
      trades.push(
        makeTrade(rng, {
          id: `T${(40_000_000 + Math.floor(rng.next() * 9_000_000)).toString()}`,
          pnl: pnls[k],
          openTime,
          durationMin: duration,
        }),
      );
    }
  });
  return trades.sort((a, b) => b.closeTime - a.closeTime);
}

/** Balance curve from the account start through every closed trade. */
export function historyFromTrades(initial: number, trades: Trade[], startAt: number): EquityPoint[] {
  const asc = [...trades].sort((a, b) => a.closeTime - b.closeTime);
  const points: EquityPoint[] = [{ t: startAt, balance: initial, equity: initial }];
  let bal = initial;
  for (const tr of asc) {
    bal = round2(bal + tr.pnl);
    points.push({ t: tr.closeTime, balance: bal, equity: bal });
  }
  return points;
}
