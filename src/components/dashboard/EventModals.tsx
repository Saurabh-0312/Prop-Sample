"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { Award, ArrowRight, RotateCcw, ShieldAlert, ShoppingCart, Trophy } from "lucide-react";
import { celebrate, Shockwave } from "@/components/fx/Confetti";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { MODELS, planLabel } from "@/data/plans";
import { formatDateTime, formatPct, formatUSD } from "@/lib/format";
import { phaseLabel, stageLabel, useDemoStore } from "@/lib/store";
import { toast } from "@/lib/toast";
import type { TradingAccount } from "@/lib/types";
import { CredentialRow } from "@/components/checkout/CheckoutSuccess";

function Evidence({ label, value, tone }: { label: string; value: string; tone?: "loss" }) {
  return (
    <div className="rounded-xl border border-line bg-[#080c15] px-3.5 py-3">
      <p className="text-[11px] uppercase tracking-wider text-muted">{label}</p>
      <p className={`num mt-1 text-[15px] font-semibold ${tone === "loss" ? "text-loss" : "text-fg"}`}>{value}</p>
    </div>
  );
}

function BreachModal({ account, onDone }: { account: TradingAccount; onDone: () => void }) {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const onClose = () => setOpen(false);
  const [resetting, setResetting] = useState(false);
  const b = account.breach;
  const daily = b?.rule !== "MAX_LOSS";
  const title = daily ? "Daily Loss Limit Exceeded" : "Max Loss Limit Exceeded";
  const resetPrice = Math.round(MODELS[account.model].prices[account.size] * 0.8);

  return (
    <Modal open={open} onClose={onClose} onExited={onDone} variant="breach" size="lg">
      <div className="glitch">
        <div className="flex items-start gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-loss/15 text-loss shadow-[0_0_30px_-4px_var(--loss)]">
            <ShieldAlert className="size-6" />
          </span>
          <div className="pr-8">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-loss">Rule breach · account disabled</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight sm:text-[28px]">
              <span className="glitch-text" data-text={title}>
                {title}
              </span>
            </h2>
          </div>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          The risk engine detected that equity on <span className="text-fg">#{account.login}</span> (
          {planLabel(account.model, account.size)} · {phaseLabel(account)}) fell to or below the{" "}
          {daily ? "daily loss floor" : "maximum loss floor"}. Open positions were closed and trading was disabled.
        </p>
        {b && (
          <div className="mt-5 grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            <Evidence label="Equity at breach" value={formatUSD(b.equity)} tone="loss" />
            <Evidence label={daily ? "Daily floor" : "Max loss floor"} value={formatUSD(b.floor)} />
            <Evidence
              label="Limit"
              value={`${formatUSD(b.limit, 0)} · ${formatPct(daily ? account.rules.dailyLossPct : account.rules.maxLossPct, 0)}`}
            />
            <Evidence label="Timestamp" value={formatDateTime(b.at)} />
          </div>
        )}
        <p className="mt-4 rounded-xl border border-line bg-white/[0.02] p-3 text-xs leading-relaxed text-muted">
          Evidence snapshot stored for support: equity, balance, open positions, prices and server time. Rule:{" "}
          {daily
            ? "equity ≤ day-start balance − daily loss % × initial balance."
            : account.rules.maxLossType === "static"
              ? "equity ≤ initial balance × (1 − max loss %)."
              : "equity ≤ min(peak equity − max loss % × initial balance, initial balance)."}
        </p>
        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
          <Button
            size="lg"
            className="flex-1"
            loading={resetting}
            iconLeft={resetting ? undefined : <RotateCcw className="size-4" />}
            onClick={() => {
              setResetting(true);
              setTimeout(() => {
                const r = useDemoStore.getState().resetAccount(account.id);
                toast.success("Account reset (−20%)", `${r.message} Paid ${formatUSD(resetPrice, 0)}.`);
                setResetting(false);
                onClose();
              }, 1100);
            }}
          >
            Reset Account (−20%) · {formatUSD(resetPrice, 0)}
          </Button>
          <Button
            size="lg"
            variant="secondary"
            className="flex-1"
            iconLeft={<ShoppingCart className="size-4" />}
            onClick={() => {
              onClose();
              router.push("/challenges");
            }}
          >
            Buy New Challenge
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function PassModal({ account, child, onDone }: { account: TradingAccount; child: TradingAccount | null; onDone: () => void }) {
  const router = useRouter();
  const [open, setOpen] = useState(true);
  const onClose = () => setOpen(false);
  useEffect(() => {
    const t = setTimeout(() => celebrate(), 180);
    return () => clearTimeout(t);
  }, []);
  const toFunded = child?.phase === "funded";
  const profit = account.state.balance - account.state.initialBalance;

  return (
    <Modal open={open} onClose={onClose} onExited={onDone} variant="success" size="md">
      <div className="text-center">
        <div className="relative mx-auto grid size-24 place-items-center">
          <Shockwave />
          <Shockwave delay={200} />
          <motion.div
            initial={{ scale: 0.3, rotate: -25, opacity: 0 }}
            animate={{ scale: 1, rotate: 0, opacity: 1 }}
            transition={{ type: "spring", stiffness: 240, damping: 14 }}
            className="grid size-20 place-items-center rounded-[26px] bg-gradient-brand text-ink shadow-[0_0_60px_-4px_var(--accent-2)]"
          >
            <Trophy className="size-9" />
          </motion.div>
        </div>
        <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-accent-1">Objectives met</p>
        <h2 className="mt-2 text-[28px] font-semibold tracking-tight">{stageLabel(account)} Passed! 🎉</h2>
        <p className="mx-auto mt-2 max-w-sm text-sm text-muted">
          {child
            ? toFunded
              ? `Your funded ${planLabel(child.model, child.size)} account has been created.`
              : "Your Phase 2 account has been created."
            : "Great trading — your next account is being prepared."}
        </p>
        <div className="mt-6 grid grid-cols-3 gap-2 text-left">
          <div className="rounded-xl border border-line bg-[#080c15] px-3 py-2.5">
            <p className="text-[11px] text-muted">Profit</p>
            <p className="num text-sm font-semibold text-profit">+{formatUSD(profit)}</p>
          </div>
          <div className="rounded-xl border border-line bg-[#080c15] px-3 py-2.5">
            <p className="text-[11px] text-muted">Target</p>
            <p className="num text-sm font-semibold">{formatPct(account.rules.profitTargetPct, 0)}</p>
          </div>
          <div className="rounded-xl border border-line bg-[#080c15] px-3 py-2.5">
            <p className="text-[11px] text-muted">Trading days</p>
            <p className="num text-sm font-semibold">{account.state.tradingDays}</p>
          </div>
        </div>
        {child && (
          <div className="mt-4 space-y-2 text-left">
            <CredentialRow label="New login" value={child.login} />
            <CredentialRow label="Password" value={child.password} secret />
          </div>
        )}
        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
          {child && (
            <Button
              size="lg"
              className="flex-1"
              iconRight={<ArrowRight className="size-4" />}
              onClick={() => {
                useDemoStore.getState().selectAccount(child.id);
                onClose();
                router.push(`/dashboard/accounts/${child.id}`);
              }}
            >
              Open {toFunded ? "funded" : "Phase 2"} account
            </Button>
          )}
          <Button
            size="lg"
            variant="secondary"
            className="flex-1"
            iconLeft={<Award className="size-4" />}
            onClick={() => {
              onClose();
              router.push("/dashboard/certificates");
            }}
          >
            View certificate
          </Button>
        </div>
      </div>
    </Modal>
  );
}

/** Renders the breach / pass modals and payout confetti driven by rules-engine events. */
export function EventModals() {
  const event = useDemoStore((s) => s.event);
  const accounts = useDemoStore((s) => s.accounts);
  const clear = () => useDemoStore.getState().clearEvent();

  useEffect(() => {
    if (event?.type !== "payout-paid") return;
    celebrate();
    useDemoStore.getState().clearEvent();
  }, [event]);

  if (event?.type === "breach") {
    const acc = accounts.find((a) => a.id === event.accountId);
    if (acc) return <BreachModal key={event.at} account={acc} onDone={clear} />;
  }
  if (event?.type === "pass") {
    const acc = accounts.find((a) => a.id === event.accountId);
    const child = accounts.find((a) => a.id === event.newAccountId) ?? null;
    if (acc) return <PassModal key={event.at} account={acc} child={child} onDone={clear} />;
  }
  return null;
}
