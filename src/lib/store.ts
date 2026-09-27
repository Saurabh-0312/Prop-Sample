import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { brand } from "@/config/brand";
import { createSeedState } from "@/data/accounts";
import {
  MODELS,
  getRules,
  planLabel,
  rewardShareFor,
  type AccountSize,
  type AddOnId,
  type ModelId,
} from "@/data/plans";
import { makeTrade } from "@/data/trades";
import { dayKey } from "@/lib/format";
import { createRng } from "@/lib/rng";
import { dailyFloor, evaluate, getObjectives, maxLossFloor, targetBalance } from "@/lib/rules";
import type {
  BreachInfo,
  EquityPoint,
  Notification,
  Order,
  Payout,
  PayoutMethod,
  PayoutStage,
  Platform,
  Session,
  Trade,
  TradingAccount,
} from "@/lib/types";

/* ─────────────────────────── Types ─────────────────────────── */

export type DemoEvent =
  | { type: "breach"; accountId: string; at: number }
  | { type: "pass"; accountId: string; newAccountId: string | null; at: number }
  | { type: "payout-paid"; payoutId: string; at: number }
  | null;

export type ActionResult = { ok: boolean; message: string; trade?: Trade };

export type KycStatus = "none" | "pending" | "verified";

type PersistedState = {
  seededAt: number;
  session: Session | null;
  accounts: TradingAccount[];
  selectedAccountId: string | null;
  payouts: Payout[];
  notifications: Notification[];
  orders: Order[];
  adminDecisions: Record<string, "approved" | "rejected">;
  payoutWindowClosesAt: number;
  nextPayoutAt: number | null;
  nextLogin: number;
  kycStatus: KycStatus;
  settings: {
    twoFactor: boolean;
    notifyTrades: boolean;
    notifyPayouts: boolean;
    notifyNews: boolean;
    notifyMarketing: boolean;
  };
};

type RuntimeState = {
  hydrated: boolean;
  event: DemoEvent;
  /** Recent live equity ticks per account (not persisted). */
  liveTail: Record<string, EquityPoint[]>;
};

type Actions = {
  seed: (now: number) => void;
  resetDemo: () => void;
  login: (session: Session) => void;
  loginDemo: () => void;
  logout: () => void;
  selectAccount: (id: string) => void;
  tick: (now: number) => void;
  simulateTrade: (accountId: string, kind: "win" | "loss") => ActionResult;
  pushTowardDailyLimit: (accountId: string) => ActionResult;
  triggerBreach: (accountId: string) => ActionResult;
  passPhase: (accountId: string) => ActionResult;
  resetAccount: (accountId: string) => ActionResult;
  purchaseAccount: (input: PurchaseInput) => TradingAccount;
  requestPayout: (input: PayoutInput) => Payout | null;
  advancePayouts: (now: number) => { payout: Payout; stage: PayoutStage }[];
  adminDecide: (id: string, decision: "approved" | "rejected") => void;
  markAllRead: () => void;
  markRead: (id: string) => void;
  clearEvent: () => void;
  completeKyc: () => void;
  updateSettings: (patch: Partial<PersistedState["settings"]>) => void;
  updateProfile: (patch: Partial<Session>) => void;
  resetPassword: (accountId: string) => string | null;
};

export type PurchaseInput = {
  model: ModelId;
  size: AccountSize;
  platform: Platform;
  addOns: AddOnId[];
  amount: number;
  method: "card" | "crypto";
  coupon?: string;
  session: Session;
};

export type PayoutInput = {
  accountId: string;
  amount: number;
  method: PayoutMethod;
  destination: string;
};

export type DemoStore = PersistedState & RuntimeState & Actions;

/* ─────────────────────────── Helpers ─────────────────────────── */

const HOUR = 3_600_000;
const DAY = 24 * HOUR;
export const PAYOUT_STEP_MS = 2000;
const round2 = (n: number) => Math.round(n * 100) / 100;

// Seeded RNG for the live simulation and Demo Controls — no Math.random().
let simRng = createRng("novaedge-live-sim");

export const DEMO_TRADER: Session = {
  name: "Alex Morgan",
  email: "alex.morgan@example.com",
  country: "GB",
};

