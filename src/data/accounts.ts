import { brand } from "@/config/brand";
import { dayKey } from "@/lib/format";
import { createRng } from "@/lib/rng";
import type { Notification, Payout, Platform, TradingAccount } from "@/lib/types";
import { getRules, type AccountSize, type AddOnId, type ModelId } from "./plans";
import { generateTrades, historyFromTrades, pastTradingDays } from "./trades";

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

type SeedSpec = {
  id: string;
  login: string;
  password: string;
  platform: Platform;
  model: ModelId;
  size: AccountSize;
  phase: TradingAccount["phase"];
  addOns: AddOnId[];
  profit: number;
  tradeCount: number;
  tradingDays: number;
  /** trading days end this many calendar days before today */
  endOffsetDays: number;
  skipChance: number;
  status: TradingAccount["state"]["status"];
  openPnl: number;
  note?: string;
};

const SPECS: SeedSpec[] = [
  {
    id: "acc-100k",
    login: "8812301",
    password: "Nv7#qX2pLm",
    platform: "MetaTrader 5",
    model: "two-step",
    size: 100000,
    phase: "phase-1",
    addOns: [],
    profit: 4960,
    tradeCount: 36,
    tradingDays: 3,
    endOffsetDays: 0,
    skipChance: 0,
    status: "active",
    openPnl: 312.4,
  },
  {
    id: "acc-50k",
    login: "8812287",
    password: "Rk4$wT9zQe",
    platform: "cTrader",
    model: "one-step",
    size: 50000,
    phase: "phase-1",
    addOns: [],
    profit: 5380,
    tradeCount: 48,
    tradingDays: 7,
    endOffsetDays: 3,
    skipChance: 0.15,
    status: "passed",
    openPnl: 0,
    note: "Passed — funded account unlocks after KYC",
  },
  {
    id: "acc-200k",
    login: "8812199",
    password: "Hq2!mV8sKd",
    platform: "Match-Trader",
    model: "two-step",
    size: 200000,
    phase: "funded",
    addOns: ["split90", "biweekly"],
    profit: 6420,
    // Trades since the last reward cycle (the previous payout reset the balance).
    tradeCount: 52,
    tradingDays: 10,
    endOffsetDays: 0,
    skipChance: 0.05,
    status: "funded",
    openPnl: -184.2,
  },
];

function buildAccount(spec: SeedSpec, now: number): TradingAccount {
  const rng = createRng(`seed-${spec.id}`);
  const days = pastTradingDays(now - spec.endOffsetDays * DAY, spec.tradingDays, rng, spec.skipChance);
  const trades = generateTrades({
    seed: `trades-${spec.id}`,
    count: spec.tradeCount,
    totalPnl: spec.profit,
    days,
    size: spec.size,
  });
  const startAt = days[0] - 16 * HOUR;
  const history = historyFromTrades(spec.size, trades, startAt);
  const balance = spec.size + spec.profit;
  const peak = Math.max(...history.map((p) => p.balance), balance + Math.max(0, spec.openPnl));
  const funded = spec.phase === "funded";
  const rules = funded
    ? { ...getRules(spec.model, 0, spec.addOns), profitTargetPct: 0, minTradingDays: 0 }
    : getRules(spec.model, 0, spec.addOns);

  return {
    id: spec.id,
    login: spec.login,
    password: spec.password,
    server: brand.server,
    platform: spec.platform,
    model: spec.model,
    size: spec.size,
    phase: spec.phase,
    addOns: spec.addOns,
    rewardShare: spec.addOns.includes("split90") ? 0.9 : 0.8,
    rules,
    state: {
      initialBalance: spec.size,
      balance,
      equity: balance + spec.openPnl,
      dayStartBalance: balance,
      peakEquity: peak,
      tradingDays: spec.tradingDays,
      status: spec.status,
    },
    openPnl: spec.openPnl,
    driftBias: spec.openPnl,
    trades,
    history,
    dayKey: dayKey(now),
    lastTradeDay: dayKey(days[days.length - 1]),
    createdAt: startAt,
    passedAt: spec.status === "passed" ? trades[0]?.closeTime : undefined,
    note: spec.note,
    resets: 0,
  };
}

export type SeedState = {
  accounts: TradingAccount[];
  selectedAccountId: string;
  payouts: Payout[];
  notifications: Notification[];
  payoutWindowClosesAt: number;
  nextLogin: number;
};

export function createSeedState(now: number): SeedState {
  const accounts = SPECS.map((s) => buildAccount(s, now));
  const payouts: Payout[] = [
    {
      id: "PO-10482",
      accountId: "acc-200k",
      accountLabel: "$200K 2-Step Funded · #8812199",
      gross: 4681,
      split: 0.9,
      amount: 4212.9,
      method: "usdt",
      destination: "TQ5b…E1Vt",
      stage: "paid",
      requestedAt: now - 15 * DAY - 6 * HOUR,
      paidAt: now - 15 * DAY,
      txRef: "0x8f3a…c21d",
      finalized: true,
    },
    {
      id: "PO-10311",
      accountId: "acc-legacy",
      accountLabel: "$100K 2-Step Funded · #8811876",
      gross: 3575.63,
      split: 0.8,
      amount: 2860.5,
      method: "rise",
      destination: "alex.morgan@example.com",
      stage: "paid",
      requestedAt: now - 44 * DAY - 9 * HOUR,
      paidAt: now - 44 * DAY,
      txRef: "RISE-77120",
      finalized: true,
    },
  ];
  const notifications: Notification[] = [
    {
      id: "n1",
      title: "Reward available",
      body: "$5,778.00 is ready to withdraw from your $200K funded account.",
      at: now - 2 * HOUR,
      read: false,
      tone: "success",
      href: "/dashboard/payouts",
    },
    {
      id: "n2",
      title: "Phase 1 progress",
      body: "Your $100K 2-Step is 62% of the way to its profit target.",
      at: now - 5 * HOUR,
      read: false,
      tone: "info",
      href: "/dashboard/accounts/acc-100k",
    },
    {
      id: "n3",
      title: "Verification required",
      body: "Your $50K 1-Step passed. Complete KYC to unlock the funded account.",
      at: now - 26 * HOUR,
      read: false,
      tone: "warning",
      href: "/dashboard/settings",
    },
  ];
  return {
    accounts,
    selectedAccountId: "acc-100k",
    payouts,
    notifications,
    payoutWindowClosesAt: now + 2 * DAY + 14 * HOUR + 5 * 60_000,
    nextLogin: 8812345,
  };
}
