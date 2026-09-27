import { dayKey } from "./format";
import type { Trade } from "./types";

export type DayStat = { key: string; pnl: number; count: number; wins: number; ts: number };

export function dailyPnl(trades: Trade[]): Map<string, DayStat> {
  const map = new Map<string, DayStat>();
  for (const t of trades) {
    const key = dayKey(t.closeTime);
    const d = map.get(key) ?? { key, pnl: 0, count: 0, wins: 0, ts: t.closeTime };
    d.pnl += t.pnl;
    d.count += 1;
    if (t.pnl > 0) d.wins += 1;
    map.set(key, d);
  }
  return map;
}

export type TradeStats = {
  count: number;
  winRate: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  bestDay: number;
  totalLots: number;
  expectancy: number;
  sharpe: number;
  net: number;
};

export function tradeStats(trades: Trade[], initial: number): TradeStats {
  const wins = trades.filter((t) => t.pnl > 0);
  const losses = trades.filter((t) => t.pnl < 0);
  const gross = wins.reduce((a, t) => a + t.pnl, 0);
  const lossSum = losses.reduce((a, t) => a + t.pnl, 0);
  const net = gross + lossSum;
  const days = [...dailyPnl(trades).values()];
  const rets = days.map((d) => d.pnl / initial);
  const mean = rets.reduce((a, r) => a + r, 0) / (rets.length || 1);
  const sd = Math.sqrt(rets.reduce((a, r) => a + (r - mean) ** 2, 0) / (rets.length || 1));
  // Floor the deviation so a handful of green days doesn't produce an absurd ratio.
  const sharpe = rets.length > 1 ? ((mean / Math.max(sd, 0.006)) * Math.sqrt(252)) / 9 : 0;
  return {
    count: trades.length,
    winRate: trades.length ? wins.length / trades.length : 0,
    profitFactor: lossSum !== 0 ? gross / Math.abs(lossSum) : gross > 0 ? 99 : 0,
    avgWin: wins.length ? gross / wins.length : 0,
    avgLoss: losses.length ? lossSum / losses.length : 0,
    bestDay: days.length ? Math.max(...days.map((d) => d.pnl)) : 0,
    totalLots: trades.reduce((a, t) => a + t.lots, 0),
    expectancy: trades.length ? net / trades.length : 0,
    sharpe,
    net,
  };
}