const defaultSettings: PersistedState["settings"] = {
  twoFactor: false,
  notifyTrades: true,
  notifyPayouts: true,
  notifyNews: true,
  notifyMarketing: false,
};

export function isLive(acc: TradingAccount): boolean {
  return acc.state.status === "active" || acc.state.status === "funded";
}

export function accountLabel(acc: TradingAccount): string {
  const phase = acc.phase === "funded" ? "Funded" : acc.phase === "phase-2" ? "Phase 2" : MODELS[acc.model].phases === 1 ? "Challenge" : "Phase 1";
  return `${planLabel(acc.model, acc.size)} · ${phase}`;
}

export function phaseLabel(acc: TradingAccount): string {
  if (acc.phase === "funded") return "Funded";
  if (acc.phase === "phase-2") return "Phase 2";
  return "Phase 1";
}

/** "Phase 1" / "Phase 2" for 2-Step, "Challenge" for single-phase models. */
export function stageLabel(acc: TradingAccount): string {
  if (acc.phase === "phase-1" && MODELS[acc.model].phases === 1) return "Challenge";
  return phaseLabel(acc);
}

function withEquity(acc: TradingAccount, openPnl: number): TradingAccount {
  return {
    ...acc,
    openPnl,
    state: { ...acc.state, equity: round2(acc.state.balance + openPnl) },
  };
}

function newPassword(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
  const sym = "#$!%";
  let p = "";
  for (let i = 0; i < 9; i++) p += chars[Math.floor(simRng.next() * chars.length)];
  return p.slice(0, 3) + sym[Math.floor(simRng.next() * sym.length)] + p.slice(3);
}

function notification(now: number, n: Omit<Notification, "id" | "at" | "read">): Notification {
  return { ...n, id: `n-${now}-${Math.floor(simRng.next() * 1e6)}`, at: now, read: false };
}

/** Closes floating positions as a realised trade (used on breach). */
function realiseOpenPnl(acc: TradingAccount, now: number): TradingAccount {
  if (Math.abs(acc.openPnl) < 0.01) return acc;
  const trade = makeTrade(simRng, {
    id: `T${48_000_000 + Math.floor(simRng.next() * 900_000)}`,
    pnl: acc.openPnl,
    openTime: now - simRng.range(20, 140) * 60_000,
    durationMin: 0,
  });
  trade.closeTime = now;
  const balance = round2(acc.state.balance + acc.openPnl);
  return {
    ...acc,
    openPnl: 0,
    driftBias: 0,
    trades: [trade, ...acc.trades],
    history: [...acc.history, { t: now, balance, equity: balance }],
    state: { ...acc.state, balance, equity: balance },
  };
}

function buildNextPhase(parent: TradingAccount, now: number, login: number): TradingAccount {
  const toFunded = parent.phase === "phase-2" || MODELS[parent.model].phases === 1;
  const phase: TradingAccount["phase"] = toFunded ? "funded" : "phase-2";
  const rules = toFunded
    ? { ...getRules(parent.model, 0, parent.addOns), profitTargetPct: 0, minTradingDays: 0 }
    : getRules(parent.model, 1, parent.addOns);
  const size = parent.size;
  return {
    id: `acc-${login}`,
    login: String(login),
    password: newPassword(),
    server: brand.server,
    platform: parent.platform,
    model: parent.model,
    size,
    phase,
    addOns: parent.addOns,
    rewardShare: parent.rewardShare,
    rules,
    state: {
      initialBalance: size,
      balance: size,
      equity: size,
      dayStartBalance: size,
      peakEquity: size,
      tradingDays: 0,
      status: toFunded ? "funded" : "active",
    },
    openPnl: 0,
    driftBias: size * 0.0012,
    trades: [],
    history: [{ t: now, balance: size, equity: size }],
    dayKey: dayKey(now),
    lastTradeDay: null,
    createdAt: now,
    parentId: parent.id,
    resets: 0,
  };
}

type Mutable = Pick<DemoStore, "accounts" | "notifications" | "nextLogin"> & { event: DemoEvent };

