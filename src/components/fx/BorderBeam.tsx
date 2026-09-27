import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

type Props = {
  duration?: number;
  width?: number;
  glow?: boolean;
  className?: string;
};

/** A conic light that orbits the border of its (rounded, relative) parent. */
export function BorderBeam({ duration = 6, width = 1.5, glow = true, className }: Props) {
  const style = { "--beam-duration": `${duration}s`, "--beam-width": `${width}px` } as CSSProperties;
  return (
    <>
      {glow && <span aria-hidden className={cn("border-beam-glow", className)} style={style} />}
      <span aria-hidden className={cn("border-beam", className)} style={style} />
    </>
  );
}
