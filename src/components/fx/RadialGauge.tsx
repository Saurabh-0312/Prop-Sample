"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";
import { usageTone } from "@/lib/rules";
import { NumberRoll } from "./NumberRoll";

type Props = {
  /** money left before the floor */
  remaining: number;
  /** size of the limit in money */
  limit: number;
  /** 0–1 share of the limit already used */
  usedPct: number;
  label: string;
  caption?: string;
  size?: number;
  stroke?: number;
  className?: string;
};

const ARC = 0.75; // 270° gauge

/** Animated arc gauge: accent gradient → gold at ≥70% used → red at ≥90% used. */
export function RadialGauge({ remaining, limit, usedPct, label, caption, size = 176, stroke = 12, className }: Props) {
  const id = useId().replace(/:/g, "");
  const tone = usageTone(usedPct);
  const r = size / 2 - stroke / 2 - 6;
  const c = 2 * Math.PI * r;
  const arc = c * ARC;
  const frac = limit > 0 ? Math.min(1, Math.max(0, remaining / limit)) : 0;
  const offset = arc * (1 - frac);
  const center = size / 2;

  const ticks = [0.3, 0.1].map((f) => {
    const a = (f * 270 * Math.PI) / 180;
    const inner = r + stroke / 2 + 2;
    const outer = inner + 6;
    return {
      x1: center + inner * Math.cos(a),
      y1: center + inner * Math.sin(a),
      x2: center + outer * Math.cos(a),
      y2: center + outer * Math.sin(a),
      danger: f === 0.1,
    };
  });

  const arcs: { key: string; stroke: string; active: boolean; glow: string }[] = [
    { key: "ok", stroke: `url(#g-${id})`, active: tone === "ok", glow: "var(--accent-2)" },
    { key: "warn", stroke: "var(--warning)", active: tone === "warn", glow: "var(--warning)" },
    { key: "danger", stroke: "var(--loss)", active: tone === "danger", glow: "var(--loss)" },
  ];

  return (
    <div className={cn("relative shrink-0", className)} style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`} className="h-full w-full rotate-[135deg] overflow-visible">
        <defs>
          <linearGradient id={`g-${id}`} x1="0" y1="1" x2="1" y2="0">
            <stop offset="0%" stopColor="var(--accent-1)" />
            <stop offset="55%" stopColor="var(--accent-2)" />
            <stop offset="100%" stopColor="var(--accent-3)" />
          </linearGradient>
        </defs>
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke="rgba(255,255,255,0.07)"
          strokeWidth={stroke}
          strokeDasharray={`${arc} ${c}`}
          strokeLinecap="round"
        />
        {arcs.map((a) => (
          <circle
            key={a.key}
            cx={center}
            cy={center}
            r={r}
            fill="none"
            stroke={a.stroke}
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${arc} ${c}`}
            strokeDashoffset={offset}
            style={{
              opacity: a.active ? 1 : 0,
              filter: a.active ? `drop-shadow(0 0 6px color-mix(in oklab, ${a.glow} 70%, transparent))` : undefined,
              transition: "stroke-dashoffset 0.9s cubic-bezier(0.22,1,0.36,1), opacity 0.45s ease",
            }}
          />
        ))}
        {ticks.map((t, i) => (
          <line
            key={i}
            x1={t.x1}
            y1={t.y1}
            x2={t.x2}
            y2={t.y2}
            stroke={t.danger ? "var(--loss)" : "var(--warning)"}
            strokeOpacity={0.7}
            strokeWidth={2}
            strokeLinecap="round"
          />
        ))}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <span className="text-[11px] font-medium uppercase tracking-wider text-muted">{label}</span>
        <NumberRoll
          value={remaining}
          format="usd0"
          flash
          className={cn(
            "mt-0.5 text-xl font-semibold sm:text-[22px]",
            tone === "danger" ? "text-loss" : tone === "warn" ? "text-warning" : "text-fg",
          )}
        />
        {tone === "ok" ? (
          caption && <span className="mt-0.5 text-[11px] text-muted">{caption}</span>
        ) : (
          <span
            className={cn(
              "mt-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
              tone === "danger" ? "bg-loss/15 text-loss" : "bg-warning/15 text-warning",
            )}
          >
            {tone === "danger" ? "Critical" : "Near limit"}
          </span>
        )}
      </div>
    </div>
  );
}