/** Applies an evaluate() result: breach evidence, pass + next phase, events and notifications. */
function applyEvaluation(
  draft: Mutable,
  acc: TradingAccount,
  now: number,
): { account: TradingAccount; draft: Mutable } {
  const { state, event } = evaluate(acc.state, acc.rules);
  let account: TradingAccount = { ...acc, state };
  let next = { ...draft };

  if (event === "DAILY_LOSS_BREACH" || event === "MAX_LOSS_BREACH") {
    const daily = event === "DAILY_LOSS_BREACH";
    const breach: BreachInfo = {
      rule: daily ? "DAILY_LOSS" : "MAX_LOSS",
      equity: state.equity,
      floor: daily ? dailyFloor(state, acc.rules) : maxLossFloor(state, acc.rules),
      limit: (daily ? acc.rules.dailyLossPct : acc.rules.maxLossPct) * state.initialBalance,
      balance: state.balance,
      at: now,
    };
    account = realiseOpenPnl({ ...account, breach }, now);
    account = { ...account, state: { ...account.state, status: "breached" } };
    next = {
      ...next,
      event: { type: "breach", accountId: acc.id, at: now },
      notifications: [
        notification(now, {
          title: daily ? "Daily loss limit exceeded" : "Max loss limit exceeded",
          body: `Account #${acc.login} was breached by the risk engine. Trading is disabled.`,
          tone: "danger",
          href: `/dashboard/accounts/${acc.id}`,
        }),
        ...next.notifications,
      ],
    };
  } else if (event === "PASSED") {
    account = {
      ...account,
      openPnl: 0,
      driftBias: 0,
      passedAt: now,
      state: { ...account.state, equity: account.state.balance },
    };
    const child = buildNextPhase(account, now, next.nextLogin);
    next = {
      ...next,
      nextLogin: next.nextLogin + 1,
      accounts: [...next.accounts, child],
      event: { type: "pass", accountId: acc.id, newAccountId: child.id, at: now },
      notifications: [
        notification(now, {
          title: `${phaseLabel(acc)} passed`,
          body: `Congratulations! Your ${child.phase === "funded" ? "funded" : "Phase 2"} account #${child.login} is ready.`,
          tone: "success",
          href: `/dashboard/accounts/${child.id}`,
        }),
        ...next.notifications,
      ],
    };
  }
  return { account, draft: next };
}

function replaceAccount(list: TradingAccount[], acc: TradingAccount): TradingAccount[] {
  return list.map((a) => (a.id === acc.id ? acc : a));
}

/** Runs the account through the rules engine and commits everything to the store. */
function commit(
  get: () => DemoStore,
  set: (partial: Partial<DemoStore>) => void,
  account: TradingAccount,
  now: number,
  extra: Partial<DemoStore> = {},
) {
  const s = get();
  const base: Mutable = {
    accounts: replaceAccount(s.accounts, account),
    notifications: s.notifications,
    nextLogin: s.nextLogin,
    event: s.event,
  };
  const { account: evaluated, draft } = applyEvaluation(base, account, now);
  set({
    ...extra,
    accounts: replaceAccount(draft.accounts, evaluated),
    notifications: draft.notifications,
    nextLogin: draft.nextLogin,
    event: draft.event,
    liveTail: { ...get().liveTail, [account.id]: [] },
  });
  return evaluated;
}

/* ─────────────────────────── Store ─────────────────────────── */

const emptyState: PersistedState = {
  seededAt: 0,
  session: null,
  accounts: [],
  selectedAccountId: null,
  payouts: [],
  notifications: [],
  orders: [],
  adminDecisions: {},
  payoutWindowClosesAt: 0,
  nextPayoutAt: null,
  nextLogin: 8812345,
  kycStatus: "pending",
  settings: defaultSettings,
};

