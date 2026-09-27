import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

/** Pulsing dot with an expanding ring. */
export function LiveDot({ className, color }: { className?: string; color?: string }) {
  return (
    <span
      aria-hidden
      className={cn("live-dot", className)}
      style={color ? ({ "--live-color": color } as CSSProperties) : undefined}
    />
  );
}
