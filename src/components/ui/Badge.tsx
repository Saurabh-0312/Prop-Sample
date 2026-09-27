import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import type { TradingAccount } from "@/lib/types";

export type BadgeTone =
  | "phase1"
  | "phase2"
  | "funded"
  | "passed"
  | "breached"
  | "active"
  | "neutral"
  | "warning"
  | "info";

const tones: Record<BadgeTone, string> = {
  phase1: "text-accent-2 bg-accent-2/10 border-accent-2/25",
  phase2: "text-accent-3 bg-accent-3/10 border-accent-3/25",
  funded: "text-warning bg-warning/10 border-warning/30",
  passed: "text-profit bg-profit/10 border-profit/25",
  breached: "text-loss bg-loss/10 border-loss/30",
  active: "text-accent-1 bg-accent-1/10 border-accent-1/25",
  neutral: "text-muted bg-white/[0.04] border-line",
  warning: "text-warning bg-warning/10 border-warning/25",
  info: "text-accent-2 bg-accent-2/10 border-accent-2/25",
};

export function Badge({
  tone = "neutral",
  children,
  className,
  dot = true,
  pulse = false,
}: {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
  dot?: boolean;
  pulse?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-[11.5px] font-medium leading-5",
        tones[tone],
        className,
      )}
    >
      {dot && (
        <span className="relative flex size-1.5">
          {pulse && <span className="absolute inset-0 animate-ping rounded-full bg-current opacity-60" />}
          <span className="relative size-1.5 rounded-full bg-current" />
        </span>
      )}
      {children}
    </span>
  );
}

export function PhaseBadge({ account }: { account: TradingAccount }) {
  if (account.phase === "funded") return <Badge tone="funded">Funded</Badge>;
  if (account.phase === "phase-2") return <Badge tone="phase2">Phase 2</Badge>;
  return <Badge tone="phase1">Phase 1</Badge>;
}

export function StatusBadge({ account }: { account: TradingAccount }) {
  switch (account.state.status) {
    case "active":
      return (
        <Badge tone="active" pulse>
          Active
        </Badge>
      );
    case "funded":
      return (
        <Badge tone="active" pulse>
          Live
        </Badge>
      );
    case "passed":
      return <Badge tone="passed">Passed</Badge>;
    case "breached":
      return <Badge tone="breached">Breached</Badge>;
  }
}
