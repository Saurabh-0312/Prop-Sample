"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "motion/react";
import { ArrowRight, Check, Eye, EyeOff, Mail, Receipt } from "lucide-react";
import { Shockwave } from "@/components/fx/Confetti";
import { AuroraBackground } from "@/components/fx/AuroraBackground";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { Container } from "@/components/ui/Misc";
import { MODELS } from "@/data/plans";
import { formatSize, formatUSD } from "@/lib/format";
import { useDemoStore } from "@/lib/store";
import { toast } from "@/lib/toast";
import type { TradingAccount } from "@/lib/types";

const EASE = [0.22, 1, 0.36, 1] as const;

export function CredentialRow({ label, value, secret }: { label: string; value: string; secret?: boolean }) {
  const [shown, setShown] = useState(!secret);
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-line bg-[#080c15] px-4 py-3">
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wider text-muted">{label}</p>
        <p className="num mt-0.5 truncate text-[15px] font-semibold text-fg">{shown ? value : "•".repeat(Math.max(8, value.length))}</p>
      </div>
      <div className="flex shrink-0 items-center">
        {secret && (
          <button
            type="button"
            onClick={() => setShown((s) => !s)}
            aria-label={shown ? `Hide ${label}` : `Show ${label}`}
            className="grid size-8 place-items-center rounded-lg text-muted transition-colors hover:bg-white/[0.06] hover:text-fg"
          >
            {shown ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        )}
        <CopyButton value={value} label={`Copy ${label}`} toastLabel={`${label} copied`} />
      </div>
    </div>
  );
}

export function CheckoutSuccess({ account, paid, email }: { account: TradingAccount; paid: number; email: string }) {
  const router = useRouter();
  const funded = account.phase === "funded";
  const title = funded ? "Your funded account is ready" : "Your Phase 1 account is ready";

  return (
    <div className="relative isolate overflow-hidden">
      <AuroraBackground intensity={0.9} beams={false} />
      <Container className="relative flex flex-col items-center py-14 text-center sm:py-20">
        <div className="relative grid size-28 place-items-center">
          <Shockwave />
          <Shockwave delay={220} />
          <motion.div
            initial={{ scale: 0.4, opacity: 0, rotate: -20 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 16, delay: 0.05 }}
            className="grid size-24 place-items-center rounded-[28px] bg-gradient-brand text-ink shadow-[0_0_60px_-6px_var(--accent-2)]"
          >
            <Check className="size-11" strokeWidth={3} />
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25, duration: 0.7, ease: EASE }}>
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-accent-1">Payment confirmed · {formatUSD(paid)}</p>
          <h1 className="mt-3 text-[34px] font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">
            {title.split(" is ready")[0]} <span className="text-gradient">is ready</span>
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-muted">
            Your {formatSize(account.size)} {MODELS[account.model].name} is live on {account.platform}. We’ve
            also sent these credentials to <span className="text-fg">{email}</span>.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.45, duration: 0.7, ease: EASE }}
          className="card mt-10 w-full max-w-lg rounded-3xl p-5 text-left sm:p-6"
        >
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm font-semibold">Trading credentials</p>
            <span className="rounded-full border border-line px-2.5 py-0.5 font-mono text-[11px] text-muted">{account.platform}</span>
          </div>
          <div className="space-y-2.5">
            <CredentialRow label="Login" value={account.login} />
            <CredentialRow label="Server" value={account.server} />
            <CredentialRow label="Password" value={account.password} secret />
          </div>
          <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
            <Button
              size="lg"
              className="flex-1"
              iconRight={<ArrowRight className="size-4" />}
              onClick={() => {
                useDemoStore.getState().selectAccount(account.id);
                router.push("/dashboard");
              }}
            >
              Go to Dashboard
            </Button>
            <Button
              size="lg"
              variant="secondary"
              iconLeft={<Receipt className="size-4" />}
              onClick={() => toast.success("Receipt sent", `A PDF receipt was emailed to ${email}.`)}
            >
              Receipt
            </Button>
          </div>
          <p className="mt-4 flex items-center gap-2 text-xs text-muted">
            <Mail className="size-3.5" /> Tip: open the dashboard to watch the risk engine track this account live.
          </p>
        </motion.div>
      </Container>
    </div>
  );
}
