"use client";

import { useId, type ReactNode } from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/cn";

export type SegmentOption<T extends string | number> = {
  value: T;
  label: ReactNode;
  badge?: ReactNode;
  disabled?: boolean;
};

type Props<T extends string | number> = {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  /** gradient pill (primary choice) or glass pill (secondary choice) */
  pill?: "gradient" | "glass";
  size?: "sm" | "md";
  className?: string;
  fullWidth?: boolean;
  ariaLabel?: string;
};

/** Tabs / segmented control whose active pill slides with a shared layoutId. */
export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  pill = "glass",
  size = "md",
  className,
  fullWidth,
  ariaLabel,
}: Props<T>) {
  const layoutId = useId();
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "relative flex gap-1 overflow-x-auto rounded-2xl border border-line bg-white/[0.025] p-1 no-scrollbar",
        fullWidth ? "w-full" : "w-fit max-w-full",
        className,
      )}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={String(o.value)}
            type="button"
            role="tab"
            aria-selected={active}
            disabled={o.disabled}
            onClick={() => onChange(o.value)}
            className={cn(
              "relative isolate flex shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl font-medium transition-colors duration-200 disabled:opacity-40",
              size === "sm" ? "h-8 px-3 text-[13px]" : "h-10 px-4 text-sm",
              fullWidth && "flex-1",
              active ? (pill === "gradient" ? "text-ink" : "text-fg") : "text-muted hover:text-fg",
            )}
          >
            {active && (
              <motion.span
                layoutId={layoutId}
                aria-hidden
                className={cn(
                  "absolute inset-0 -z-10 rounded-xl",
                  pill === "gradient"
                    ? "bg-gradient-brand shadow-[0_6px_24px_-8px_var(--accent-1)]"
                    : "border border-accent-2/40 bg-accent-2/[0.09] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),0_0_20px_-8px_var(--accent-2)]",
                )}
                transition={{ type: "spring", stiffness: 420, damping: 34 }}
              />
            )}
            <span>{o.label}</span>
            {o.badge}
          </button>
        );
      })}
    </div>
  );
}
