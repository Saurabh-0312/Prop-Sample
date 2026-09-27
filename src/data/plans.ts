import { brand } from "@/config/brand";
import type { Rules } from "@/lib/rules";

export type ModelId = "two-step" | "one-step" | "instant";
export const MODEL_IDS: ModelId[] = ["two-step", "one-step", "instant"];

export const ACCOUNT_SIZES = [5000, 10000, 25000, 50000, 100000, 200000] as const;
export type AccountSize = (typeof ACCOUNT_SIZES)[number];
export const POPULAR_SIZE: AccountSize = 100000;
export const POPULAR_MODEL: ModelId = "two-step";

export type AddOnId = "split90" | "biweekly" | "nomindays";

export type AddOn = {
  id: AddOnId;
  label: string;
  short: string;
  pct: number;
  description: string;
};

export const ADD_ONS: AddOn[] = [
  {
    id: "split90",
    label: "90% Reward Share",
    short: "90% share",
    pct: 0.2,
    description: "Upgrade your funded reward share to 90% from the first payout.",
  },
  {
    id: "biweekly",
    label: "Bi-weekly Payouts",
    short: "Bi-weekly",
    pct: 0.15,
    description: "Request rewards every 14 days instead of monthly.",
  },
  {
    id: "nomindays",
    label: "No Min Trading Days",
    short: "No min days",
    pct: 0.1,
    description: "Pass as soon as you hit the target — no minimum day count.",
  },
];

export type ChallengeModel = {
  id: ModelId;
  name: string;
  shortName: string;
  tagline: string;
  bestFor: string;
  phases: 0 | 1 | 2;
  profitTargets: [number, number] | [number] | [];
  dailyLossPct: number;
  maxLossPct: number;
  maxLossType: "static" | "trailing";
  minTradingDays: number;
  timeLimit: string;
  rewardShare: number;
  payoutFrequency: string;
  firstPayoutDays: number;
  leverage: string;
  newsTrading: string;
  weekendHolding: string;
  eas: string;
  feeRefund: string;
  /** Add-ons that are already part of this model. */
  included: AddOnId[];
  prices: Record<AccountSize, number>;
  highlights: string[];
};

export const MODELS: Record<ModelId, ChallengeModel> = {
  "two-step": {
    id: "two-step",
    name: "2-Step Evaluation",
    shortName: "2-Step",
    tagline: "The classic path. Lowest price, most forgiving limits.",
    bestFor: "Patient swing and intraday traders who want the widest drawdown room.",
    phases: 2,
    profitTargets: [0.08, 0.05],
    dailyLossPct: 0.05,
    maxLossPct: 0.1,
    maxLossType: "static",
    minTradingDays: 4,
    timeLimit: "Unlimited",
    rewardShare: 0.8,
    payoutFrequency: "Monthly",
    firstPayoutDays: 30,
    leverage: "1:100",
    newsTrading: "Allowed",
    weekendHolding: "Allowed",
    eas: "Allowed",
    feeRefund: "100% with 1st reward",
    included: [],
    prices: { 5000: 49, 10000: 89, 25000: 179, 50000: 299, 100000: 499, 200000: 949 },
    highlights: ["10% static max loss", "Unlimited time", "Fee refunded"],
  },
  "one-step": {
    id: "one-step",
    name: "1-Step Evaluation",
    shortName: "1-Step",
    tagline: "One phase, one target. Get funded faster.",
    bestFor: "Confident traders who want a single target and a faster route to funding.",
    phases: 1,
    profitTargets: [0.1],
    dailyLossPct: 0.03,
    maxLossPct: 0.06,
    maxLossType: "trailing",
    minTradingDays: 3,
    timeLimit: "Unlimited",
    rewardShare: 0.8,
    payoutFrequency: "Monthly",
    firstPayoutDays: 30,
    leverage: "1:50",
    newsTrading: "Restricted ±2 min",
    weekendHolding: "Allowed",
    eas: "Allowed",
    feeRefund: "100% with 1st reward",
    included: [],
    prices: { 5000: 59, 10000: 105, 25000: 209, 50000: 349, 100000: 579, 200000: 1099 },
    highlights: ["Single 10% target", "Trailing drawdown", "Fee refunded"],
  },
  instant: {
    id: "instant",
    name: "Instant Funding",
    shortName: "Instant",
    tagline: "Skip the evaluation. Funded from day one.",
    bestFor: "Proven traders who want rewards immediately and accept tighter limits.",
    phases: 0,
    profitTargets: [],
    dailyLossPct: 0.03,
    maxLossPct: 0.05,
    maxLossType: "trailing",
    minTradingDays: 0,
    timeLimit: "Unlimited",
    rewardShare: 0.7,
    payoutFrequency: "Every 14 days",
    firstPayoutDays: 14,
    leverage: "1:30",
    newsTrading: "Restricted ±5 min",
    weekendHolding: "Not allowed",
    eas: "Allowed (no HFT)",
    feeRefund: "Not refundable",
    included: ["biweekly", "nomindays"],
    prices: { 5000: 129, 10000: 229, 25000: 449, 50000: 749, 100000: 1249, 200000: 2399 },
    highlights: ["No evaluation", "Bi-weekly rewards", "Trade today"],
  },
};

