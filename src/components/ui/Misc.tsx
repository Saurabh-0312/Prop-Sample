import type { ReactNode } from "react";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatSignedUSD, formatPct } from "@/lib/format";

/** "Demo preview · simulated data" pill. */
export function DemoPill({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border border-line bg-white/[0.03] px-2.5 py-1 text-[11px] font-medium text-muted",
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-warning shadow-[0_0_8px_var(--warning)]" />
      Demo preview · simulated data
    </span>
  );
}

/** P/L with sign, arrow and colour — readable even when the brand accent is green. */
export function PnL({
  value,
  pct,
  className,
  decimals = 2,
  arrow = true,
}: {
  value: number;
  pct?: number;
  className?: string;
  decimals?: 0 | 2;
  arrow?: boolean;
}) {
  const up = value > 0;
  const flat = Math.abs(value) < 0.005;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={cn(
        "num inline-flex items-center gap-0.5 whitespace-nowrap",
        flat ? "text-muted" : up ? "text-profit" : "text-loss",
        className,
      )}
    >
      {arrow && !flat && <Icon className="size-[1.05em] shrink-0" strokeWidth={2.4} />}
      {formatSignedUSD(value, decimals)}
      {pct !== undefined && <span className="ml-1 opacity-80">({formatPct(pct, 2, true)})</span>}
    </span>
  );
}

export function Container({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8", className)}>{children}</div>;
}

export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.03] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent-1",
        className,
      )}
    >
      <span className="size-1.5 rounded-full bg-accent-1 shadow-[0_0_8px_var(--accent-1)]" />
      {children}
    </span>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  align = "center",
  className,
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  align?: "center" | "left";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex max-w-2xl flex-col gap-4",
        align === "center" ? "mx-auto items-center text-center" : "items-start text-left",
        className,
      )}
    >
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="text-[32px] font-semibold leading-[1.08] tracking-[-0.035em] sm:text-[40px] lg:text-[48px]">{title}</h2>
      {subtitle && <p className="text-[15px] leading-relaxed text-muted sm:text-lg">{subtitle}</p>}
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden className={cn("skeleton", className)} />;
}

export function Kbd({ children }: { children: ReactNode }) {
  return (
    <kbd className="rounded-md border border-line-strong bg-white/[0.04] px-1.5 py-0.5 font-mono text-[11px] text-muted">
      {children}
    </kbd>
  );
}
