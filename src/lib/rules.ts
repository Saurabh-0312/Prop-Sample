/**
 * Demo rules engine — pure functions, no I/O.
 * The live simulation, Demo Controls, gauges, breach and pass modals are all
 * driven by `evaluate()` so the numbers always agree (mirrors blueprint §5).
 */

export type Rules = {
  /** 0.08 = 8%. 0 means no profit target (e.g. Instant Funding / Funded). */
  profitTargetPct: number;
  dailyLossPct: number;
  maxLossPct: number;
  maxLossType: "static" | "trailing";
  minTradingDays: number;
};

export type AccountStatus = "active" | "passed" | "breached" | "funded";

export type AccountState = {
  initialBalance: number;
  balance: number;
  equity: number;
  dayStartBalance: number;
  peakEquity: number;
  tradingDays: number;
  status: AccountStatus;
};

export type RuleEvent = "DAILY_LOSS_BREACH" | "MAX_LOSS_BREACH" | "PASSED" | null;

/** Daily floor = dayStartBalance − dailyLossPct × initialBalance. */
export function dailyFloor(state: AccountState, rules: Rules): number {
  return state.dayStartBalance - rules.dailyLossPct * state.initialBalance;
}

/**
 * Static: initialBalance × (1 − maxLossPct).
 * Trailing: min(peakEquity − maxLossPct × initialBalance, initialBalance) — locks at the starting balance.
 */
export function maxLossFloor(state: AccountState, rules: Rules): number {
  if (rules.maxLossType === "static") return state.initialBalance * (1 - rules.maxLossPct);
  return Math.min(state.peakEquity - rules.maxLossPct * state.initialBalance, state.initialBalance);
}

export function targetBalance(state: AccountState, rules: Rules): number | null {
  return rules.profitTargetPct > 0 ? state.initialBalance * (1 + rules.profitTargetPct) : null;
}

export function evaluate(
  state: AccountState,
  rules: Rules,
): { state: AccountState; event: RuleEvent } {
  // Only live accounts are monitored.
  if (state.status !== "active" && state.status !== "funded") return { state, event: null };

  const next: AccountState = { ...state, peakEquity: Math.max(state.peakEquity, state.equity) };

  // Hard limits are checked on every equity change, not just on closed trades.
  if (next.equity <= dailyFloor(next, rules)) {
    return { state: { ...next, status: "breached" }, event: "DAILY_LOSS_BREACH" };
  }
  if (next.equity <= maxLossFloor(next, rules)) {
    return { state: { ...next, status: "breached" }, event: "MAX_LOSS_BREACH" };
  }

  const target = targetBalance(next, rules);
  if (
    next.status === "active" &&
    target !== null &&
    next.balance >= target &&
    next.tradingDays >= rules.minTradingDays
  ) {
    return { state: { ...next, status: "passed" }, event: "PASSED" };
  }

  return { state: next, event: null };
}

export type Objectives = {
  profit: number;
  profitTarget: number | null;
  profitProgress: number;
  dailyLimit: number;
  dailyFloor: number;
  dailyBuffer: number;
  dailyUsedPct: number;
  maxLimit: number;
  maxFloor: number;
  maxBuffer: number;
  maxUsedPct: number;
  tradingDays: number;
  minTradingDays: number;
  todayPnl: number;
};

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** Derived numbers for gauges, progress bars and status icons. */
export function getObjectives(state: AccountState, rules: Rules): Objectives {
  const profit = state.balance - state.initialBalance;
  const profitTarget = rules.profitTargetPct > 0 ? rules.profitTargetPct * state.initialBalance : null;
  const dLimit = rules.dailyLossPct * state.initialBalance;
  const dFloor = dailyFloor(state, rules);
  const dBuffer = Math.max(0, state.equity - dFloor);
  const mLimit = rules.maxLossPct * state.initialBalance;
  const mFloor = maxLossFloor({ ...state, peakEquity: Math.max(state.peakEquity, state.equity) }, rules);
  const mBuffer = Math.max(0, state.equity - mFloor);
  return {
    profit,
    profitTarget,
    profitProgress: profitTarget ? clamp01(profit / profitTarget) : 0,
    dailyLimit: dLimit,
    dailyFloor: dFloor,
    dailyBuffer: dBuffer,
    dailyUsedPct: clamp01(1 - dBuffer / dLimit),
    maxLimit: mLimit,
    maxFloor: mFloor,
    maxBuffer: mBuffer,
    maxUsedPct: clamp01(1 - mBuffer / mLimit),
    tradingDays: state.tradingDays,
    minTradingDays: rules.minTradingDays,
    todayPnl: state.equity - state.dayStartBalance,
  };
}

/** Colour tier for limit usage: ≥70% gold, ≥90% red. */
export function usageTone(usedPct: number): "ok" | "warn" | "danger" {
  if (usedPct >= 0.9) return "danger";
  if (usedPct >= 0.7) return "warn";
  return "ok";
}
