import { createRng } from "@/lib/rng";
import type { PayoutMethod } from "@/lib/types";

export const ADMIN_KPIS = {
  revenue30d: 1_240_000,
  revenueDelta: 0.142,
  orders: 4_812,
  ordersDelta: 0.087,
  passRate: 0.118,
  passRateDelta: -0.006,
  funded: 612,
  fundedDelta: 0.051,
  payoutRatio: 0.384,
  payoutRatioDelta: -0.021,
  pendingPayouts: 23,
};

/** 30 days of revenue that sums to the 30-day KPI. `day` is days ago (29 → 0). */
export const REVENUE_SERIES: { day: number; revenue: number; orders: number }[] = (() => {
  const rng = createRng("admin-revenue");
  const raw = Array.from({ length: 30 }, (_, i) => {
    const trend = 0.82 + (i / 29) * 0.36;
    const weekday = [0.78, 1.06, 1.12, 1.08, 1.1, 1.14, 0.84][i % 7];
    const promo = i >= 21 && i <= 24 ? 1.35 : 1;
    return trend * weekday * promo * rng.range(0.9, 1.1);
  });
  const sum = raw.reduce((a, b) => a + b, 0);
  return raw.map((r, i) => {
    const revenue = Math.round((r / sum) * ADMIN_KPIS.revenue30d);
    return { day: 29 - i, revenue, orders: Math.round(revenue / 258) };
  });
})();

export const SALES_BY_MODEL = [
  { id: "two-step", name: "2-Step", value: 719_200 },
  { id: "one-step", name: "1-Step", value: 334_800 },
  { id: "instant", name: "Instant", value: 186_000 },
];

export type RiskAccount = {
  id: string;
  login: string;
  trader: string;
  country: string;
  plan: string;
  equity: number;
  dailyUsed: number;
  maxUsed: number;
  flags: string[];
  phase: "Phase 1" | "Phase 2" | "Funded";
};

export const RISK_ACCOUNTS: RiskAccount[] = [
  { id: "r1", login: "10233", trader: "Viktor S.", country: "CZ", plan: "$200K 2-Step", equity: 191_240, dailyUsed: 0.86, maxUsed: 0.44, flags: ["HFT pattern"], phase: "Funded" },
  { id: "r2", login: "10419", trader: "Mateo G.", country: "MX", plan: "$100K 1-Step", equity: 95_880, dailyUsed: 0.79, maxUsed: 0.69, flags: [], phase: "Phase 1" },
  { id: "r3", login: "10388", trader: "Chen L.", country: "SG", plan: "$50K 2-Step", equity: 47_910, dailyUsed: 0.64, maxUsed: 0.42, flags: ["Same IP as #10233"], phase: "Phase 2" },
  { id: "r4", login: "10502", trader: "Omar F.", country: "EG", plan: "$200K Instant", equity: 192_600, dailyUsed: 0.58, maxUsed: 0.74, flags: ["Copy-trading cluster"], phase: "Funded" },
  { id: "r5", login: "10277", trader: "Isabella F.", country: "IT", plan: "$100K 2-Step", equity: 96_450, dailyUsed: 0.52, maxUsed: 0.36, flags: [], phase: "Phase 1" },
  { id: "r6", login: "10611", trader: "Emeka U.", country: "NG", plan: "$25K 1-Step", equity: 24_120, dailyUsed: 0.71, maxUsed: 0.58, flags: ["Copy-trading cluster"], phase: "Phase 1" },
  { id: "r7", login: "10145", trader: "Jonas E.", country: "SE", plan: "$100K 2-Step", equity: 101_930, dailyUsed: 0.47, maxUsed: 0.21, flags: ["News straddling"], phase: "Funded" },
];

export type QueueItem = {
  id: string;
  trader: string;
  country: string;
  account: string;
  amount: number;
  method: PayoutMethod;
  requested: string;
  risk: "Low" | "Medium" | "High";
  note: string;
};

export const PAYOUT_QUEUE: QueueItem[] = [
  { id: "PO-10591", trader: "Ahmed K.", country: "AE", account: "$200K 2-Step · #10041", amount: 12_480.5, method: "usdt", requested: "12 min ago", risk: "Low", note: "Consistent, 23 trading days" },
  { id: "PO-10590", trader: "Priya S.", country: "IN", account: "$100K 2-Step · #10112", amount: 4_236.0, method: "rise", requested: "38 min ago", risk: "Low", note: "KYC verified" },
  { id: "PO-10588", trader: "Viktor S.", country: "CZ", account: "$200K 2-Step · #10233", amount: 9_864.2, method: "usdc", requested: "1h ago", risk: "High", note: "HFT pattern · avg hold 41s" },
  { id: "PO-10587", trader: "Lucas M.", country: "BR", account: "$50K 1-Step · #10307", amount: 2_118.75, method: "usdt", requested: "2h ago", risk: "Low", note: "First payout · fee refund" },
  { id: "PO-10585", trader: "Omar F.", country: "EG", account: "$200K Instant · #10502", amount: 7_392.4, method: "bank", requested: "3h ago", risk: "Medium", note: "Copy-trading cluster (3 accts)" },
  { id: "PO-10584", trader: "Hannah K.", country: "DE", account: "$100K 1-Step · #10198", amount: 3_054.1, method: "bank", requested: "4h ago", risk: "Low", note: "KYC verified" },
];

export const TEMPLATE_DEFAULTS = {
  name: "Stellar 2-Step",
  profitTarget: 8,
  phase2Target: 5,
  dailyLoss: 5,
  maxLoss: 10,
  maxLossType: "static" as "static" | "trailing",
  minDays: 4,
  split: 80,
  prices: { 10000: 89, 50000: 299, 100000: 499, 200000: 949 } as Record<number, number>,
};
