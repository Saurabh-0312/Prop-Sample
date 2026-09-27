"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { useInView } from "motion/react";
import { cn } from "@/lib/cn";

type Props = {
  children: ReactNode;
  /** seconds per loop */
  duration?: number;
  reverse?: boolean;
  pauseOnHover?: boolean;
  gap?: number;
  fade?: boolean;
  className?: string;
};

/** Infinite horizontal marquee with edge fade masks. Pauses off-screen and on hover. */
export function Marquee({ children, duration = 40, reverse = false, pauseOnHover = true, gap = 16, fade = true, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "120px" });
  const group: CSSProperties = { gap, paddingRight: gap };

  return (
    <div
      ref={ref}
      className={cn("marquee flex overflow-hidden", fade && "mask-fade-x", className)}
      data-reverse={reverse}
      data-paused={!inView}
      data-hover-pause={pauseOnHover}
      style={{ "--marquee-duration": `${duration}s` } as CSSProperties}
    >
      <div className="marquee-track flex w-max shrink-0">
        <div className="flex shrink-0 items-stretch" style={group}>
          {children}
        </div>
        <div aria-hidden className="flex shrink-0 items-stretch" style={group}>
          {children}
        </div>
      </div>
    </div>
  );
}