/** Average first-cycle reward per tier (marketing proof point, simulated). */
export const AVG_REWARD: Record<AccountSize, number> = {
  5000: 412,
  10000: 836,
  25000: 1_948,
  50000: 3_812,
  100000: 7_236,
  200000: 13_984,
};

export function isModelId(v: unknown): v is ModelId {
  return typeof v === "string" && (MODEL_IDS as string[]).includes(v);
}
export function isAccountSize(v: unknown): v is AccountSize {
  return typeof v === "number" && (ACCOUNT_SIZES as readonly number[]).includes(v);
}

export function hasPromo(model: ModelId): boolean {
  return brand.promo.active && brand.promo.models.includes(model);
}

/** Price of the add-ons that actually apply to this model (included ones are free). */
export function effectiveAddOns(model: ModelId, addOns: AddOnId[]): AddOnId[] {
  const inc = MODELS[model].included;
  return addOns.filter((a) => !inc.includes(a));
}

export type PlanPrice = {
  /** list price incl. add-ons, before promo */
  list: number;
  /** what the trader pays before coupons */
  price: number;
  /** strike-through price, only when a promo applies */
  compareAt: number | null;
  addOnTotal: number;
  promoSavings: number;
};

export function getPlanPrice(model: ModelId, size: AccountSize, addOns: AddOnId[] = []): PlanPrice {
  const base = MODELS[model].prices[size];
  const addOnPct = effectiveAddOns(model, addOns).reduce(
    (sum, id) => sum + (ADD_ONS.find((a) => a.id === id)?.pct ?? 0),
    0,
  );
  const addOnTotal = Math.round(base * addOnPct * 100) / 100;
  const list = base + addOnTotal;
  const promo = hasPromo(model);
  const price = promo ? Math.round(list * (1 - brand.promo.pct / 100)) : list;
  return {
    list,
    price,
    compareAt: promo ? list : null,
    addOnTotal,
    promoSavings: promo ? list - price : 0,
  };
}

export function getRules(model: ModelId, phaseIndex = 0, addOns: AddOnId[] = []): Rules {
  const m = MODELS[model];
  const noMin = addOns.includes("nomindays") || m.included.includes("nomindays");
  return {
    profitTargetPct: m.profitTargets[phaseIndex] ?? 0,
    dailyLossPct: m.dailyLossPct,
    maxLossPct: m.maxLossPct,
    maxLossType: m.maxLossType,
    minTradingDays: noMin ? 0 : m.minTradingDays,
  };
}

export function rewardShareFor(model: ModelId, addOns: AddOnId[]): number {
  return addOns.includes("split90") ? 0.9 : MODELS[model].rewardShare;
}

export function payoutFrequencyFor(model: ModelId, addOns: AddOnId[]): string {
  const m = MODELS[model];
  if (m.included.includes("biweekly") || addOns.includes("biweekly")) return "Every 14 days";
  return m.payoutFrequency;
}

export function firstPayoutFor(model: ModelId, addOns: AddOnId[]): string {
  const m = MODELS[model];
  if (m.included.includes("biweekly") || addOns.includes("biweekly")) return "14 days";
  return `${m.firstPayoutDays} days`;
}

export function planLabel(model: ModelId, size: AccountSize): string {
  return `$${size / 1000}K ${MODELS[model].shortName}`;
}

/* ───────────── Rule rows for the selector + comparison table ───────────── */

export type RuleUnit = "pct" | "usd";

