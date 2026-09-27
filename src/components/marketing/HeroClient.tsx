"use client";

import { useState, type CSSProperties } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight } from "lucide-react";
import { LiveDot } from "@/components/fx/LiveDot";
import { Magnetic } from "@/components/fx/MagneticButton";
import { Button } from "@/components/ui/Button";
import { flag } from "@/data/countries";
import { PAYOUT_WALL } from "@/data/payouts";
import { formatUSD } from "@/lib/format";
import { useInterval } from "@/lib/hooks";
import { useDemoStore } from "@/lib/store";

export function HeroCtas() {
  const router = useRouter();
  const openDemo = () => {
    const s = useDemoStore.getState();
    if (!s.session) s.loginDemo();
    router.push("/dashboard");
  };
  return (
    <div className="word-in mt-9 flex flex-col gap-3 sm:flex-row sm:items-center" style={{ "--i": 11 } as CSSProperties}>
      <Magnetic>
        <Button href="/challenges" size="lg" iconRight={<ArrowRight className="size-4" />} className="w-full sm:w-auto">
          Start Challenge
        </Button>
      </Magnetic>
      <Button variant="secondary" size="lg" onClick={openDemo} iconLeft={<LiveDot />}>
        View Live Dashboard Demo
      </Button>
    </div>
  );
}

const FEED = PAYOUT_WALL.slice(0, 8);
const AGO = ["just now", "2m ago", "5m ago", "9m ago", "14m ago", "21m ago", "26m ago", "33m ago"];

/** Payout proof above the fold — cycles through the latest rewards. */
export function LatestRewardChip() {
  const [i, setI] = useState(0);
  useInterval(() => setI((n) => (n + 1) % FEED.length), 3600);
  const p = FEED[i];
  return (
    <div className="inline-flex max-w-full items-center gap-3 overflow-hidden rounded-full border border-line bg-white/[0.03] py-1.5 pl-2 pr-4 text-[13px] backdrop-blur">
      <span className="flex items-center gap-1.5 rounded-full bg-accent-1/12 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-accent-1">
        <LiveDot className="size-1.5" /> Latest reward
      </span>
      <span className="relative h-5 min-w-0 flex-1 overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={i}
            initial={{ y: 18, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -18, opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className="flex items-center gap-1.5 whitespace-nowrap"
          >
            <span className="num font-semibold text-fg">{formatUSD(p.amount)}</span>
            <span className="text-muted">to</span>
            <span>{flag(p.country)}</span>
            <span className="text-fg/90">{p.name}</span>
            <span className="text-muted">· {AGO[i]}</span>
          </motion.span>
        </AnimatePresence>
      </span>
    </div>
  );
}
