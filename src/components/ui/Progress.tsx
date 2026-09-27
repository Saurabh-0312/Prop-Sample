import { cn } from "@/lib/cn";
import { usageTone } from "@/lib/rules";

type Props = {
  /** 0–1 */
  value: number;
  /** "target": gradient fill towards a goal. "usage": turns gold ≥70% and red ≥90%. */
  mode?: "target" | "usage";
  /** 0–1 position of a threshold marker */
  marker?: number;
  className?: string;
  height?: "xs" | "sm" | "md";
  label?: string;
};

const heights = { xs: "h-1", sm: "h-1.5", md: "h-2.5" };

export function Progress({ value, mode = "target", marker, className, height = "sm", label }: Props) {
  const v = Math.min(1, Math.max(0, value));
  const tone = mode === "usage" ? usageTone(v) : "ok";
  const fill =
    tone === "danger"
      ? "bg-loss shadow-[0_0_12px_-2px_var(--loss)]"
      : tone === "warn"
        ? "bg-warning shadow-[0_0_12px_-2px_var(--warning)]"
        : "bg-gradient-brand shadow-[0_0_14px_-3px_var(--accent-2)]";
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(v * 100)}
      aria-label={label}
      className={cn("relative w-full rounded-full bg-white/[0.06]", heights[height], className)}
    >
      <div
        className={cn("h-full rounded-full transition-[width,background-color] duration-700 ease-expo", fill)}
        style={{ width: `${v * 100}%` }}
      />
      {marker !== undefined && (
        <span
          aria-hidden
          className="absolute -top-1 -bottom-1 w-0.5 rounded-full bg-white/50"
          style={{ left: `calc(${Math.min(1, Math.max(0, marker)) * 100}% - 1px)` }}
        />
      )}
    </div>
  );
}
