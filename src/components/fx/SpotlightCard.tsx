"use client";

import { useRef, type HTMLAttributes, type PointerEvent } from "react";
import { cn } from "@/lib/cn";

type Props = HTMLAttributes<HTMLDivElement> & {
  /** glass (blurred) or solid surface */
  variant?: "glass" | "solid";
  hover?: boolean;
};

/** Glass card with a radial glow + border highlight that follows the cursor. */
export function SpotlightCard({ className, variant = "glass", hover = true, children, onPointerMove, ...rest }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const handleMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (el && e.pointerType === "mouse") {
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    }
    onPointerMove?.(e);
  };

  return (
    <div
      ref={ref}
      onPointerMove={handleMove}
      className={cn(variant === "glass" ? "card" : "card-solid", "spotlight", hover && "card-hover", className)}
      {...rest}
    >
      {children}
    </div>
  );
}
