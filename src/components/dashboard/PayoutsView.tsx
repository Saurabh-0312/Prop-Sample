"use client";

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BadgeCheck, Banknote, Bitcoin, CircleDollarSign, Clock, FileSearch, Landmark, Send, ShieldCheck, Timer, Wallet } from "lucide-react";
import { BorderBeam } from "@/components/fx/BorderBeam";
import { NumberRoll } from "@/components/fx/NumberRoll";
import { Badge, type BadgeTone } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { Field, Input } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { PAYOUT_METHODS, validateDestination } from "@/data/payouts";
import { planLabel } from "@/data/plans";
import { cn } from "@/lib/cn";
import { formatCountdown, formatDateTime, formatUSD } from "@/lib/format";
import { useNow } from "@/lib/hooks";
import { availablePayout, PAYOUT_STEP_MS, useDemoStore } from "@/lib/store";
import { toast } from "@/lib/toast";
import type { Payout, PayoutMethod, PayoutStage, TradingAccount } from "@/lib/types";

const METHOD_ICON: Record<PayoutMethod, typeof Wallet> = { usdt: Bitcoin, usdc: CircleDollarSign, bank: Landmark, rise: Banknote };
const STEPS: { stage: PayoutStage; label: string; icon: typeof Wallet; text: string }[] = [
  { stage: "requested", label: "Requested", icon: Send, text: "Request received" },
  { stage: "review", label: "Under Review", icon: FileSearch, text: "Risk & consistency checks" },
  { stage: "approved", label: "Approved", icon: ShieldCheck, text: "Finance sign-off" },
  { stage: "paid", label: "Paid", icon: BadgeCheck, text: "Funds sent" },
];
const ORDER: PayoutStage[] = ["requested", "review", "approved", "paid"];

const stageBadge = (s: PayoutStage): { tone: BadgeTone; label: string } =>
  s === "paid"
    ? { tone: "passed", label: "Paid" }
    : s === "rejected"
      ? { tone: "breached", label: "Rejected" }
      : s === "approved"
        ? { tone: "info", label: "Approved" }
        : s === "review"
          ? { tone: "warning", label: "Under review" }
          : { tone: "neutral", label: "Requested" };