export type RuleRow = {
  id: string;
  label: string;
  tooltip: string;
  value: (model: ModelId, size: AccountSize, addOns: AddOnId[], unit: RuleUnit) => string;
  /** optional small sub-label (e.g. "Static" / "Trailing") */
  sub?: (model: ModelId) => string | null;
};

const pctOrUsd = (pct: number, size: number, unit: RuleUnit) =>
  unit === "usd"
    ? new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
        maximumFractionDigits: 0,
      }).format(pct * size)
    : `${+(pct * 100).toFixed(2)}%`;

export const RULE_ROWS: RuleRow[] = [
  {
    id: "target",
    label: "Profit Target",
    tooltip:
      "The closed profit you need to reach — as a share of the starting balance — to pass a phase. Phase 1 is the evaluation, Phase 2 the verification.",
    value: (model, size, _a, unit) => {
      const t = MODELS[model].profitTargets;
      if (t.length === 0) return "None";
      return t.map((p) => pctOrUsd(p, size, unit)).join(" → ");
    },
    sub: (model) => {
      const n = MODELS[model].profitTargets.length;
      return n === 2 ? "Phase 1 → Phase 2" : n === 1 ? "Single phase" : "Funded from day one";
    },
  },
  {
    id: "daily",
    label: "Daily Loss Limit",
    tooltip:
      "How far your equity may fall below the day's starting balance, measured as a % of the initial balance. Floating losses count. Resets at 00:00 server time.",
    value: (model, size, _a, unit) => pctOrUsd(MODELS[model].dailyLossPct, size, unit),
  },
  {
    id: "max",
    label: "Max Loss",
    tooltip:
      "The lowest your equity may ever go. Static: a fixed floor at initial balance × (1 − limit). Trailing: the floor rises with your highest equity and locks at the starting balance.",
    value: (model, size, _a, unit) => pctOrUsd(MODELS[model].maxLossPct, size, unit),
    sub: (model) => (MODELS[model].maxLossType === "static" ? "Static" : "Trailing"),
  },
  {
    id: "mindays",
    label: "Min Trading Days",
    tooltip: "Distinct days with at least one trade that you need before a phase can be passed.",
    value: (model, _s, addOns) => {
      const m = MODELS[model];
      if (m.minTradingDays === 0 || m.included.includes("nomindays") || addOns.includes("nomindays"))
        return "None";
      return `${m.minTradingDays} days${m.phases === 2 ? " / phase" : ""}`;
    },
  },
  {
    id: "time",
    label: "Time Limit",
    tooltip: "How long you have to reach the target. Unlimited means you can take your time.",
    value: (model) => MODELS[model].timeLimit,
  },
  {
    id: "share",
    label: "Reward Share",
    tooltip: "Your share of the profits made on a funded account, paid as a performance reward.",
    value: (model, _s, addOns) => `${Math.round(rewardShareFor(model, addOns) * 100)}%`,
    sub: () => "Up to 90% with add-on",
  },
  {
    id: "frequency",
    label: "Payout Frequency",
    tooltip: "How often you can request a reward once you are funded.",
    value: (model, _s, addOns) => payoutFrequencyFor(model, addOns),
  },
  {
    id: "first",
    label: "First Payout",
    tooltip: "When your first reward request becomes available after your funded account is created.",
    value: (model, _s, addOns) => firstPayoutFor(model, addOns),
  },
  {
    id: "leverage",
    label: "Leverage",
    tooltip: "Maximum leverage on FX majors. Indices, metals and crypto use lower leverage.",
    value: (model) => MODELS[model].leverage,
  },
  {
    id: "news",
    label: "News Trading",
    tooltip: "Whether you may open or close trades around high-impact economic news releases.",
    value: (model) => MODELS[model].newsTrading,
  },
  {
    id: "weekend",
    label: "Weekend Holding",
    tooltip: "Whether positions may stay open over the weekend market close.",
    value: (model) => MODELS[model].weekendHolding,
  },
  {
    id: "eas",
    label: "EAs Allowed",
    tooltip:
      "Expert Advisors are automated trading bots. HFT, latency arbitrage and tick scalping are never allowed.",
    value: (model) => MODELS[model].eas,
  },
  {
    id: "refund",
    label: "Fee Refund",
    tooltip: "Your challenge fee is paid back together with your first reward on the funded account.",
    value: (model) => MODELS[model].feeRefund,
  },
];

/** The compact subset shown in the homepage selector. */
export const SELECTOR_ROW_IDS = ["target", "daily", "max", "mindays", "share", "frequency", "leverage"];
