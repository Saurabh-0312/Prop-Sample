"use client";

import { useEffect, useRef } from "react";
import NumberFlow, { continuous, type Format } from "@number-flow/react";
import { useInView } from "motion/react";
import { cn } from "@/lib/cn";
import { useMounted, useReducedMotionPref } from "@/lib/hooks";

export type NumberFormat = "usd" | "usd0" | "int" | "pct1" | "pct2" | "dec1" | "dec2";

const FORMATS: Record<NumberFormat, Format> = {
  usd: { style: "currency", currency: "USD", minimumFractionDigits: 2, maximumFractionDigits: 2 },
  usd0: { style: "currency", currency: "USD", maximumFractionDigits: 0 },
  int: { maximumFractionDigits: 0 },
  pct1: { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 },
  pct2: { style: "percent", minimumFractionDigits: 2, maximumFractionDigits: 2 },
  dec1: { minimumFractionDigits: 1, maximumFractionDigits: 1 },
  dec2: { minimumFractionDigits: 2, maximumFractionDigits: 2 },
};

type Props = {
  value: number;
  format?: NumberFormat;
  /** +/− sign for P/L */
  signed?: boolean;
  /** odometer count-up from 0 the first time it scrolls into view */
  countUp?: boolean;
  /** flash green/red for ~400ms whenever the value changes */
  flash?: boolean;
  prefix?: string;
  suffix?: string;
  className?: string;
};

const FLASH = ["flash-up-a", "flash-up-b", "flash-down-a", "flash-down-b"];

/**
 * Rolling-digit number (NumberFlow). The final value is server-rendered, so the
 * number is never blank or "0" before JavaScript runs.
 */
export function NumberRoll({ value, format = "int", signed, countUp, flash, prefix, suffix, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const prev = useRef(value);
  const inView = useInView(ref, { once: true, margin: "0px 0px -8% 0px" });
  const mounted = useMounted();
  const reduced = useReducedMotionPref();

  const armed = countUp && mounted && !reduced;
  const shown = armed && !inView ? 0 : value;
  const animated = !reduced && (!countUp || inView);

  useEffect(() => {
    if (!flash) return;
    const el = ref.current;
    if (!el || value === prev.current) {
      prev.current = value;
      return;
    }
    const dir = value > prev.current ? "up" : "down";
    prev.current = value;
    const next = el.dataset.flash === `${dir}-a` ? `${dir}-b` : `${dir}-a`;
    el.classList.remove(...FLASH);
    el.classList.add(`flash-${next}`);
    el.dataset.flash = next;
  }, [value, flash]);

  const fmt: Format = {
    ...FORMATS[format],
    ...(signed ? { signDisplay: "exceptZero" as const } : {}),
  };

  return (
    <span ref={ref} className={cn("num inline-flex items-baseline whitespace-nowrap", className)}>
      <NumberFlow
        value={shown}
        format={fmt}
        locales="en-US"
        prefix={prefix}
        suffix={suffix}
        animated={animated}
        plugins={countUp ? [continuous] : undefined}
        willChange={flash}
      />
    </span>
  );
}