function Timeline({ payout }: { payout: Payout | null }) {
  const idx = payout ? ORDER.indexOf(payout.stage) : -1;
  return (
    <section className="card rounded-2xl p-5 sm:p-6" aria-label="Payout status">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-base font-semibold">Payout status</h2>
          <p className="text-xs text-muted">
            {payout ? `${payout.id} · ${formatUSD(payout.amount)} via ${PAYOUT_METHODS[payout.method].label}` : "Request a payout to watch it move through each step in real time."}
          </p>
        </div>
        {payout && <Badge tone={stageBadge(payout.stage).tone} pulse={payout.stage !== "paid"}>{stageBadge(payout.stage).label}</Badge>}
      </div>
      <ol className="relative grid grid-cols-4 gap-2">
        <div aria-hidden className="absolute left-[12.5%] right-[12.5%] top-5 h-0.5 rounded-full bg-white/[0.07]">
          <motion.div
            className="h-full rounded-full bg-gradient-brand shadow-[0_0_12px_var(--accent-2)]"
            initial={false}
            animate={{ width: `${Math.max(0, idx) * 33.34}%` }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
        {STEPS.map((s, i) => {
          const done = idx > i || (idx === 3 && i === 3);
          const active = idx === i && idx !== 3;
          return (
            <li key={s.stage} className="relative flex flex-col items-center text-center">
              <span
                className={cn(
                  "relative z-10 grid size-10 place-items-center rounded-full border transition-all duration-500",
                  done
                    ? "border-transparent bg-gradient-brand text-ink shadow-[0_0_22px_-2px_var(--accent-2)]"
                    : active
                      ? "border-accent-2/60 bg-[#0d1524] text-accent-2 shadow-[0_0_24px_-4px_var(--accent-2)]"
                      : "border-line bg-[#0b101a] text-muted",
                )}
              >
                {active && <span className="absolute inset-0 animate-ping rounded-full border border-accent-2/50" />}
                <s.icon className="size-4" />
              </span>
              <span className={cn("mt-3 text-[13px] font-semibold", done || active ? "text-fg" : "text-muted")}>
                {s.label}
                {s.stage === "paid" && done ? " ✓" : ""}
              </span>
              <span className="mt-0.5 hidden text-[11px] text-muted sm:block">{s.text}</span>
              {payout && (done || active) && (
                <span className="num mt-1 text-[10.5px] text-muted">
                  {formatDateTime(s.stage === "paid" && payout.paidAt ? payout.paidAt : payout.requestedAt + i * PAYOUT_STEP_MS)}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function RequestForm({ account, available, onDone }: { account: TradingAccount; available: number; onDone: () => void }) {
  const [amount, setAmount] = useState(available.toFixed(2));
  const [method, setMethod] = useState<PayoutMethod>("usdt");
  const [destination, setDestination] = useState("");
  const [errors, setErrors] = useState<{ amount?: string; destination?: string }>({});
  const info = PAYOUT_METHODS[method];

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const value = Number(amount);
    const errs: typeof errors = {};
    if (!Number.isFinite(value) || value < 50) errs.amount = "The minimum payout is $50.";
    else if (value > available + 0.001) errs.amount = `You can withdraw up to ${formatUSD(available)}.`;
    const destErr = validateDestination(method, destination);
    if (destErr) errs.destination = destErr;
    setErrors(errs);
    if (errs.amount || errs.destination) return;
    const p = useDemoStore.getState().requestPayout({ accountId: account.id, amount: value, method, destination: destination.trim() });
    if (!p) {
      toast.error("Payout unavailable", "A payout for this account is already in progress.");
      return;
    }
    toast.info("Payout requested", `${formatUSD(p.amount)} via ${info.label}. Watch the status timeline.`);
    onDone();
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <Field label="Amount" htmlFor="po-amount" error={errors.amount} hint={`Available: ${formatUSD(available)} · profit × ${Math.round(account.rewardShare * 100)}% reward share`}>
        <Input
          id="po-amount"
          inputMode="decimal"
          value={amount}
          invalid={!!errors.amount}
          icon={<span className="text-sm font-semibold">$</span>}
          onChange={(e) => {
            setAmount(e.target.value.replace(/[^\d.]/g, ""));
            setErrors((x) => ({ ...x, amount: undefined }));
          }}
          className="num text-base"
        />
      </Field>
      <div className="-mt-3 flex gap-2">
        {[0.25, 0.5, 1].map((f) => (
          <button
            key={f}
            type="button"
            onClick={() => {
              setAmount((available * f).toFixed(2));
              setErrors((x) => ({ ...x, amount: undefined }));
            }}
            className="rounded-lg border border-line px-2.5 py-1 text-xs text-muted transition-colors hover:border-accent-2/40 hover:text-fg"
          >
            {f === 1 ? "Max" : `${f * 100}%`}
          </button>
        ))}
      </div>
      <div>
        <p className="mb-2 text-[13px] font-medium text-fg/90">Payout method</p>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(PAYOUT_METHODS) as PayoutMethod[]).map((m) => {
            const Icon = METHOD_ICON[m];
            const active = m === method;
            return (
              <button
                key={m}
                type="button"
                onClick={() => {
                  setMethod(m);
                  setDestination("");
                  setErrors((x) => ({ ...x, destination: undefined }));
                }}
                aria-pressed={active}
                className={cn(
                  "flex items-center gap-3 rounded-xl border p-3 text-left transition-all",
                  active ? "border-accent-2/50 bg-accent-2/[0.08] shadow-[0_0_24px_-10px_var(--accent-2)]" : "border-line bg-white/[0.02] hover:border-white/15",
                )}
              >
                <span className={cn("grid size-8 place-items-center rounded-lg", active ? "bg-gradient-brand text-ink" : "bg-white/[0.05] text-muted")}>
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block text-[13px] font-semibold">{PAYOUT_METHODS[m].label}</span>
                  <span className="block truncate text-[11px] text-muted">{PAYOUT_METHODS[m].eta}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
      <Field
        label={info.field}
        htmlFor="po-dest"
        error={errors.destination}
        aside={
          <button
            type="button"
            className="text-xs font-medium text-accent-2 hover:underline"
            onClick={() => {
              setDestination(info.example);
              setErrors((x) => ({ ...x, destination: undefined }));
            }}
          >
            Use saved
          </button>
        }
      >
        <Input
          id="po-dest"
          placeholder={info.placeholder}
          value={destination}
          invalid={!!errors.destination}
          className="num text-[13px]"
          onChange={(e) => {
            setDestination(e.target.value);
            setErrors((x) => ({ ...x, destination: undefined }));
          }}
        />
      </Field>
      <Button type="submit" size="lg" fullWidth iconLeft={<Send className="size-4" />}>
        Request {Number(amount) > 0 ? formatUSD(Math.min(Number(amount), available)) : "payout"}
      </Button>
      <p className="text-center text-xs text-muted">Reviewed automatically in this demo · typical real-world time: under 24h</p>
    </form>
  );
}

export function PayoutsView() {
  const accounts = useDemoStore((s) => s.accounts);
  const payouts = useDemoStore((s) => s.payouts);
  const windowCloses = useDemoStore((s) => s.payoutWindowClosesAt);
  const nextPayoutAt = useDemoStore((s) => s.nextPayoutAt);
  const now = useNow();
  const funded = accounts.filter((a) => a.phase === "funded");
  const [pick, setPick] = useState<string | null>(null);
  const [modal, setModal] = useState<{ open: boolean; key: number }>({ open: false, key: 0 });
  const account = funded.find((a) => a.id === pick) ?? funded[0];

  if (!account) {
    return (
      <div className="card mx-auto max-w-xl rounded-3xl p-10 text-center">
        <Wallet className="mx-auto size-8 text-muted" />
        <p className="mt-4 text-lg font-semibold">No funded account yet</p>
        <p className="mt-2 text-sm text-muted">Pass your evaluation to unlock rewards. Use “Pass phase” in Demo Controls to fast-forward.</p>
        <Button href="/dashboard" className="mt-6">
          Back to overview
        </Button>
      </div>
    );
  }

  const available = availablePayout(account);
  const profit = Math.max(0, account.state.balance - account.state.initialBalance);
  const active = payouts.find((p) => p.accountId === account.id && !p.finalized && p.stage !== "rejected") ?? null;
  const recent = payouts.find((p) => p.accountId === account.id && p.paidAt && now && now - p.paidAt < 10 * 60_000) ?? null;
  const locked = !!nextPayoutAt && !!now && now < nextPayoutAt;
  const windowOpen = !locked;
  const countdown = now ? (locked ? nextPayoutAt! - now : Math.max(0, windowCloses - now)) : 0;
  const canRequest = windowOpen && !active && available >= 50;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Payouts</h2>
          <p className="text-sm text-muted">Rewards are your share of the profit on funded accounts.</p>
        </div>
        {funded.length > 1 && (
          <select className="field h-10 w-auto text-[13px]" value={account.id} onChange={(e) => setPick(e.target.value)} aria-label="Funded account">
            {funded.map((a) => (
              <option key={a.id} value={a.id}>
                #{a.login} · {planLabel(a.model, a.size)} Funded
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.35fr_1fr]">
        <section className="relative overflow-hidden rounded-3xl border border-transparent bg-[linear-gradient(150deg,color-mix(in_oklab,var(--accent-2)_14%,#0b111c),#090d16_60%)] p-6 sm:p-8">
          <BorderBeam duration={8} />
          <div aria-hidden className="grid-lines opacity-50" />
          <div className="relative">
            <p className="flex items-center gap-2 text-sm text-muted">
              <Wallet className="size-4 text-accent-1" /> Available for payout · #{account.login}
            </p>
            <NumberRoll value={available} format="usd" className="mt-3 text-[44px] font-semibold leading-none tracking-tight sm:text-[56px]" />
            <p className="num mt-3 text-sm text-muted">
              {formatUSD(profit)} profit × {Math.round(account.rewardShare * 100)}% reward share = <span className="font-semibold text-fg">{formatUSD(available)}</span>
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button size="lg" disabled={!canRequest} onClick={() => setModal((m) => ({ open: true, key: m.key + 1 }))} iconLeft={<Send className="size-4" />}>
                Request Payout
              </Button>
              <span
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs",
                  windowOpen ? "border-accent-1/30 bg-accent-1/10 text-accent-1" : "border-warning/30 bg-warning/10 text-warning",
                )}
              >
                {windowOpen ? <Timer className="size-3.5" /> : <Clock className="size-3.5" />}
                {windowOpen ? "Eligible · window closes in " : "Next payout window opens in "}
                <span className="num font-semibold">{now ? formatCountdown(countdown) : "—"}</span>
              </span>
            </div>
            {!canRequest && (
              <p className="mt-3 text-xs text-muted">
                {active
                  ? "A payout is already moving through review — see the timeline."
                  : locked
                    ? "Bi-weekly cycle: your next request unlocks when the countdown ends."
                    : "Trade a little more profit to reach the $50 minimum."}
              </p>
            )}
          </div>
        </section>

        <section className="card rounded-3xl p-6">
          <h2 className="text-base font-semibold">Eligibility checks</h2>
          <ul className="mt-4 space-y-3 text-sm">
            {[
              ["KYC verified", true],
              ["Bi-weekly cycle reached", windowOpen],
              ["No open positions over the weekend", true],
              ["Consistency rule respected", true],
              ["Minimum $50 available", available >= 50],
            ].map(([label, ok]) => (
              <li key={String(label)} className="flex items-center justify-between gap-3">
                <span className="text-fg/85">{label}</span>
                <span className={cn("flex items-center gap-1.5 text-xs font-medium", ok ? "text-profit" : "text-warning")}>
                  {ok ? <BadgeCheck className="size-4" /> : <Clock className="size-4" />}
                  {ok ? "Passed" : "Pending"}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-5 rounded-xl border border-line bg-white/[0.02] p-3 text-xs leading-relaxed text-muted">
            Your {planLabel(account.model, account.size)} challenge fee is refunded with your first reward.
          </p>
        </section>
      </div>

      <Timeline payout={active ?? recent} />

      <section className="card overflow-hidden rounded-2xl" aria-label="Payout history">
        <div className="px-5 pb-2 pt-5">
          <h2 className="text-base font-semibold">Payout history</h2>
          <p className="text-xs text-muted">All reward requests across your funded accounts.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs text-muted">
                <th className="px-5 py-3 font-medium">ID</th>
                <th className="px-3 py-3 font-medium">Account</th>
                <th className="px-3 py-3 font-medium">Method</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium">Requested</th>
                <th className="px-3 py-3 font-medium">Paid</th>
                <th className="px-3 py-3 text-right font-medium">Amount</th>
                <th className="px-5 py-3 text-right font-medium">Tx ref</th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence initial={false}>
                {payouts.map((p) => {
                  const b = stageBadge(p.stage);
                  return (
                    <motion.tr
                      key={p.id}
                      layout="position"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border-b border-line/60 last:border-0"
                    >
                      <td className="num px-5 py-3 text-muted">{p.id}</td>
                      <td className="px-3 py-3">{p.accountLabel}</td>
                      <td className="px-3 py-3 text-muted">{PAYOUT_METHODS[p.method].label}</td>
                      <td className="px-3 py-3">
                        <Badge tone={b.tone} pulse={!p.finalized && p.stage !== "rejected"}>
                          {b.label}
                        </Badge>
                      </td>
                      <td className="num px-3 py-3 text-muted">{formatDateTime(p.requestedAt)}</td>
                      <td className="num px-3 py-3 text-muted">{p.paidAt ? formatDateTime(p.paidAt) : "—"}</td>
                      <td className="num px-3 py-3 text-right font-semibold">{formatUSD(p.amount)}</td>
                      <td className="px-5 py-3 text-right">
                        {p.txRef ? (
                          <span className="inline-flex items-center gap-1">
                            <span className="num text-xs text-muted">{p.txRef}</span>
                            <CopyButton value={p.txRef} label="Copy transaction reference" toastLabel="Transaction reference copied" className="size-7" />
                          </span>
                        ) : (
                          <span className="text-xs text-muted">Pending</span>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      </section>

      <Modal
        open={modal.open}
        onClose={() => setModal((m) => ({ ...m, open: false }))}
        title="Request payout"
        description={`${planLabel(account.model, account.size)} Funded · #${account.login}`}
        size="md"
      >
        <RequestForm key={modal.key} account={account} available={available} onDone={() => setModal((m) => ({ ...m, open: false }))} />
      </Modal>
    </div>
  );
}
