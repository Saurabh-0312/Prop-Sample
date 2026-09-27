import type { AccountSize, AddOnId, ModelId } from "@/data/plans";
import type { AccountState, Rules } from "@/lib/rules";

export type Platform = "MetaTrader 5" | "cTrader" | "Match-Trader" | "TradeLocker";
export const PLATFORMS: Platform[] = ["MetaTrader 5", "cTrader", "Match-Trader", "TradeLocker"];

export type Phase = "phase-1" | "phase-2" | "funded";

export type Trade = {
  id: string;
  symbol: string;
  side: "buy" | "sell";
  lots: number;
  openPrice: number;
  closePrice: number;
  openTime: number;
  closeTime: number;
  pnl: number;
};

export type EquityPoint = { t: number; balance: number; equity: number };

export type BreachInfo = {
  rule: "DAILY_LOSS" | "MAX_LOSS";
  equity: number;
  floor: number;
  limit: number;
  balance: number;
  at: number;
};

export type TradingAccount = {
  id: string;
  login: string;
  password: string;
  server: string;
  platform: Platform;
  model: ModelId;
  size: AccountSize;
  phase: Phase;
  addOns: AddOnId[];
  rewardShare: number;
  rules: Rules;
  state: AccountState;
  /** Floating P/L of open positions (simulated). */
  openPnl: number;
  /** Where the floating P/L random walk drifts towards. */
  driftBias: number;
  /** Newest first. */
  trades: Trade[];
  history: EquityPoint[];
  dayKey: string;
  lastTradeDay: string | null;
  createdAt: number;
  parentId?: string;
  breach?: BreachInfo;
  passedAt?: number;
  note?: string;
  resets: number;
};

export type PayoutMethod = "usdt" | "usdc" | "bank" | "rise";
export type PayoutStage = "requested" | "review" | "approved" | "paid" | "rejected";

export type Payout = {
  id: string;
  accountId: string;
  accountLabel: string;
  gross: number;
  split: number;
  amount: number;
  method: PayoutMethod;
  destination: string;
  stage: PayoutStage;
  requestedAt: number;
  paidAt?: number;
  txRef?: string;
  /** Seeded history entries are finished; new ones are finalised once. */
  finalized?: boolean;
};

export type Notification = {
  id: string;
  title: string;
  body: string;
  at: number;
  read: boolean;
  tone: "info" | "success" | "warning" | "danger";
  href?: string;
};

export type Session = {
  name: string;
  email: string;
  country: string;
};

export type Order = {
  id: string;
  accountId: string;
  label: string;
  amount: number;
  method: "card" | "crypto";
  at: number;
  coupon?: string;
};