export const useDemoStore = create<DemoStore>()(
  persist(
    (set, get) => ({
      ...emptyState,
      hydrated: false,
      event: null,
      liveTail: {},

      seed: (now) => {
        simRng = createRng("novaedge-live-sim");
        const seed = createSeedState(now);
        set({
          ...seed,
          seededAt: now,
          orders: [],
          adminDecisions: {},
          nextPayoutAt: null,
          kycStatus: "pending",
          event: null,
          liveTail: {},
        });
      },

      resetDemo: () => {
        const { session, settings } = get();
        get().seed(Date.now());
        set({ session, settings });
      },

      login: (session) => set({ session }),
      loginDemo: () => set({ session: DEMO_TRADER }),
      logout: () => set({ session: null }),

      selectAccount: (id) => set({ selectedAccountId: id }),

      tick: (now) => {
        const s = get();
        const acc = s.accounts.find((a) => a.id === s.selectedAccountId);
        if (!acc || !isLive(acc)) return;

        let working = acc;
        // Server-day rollover: the daily loss reference resets at midnight.
        const today = dayKey(now);
        if (working.dayKey !== today) {
          working = {
            ...working,
            dayKey: today,
            state: { ...working.state, dayStartBalance: working.state.balance },
          };
        }

        // Mean-reverting random walk of the floating P/L.
        const sigma = working.size * 0.00062;
        let open = working.openPnl + (working.driftBias - working.openPnl) * 0.14 + simRng.normal(0, sigma);
        // Drift alone never breaches: keep a buffer above both floors.
        const st = { ...working.state, peakEquity: Math.max(working.state.peakEquity, working.state.equity) };
        const floor = Math.max(dailyFloor(st, working.rules), maxLossFloor(st, working.rules));
        const minEquity = floor + working.rules.dailyLossPct * working.size * 0.04;
        open = Math.max(open, minEquity - working.state.balance);
        working = withEquity(working, round2(open));

        const evaluated = evaluate(working.state, working.rules);
        working = { ...working, state: evaluated.state };
        const tail = [...(s.liveTail[acc.id] ?? []), { t: now, balance: working.state.balance, equity: working.state.equity }].slice(-28);
        set({
          accounts: replaceAccount(s.accounts, working),
          liveTail: { ...s.liveTail, [acc.id]: tail },
        });
      },

      simulateTrade: (accountId, kind) => {
        const s = get();
        const acc = s.accounts.find((a) => a.id === accountId);
        if (!acc) return { ok: false, message: "Account not found." };
        if (!isLive(acc)) return { ok: false, message: "This account is not live. Pick an active or funded account." };
        const now = Date.now();
        const scale = acc.size / 100_000;
        const pnl = round2((kind === "win" ? simRng.range(1200, 2500) : -simRng.range(800, 1800)) * scale);
        const trade = makeTrade(simRng, {
          id: `T${48_000_000 + Math.floor(simRng.next() * 900_000)}`,
          pnl,
          openTime: now - simRng.range(6, 95) * 60_000,
          durationMin: 0,
        });
        trade.closeTime = now;
        const balance = round2(acc.state.balance + pnl);
        const today = dayKey(now);
        const newDay = acc.lastTradeDay !== today;
        const next: TradingAccount = {
          ...acc,
          trades: [trade, ...acc.trades],
          history: [...acc.history, { t: now, balance, equity: round2(balance + acc.openPnl) }],
          lastTradeDay: today,
          state: {
            ...acc.state,
            balance,
            equity: round2(balance + acc.openPnl),
            tradingDays: acc.state.tradingDays + (newDay ? 1 : 0),
          },
        };
        commit(get, set, next, now);
        return {
          ok: true,
          trade,
          message: `${trade.side === "buy" ? "Buy" : "Sell"} ${trade.lots.toFixed(2)} ${trade.symbol} closed`,
        };
      },

      pushTowardDailyLimit: (accountId) => {
        const s = get();
        const acc = s.accounts.find((a) => a.id === accountId);
        if (!acc) return { ok: false, message: "Account not found." };
        if (!isLive(acc)) return { ok: false, message: "This account is not live." };
        const obj = getObjectives(acc.state, acc.rules);
        if (obj.dailyUsedPct >= 0.92) {
          return { ok: false, message: "Already at the edge — use “Trigger Breach” to cross the limit." };
        }
        const target = obj.dailyUsedPct < 0.7 ? simRng.range(0.74, 0.8) : simRng.range(0.9, 0.94);
        const equity = acc.state.dayStartBalance - target * obj.dailyLimit;
        const open = round2(equity - acc.state.balance);
        const now = Date.now();
        const next = { ...withEquity(acc, open), driftBias: open };
        commit(get, set, next, now);
        return {
          ok: true,
          message: `Floating loss now uses ${Math.round(target * 100)}% of the daily limit.`,
        };
      },

      triggerBreach: (accountId) => {
        const s = get();
        const acc = s.accounts.find((a) => a.id === accountId);
        if (!acc) return { ok: false, message: "Account not found." };
        if (!isLive(acc)) return { ok: false, message: "This account is not live." };
        const floor = dailyFloor(acc.state, acc.rules);
        const equity = floor - acc.size * 0.00031;
        const now = Date.now();
        const next = withEquity(acc, round2(equity - acc.state.balance));
        commit(get, set, next, now);
        return { ok: true, message: "Risk engine detected a daily loss breach." };
      },

      passPhase: (accountId) => {
        const s = get();
        const acc = s.accounts.find((a) => a.id === accountId);
        if (!acc) return { ok: false, message: "Account not found." };
        if (acc.state.status !== "active") {
          return {
            ok: false,
            message:
              acc.state.status === "funded"
                ? "Funded accounts have no profit target — request a payout instead."
                : "Select an active evaluation account to pass.",
          };
        }
        const target = targetBalance(acc.state, acc.rules);
        if (target === null) return { ok: false, message: "This account has no profit target." };
        const now = Date.now();
        const needed = Math.max(0, target - acc.state.balance) + acc.size * simRng.range(0.003, 0.009);
        const trade = makeTrade(simRng, {
          id: `T${48_000_000 + Math.floor(simRng.next() * 900_000)}`,
          pnl: round2(needed),
          openTime: now - simRng.range(40, 180) * 60_000,
          durationMin: 0,
        });
        trade.closeTime = now;
        const balance = round2(acc.state.balance + trade.pnl);
        const next: TradingAccount = {
          ...acc,
          openPnl: 0,
          trades: [trade, ...acc.trades],
          history: [...acc.history, { t: now, balance, equity: balance }],
          lastTradeDay: dayKey(now),
          state: {
            ...acc.state,
            balance,
            equity: balance,
            tradingDays: Math.max(acc.state.tradingDays + (acc.lastTradeDay !== dayKey(now) ? 1 : 0), acc.rules.minTradingDays),
          },
        };
        commit(get, set, next, now);
        return { ok: true, trade, message: "Profit target reached and minimum days met." };
      },

      resetAccount: (accountId) => {
        const s = get();
        const acc = s.accounts.find((a) => a.id === accountId);
        if (!acc) return { ok: false, message: "Account not found." };
        const now = Date.now();
        const login = s.nextLogin;
        const phase = acc.phase === "funded" ? "phase-1" : acc.phase;
        const rules =
          acc.phase === "funded" ? getRules(acc.model, 0, acc.addOns) : acc.rules;
        const status = acc.phase === "funded" && acc.model === "instant" ? "funded" : "active";
        const size = acc.size;
        const fresh: TradingAccount = {
          ...acc,
          login: String(login),
          password: newPassword(),
          phase: acc.model === "instant" ? "funded" : phase,
          rules: acc.model === "instant" ? acc.rules : rules,
          state: {
            initialBalance: size,
            balance: size,
            equity: size,
            dayStartBalance: size,
            peakEquity: size,
            tradingDays: 0,
            status,
          },
          openPnl: 0,
          driftBias: size * 0.0012,
          trades: [],
          history: [{ t: now, balance: size, equity: size }],
          dayKey: dayKey(now),
          lastTradeDay: null,
          breach: undefined,
          passedAt: undefined,
          note: undefined,
          resets: acc.resets + 1,
        };
        const price = Math.round(MODELS[acc.model].prices[acc.size] * 0.8);
        set({
          nextLogin: login + 1,
          accounts: replaceAccount(s.accounts, fresh),
          orders: [
            {
              id: `ORD-${now.toString(36).toUpperCase()}`,
              accountId: acc.id,
              label: `Reset · ${planLabel(acc.model, acc.size)}`,
              amount: price,
              method: "card",
              at: now,
            },
            ...s.orders,
          ],
          notifications: [
            notification(now, {
              title: "Account reset",
              body: `New credentials issued: #${login}. Your challenge restarts at ${planLabel(acc.model, acc.size)}.`,
              tone: "info",
              href: `/dashboard/accounts/${acc.id}`,
            }),
            ...s.notifications,
          ],
          liveTail: { ...s.liveTail, [acc.id]: [] },
        });
        return { ok: true, message: `Reset complete — new login #${login}.` };
      },

      purchaseAccount: (input) => {
        const s = get();
        const now = Date.now();
        const login = s.nextLogin;
        const instant = input.model === "instant";
        const rules = instant
          ? { ...getRules(input.model, 0, input.addOns), profitTargetPct: 0, minTradingDays: 0 }
          : getRules(input.model, 0, input.addOns);
        const size = input.size;
        const account: TradingAccount = {
          id: `acc-${login}`,
          login: String(login),
          password: newPassword(),
          server: brand.server,
          platform: input.platform,
          model: input.model,
          size,
          phase: instant ? "funded" : "phase-1",
          addOns: input.addOns,
          rewardShare: rewardShareFor(input.model, input.addOns),
          rules,
          state: {
            initialBalance: size,
            balance: size,
            equity: size,
            dayStartBalance: size,
            peakEquity: size,
            tradingDays: 0,
            status: instant ? "funded" : "active",
          },
          openPnl: 0,
          driftBias: size * 0.0015,
          trades: [],
          history: [{ t: now, balance: size, equity: size }],
          dayKey: dayKey(now),
          lastTradeDay: null,
          createdAt: now,
          resets: 0,
        };
        set({
          session: input.session,
          nextLogin: login + 1,
          accounts: [...s.accounts, account],
          selectedAccountId: account.id,
          orders: [
            {
              id: `ORD-${now.toString(36).toUpperCase()}`,
              accountId: account.id,
              label: planLabel(input.model, input.size),
              amount: input.amount,
              method: input.method,
              at: now,
              coupon: input.coupon,
            },
            ...s.orders,
          ],
          notifications: [
            notification(now, {
              title: "Account ready",
              body: `Your ${planLabel(input.model, input.size)} account #${login} is live on ${input.platform}.`,
              tone: "success",
              href: `/dashboard/accounts/${account.id}`,
            }),
            ...s.notifications,
          ],
        });
        return account;
      },

      requestPayout: ({ accountId, amount, method, destination }) => {
        const s = get();
        const acc = s.accounts.find((a) => a.id === accountId);
        if (!acc) return null;
        if (s.payouts.some((p) => p.accountId === accountId && !p.finalized && p.stage !== "rejected")) return null;
        const profit = acc.state.balance - acc.state.initialBalance;
        const available = round2(Math.max(0, profit) * acc.rewardShare);
        const value = round2(Math.min(amount, available));
        if (value <= 0) return null;
        const now = Date.now();
        const payout: Payout = {
          id: `PO-${10_600 + s.payouts.length}`,
          accountId,
          accountLabel: `${planLabel(acc.model, acc.size)} ${phaseLabel(acc)} · #${acc.login}`,
          gross: round2(value / acc.rewardShare),
          split: acc.rewardShare,
          amount: value,
          method,
          destination,
          stage: "requested",
          requestedAt: now,
        };
        set({ payouts: [payout, ...s.payouts] });
        return payout;
      },

      advancePayouts: (now) => {
        const s = get();
        const order: PayoutStage[] = ["requested", "review", "approved", "paid"];
        const changes: { payout: Payout; stage: PayoutStage }[] = [];
        let accounts = s.accounts;
        let notifications = s.notifications;
        let nextPayoutAt = s.nextPayoutAt;
        let event = s.event;
        const payouts = s.payouts.map((p) => {
          if (p.finalized || p.stage === "rejected") return p;
          const idx = Math.min(3, Math.floor((now - p.requestedAt) / PAYOUT_STEP_MS));
          const stage = order[idx];
          if (stage === p.stage) return p;
          let updated: Payout = { ...p, stage };
          if (stage === "paid") {
            updated = {
              ...updated,
              paidAt: now,
              finalized: true,
              txRef: p.method === "bank" ? `SEPA-${String(now).slice(-6)}` : p.method === "rise" ? `RISE-${String(now).slice(-5)}` : `0x${now.toString(16).slice(-4)}…${Math.floor(simRng.next() * 65535).toString(16)}`,
            };
            // The withdrawn profit leaves the account; the fee refund is recorded on the first reward.
            accounts = accounts.map((a) => {
              if (a.id !== p.accountId) return a;
              const balance = round2(a.state.balance - p.gross);
              return {
                ...a,
                history: [...a.history, { t: now, balance, equity: round2(balance + a.openPnl) }],
                state: { ...a.state, balance, equity: round2(balance + a.openPnl), dayStartBalance: Math.min(a.state.dayStartBalance, balance), peakEquity: Math.max(balance, a.state.initialBalance) },
              };
            });
            nextPayoutAt = now + 14 * DAY;
            event = { type: "payout-paid", payoutId: p.id, at: now };
            notifications = [
              notification(now, {
                title: "Reward sent",
                body: `$${p.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })} was paid via ${p.method.toUpperCase()}.`,
                tone: "success",
                href: "/dashboard/payouts",
              }),
              ...notifications,
            ];
          }
          changes.push({ payout: updated, stage });
          return updated;
        });
        if (changes.length) set({ payouts, accounts, notifications, nextPayoutAt, event });
        return changes;
      },

      adminDecide: (id, decision) =>
        set((s) => ({ adminDecisions: { ...s.adminDecisions, [id]: decision } })),

      markAllRead: () =>
        set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
      markRead: (id) =>
        set((s) => ({ notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)) })),

      clearEvent: () => set({ event: null }),

      completeKyc: () => {
        const s = get();
        const now = Date.now();
        const passed = s.accounts.find(
          (a) => a.state.status === "passed" && !s.accounts.some((c) => c.parentId === a.id),
        );
        let accounts = s.accounts;
        let notifications = s.notifications;
        let nextLogin = s.nextLogin;
        if (passed) {
          const child = buildNextPhase({ ...passed, phase: MODELS[passed.model].phases === 1 ? "phase-1" : "phase-2" }, now, nextLogin);
          nextLogin += 1;
          accounts = [
            ...accounts.map((a) => (a.id === passed.id ? { ...a, note: "Passed — funded account created" } : a)),
            child,
          ];
          notifications = [
            notification(now, {
              title: "Funded account created",
              body: `KYC verified. Your ${planLabel(child.model, child.size)} funded account #${child.login} is live.`,
              tone: "success",
              href: `/dashboard/accounts/${child.id}`,
            }),
            ...notifications,
          ];
        }
        set({ kycStatus: "verified", accounts, notifications, nextLogin });
      },

      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),
      updateProfile: (patch) =>
        set((s) => ({ session: s.session ? { ...s.session, ...patch } : s.session })),

      resetPassword: (accountId) => {
        const s = get();
        if (!s.accounts.some((a) => a.id === accountId)) return null;
        const password = newPassword();
        set({ accounts: s.accounts.map((a) => (a.id === accountId ? { ...a, password } : a)) });
        return password;
      },
    }),
    {
      name: brand.storageKeys.store,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s): PersistedState => ({
        seededAt: s.seededAt,
        session: s.session,
        accounts: s.accounts,
        selectedAccountId: s.selectedAccountId,
        payouts: s.payouts,
        notifications: s.notifications,
        orders: s.orders,
        adminDecisions: s.adminDecisions,
        payoutWindowClosesAt: s.payoutWindowClosesAt,
        nextPayoutAt: s.nextPayoutAt,
        nextLogin: s.nextLogin,
        kycStatus: s.kycStatus,
        settings: s.settings,
      }),
      migrate: () => emptyState,
    },
  ),
);

let hydrating: Promise<void> | null = null;

/** Loads persisted state once on the client, seeding fresh demo data when empty. */
export function hydrateDemoStore(): Promise<void> {
  if (!hydrating) {
    hydrating = Promise.resolve(useDemoStore.persist.rehydrate()).then(() => {
      const s = useDemoStore.getState();
      if (!s.accounts.length) s.seed(Date.now());
      useDemoStore.setState({ hydrated: true });
    });
  }
  return hydrating;
}

/* ─────────────────────────── Selectors ─────────────────────────── */

export const selectSelected = (s: DemoStore) =>
  s.accounts.find((a) => a.id === s.selectedAccountId) ?? s.accounts[0] ?? null;

export function availablePayout(acc: TradingAccount | null | undefined): number {
  if (!acc) return 0;
  return round2(Math.max(0, acc.state.balance - acc.state.initialBalance) * acc.rewardShare);
}
