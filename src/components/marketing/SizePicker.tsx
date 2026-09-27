"use client";

import { useId } from "react";
import { motion } from "motion/react";
import { ACCOUNT_SIZES, POPULAR_SIZE, type AccountSize } from "@/data/plans";
import { cn } from "@/lib/cn";
import { formatSize } from "@/lib/format";

/** Account-size pills ($5K–$200K) with a sliding active highlight. */
export function SizePicker({
  value,
  onChange,
  className,
  compact,
}: {
  value: AccountSize;
  onChange: (size: AccountSize) => void;
  className?: string;
  compact?: boolean;
}) {
  const layoutId = useId();
  return (
    <div role="radiogroup" aria-label="Account size" className={cn("grid grid-cols-3 gap-2 sm:grid-cols-6", className)}>
      {ACCOUNT_SIZES.map((s) => {
        const active = s === value;
        return (
          <button
            key={s}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(s)}
            className={cn(
              "relative isolate flex flex-col items-center justify-center rounded-xl border px-2 transition-colors duration-200",
              compact ? "h-11" : "h-14",
              active ? "border-transparent text-fg" : "border-line bg-white/[0.02] text-muted hover:border-white/15 hover:text-fg",
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                aria-hidden
                className="absolute inset-0 -z-10 rounded-xl border border-accent-2/50 bg-accent-2/[0.1] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_24px_-8px_var(--accent-2)]"
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span className="num text-[15px] font-semibold">{formatSize(s)}</span>
            {s === POPULAR_SIZE && !compact && (
              <span className="mt-0.5 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-accent-1">Popular</span>
            )}
          </button>
        );
      })}
    </div>
  );
}
