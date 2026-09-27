"use client";

import { useId, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { Info } from "lucide-react";
import { cn } from "@/lib/cn";
import { useMounted } from "@/lib/hooks";

type Pos = { x: number; y: number; place: "top" | "bottom" };

/** Hover/focus tooltip rendered in a portal (never clipped by scrolling tables). */
export function Tooltip({ content, children, className }: { content: ReactNode; children: ReactNode; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [pos, setPos] = useState<Pos | null>(null);
  const mounted = useMounted();
  const id = useId();

  const show = () => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const place: Pos["place"] = r.top < 140 ? "bottom" : "top";
    const half = 140;
    const x = Math.min(window.innerWidth - half - 8, Math.max(half + 8, r.left + r.width / 2));
    setPos({ x, y: place === "top" ? r.top - 8 : r.bottom + 8, place });
  };
  const hide = () => setPos(null);

  return (
    <>
      <span
        ref={ref}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        aria-describedby={pos ? id : undefined}
        className={cn("inline-flex", className)}
      >
        {children}
      </span>
      {mounted &&
        createPortal(
          <AnimatePresence>
            {pos && (
              <motion.div
                id={id}
                role="tooltip"
                initial={{ opacity: 0, y: pos.place === "top" ? 4 : -4, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.1 } }}
                transition={{ duration: 0.16 }}
                style={{ left: pos.x, top: pos.y }}
                className={cn(
                  "pointer-events-none fixed z-[95] w-max max-w-[280px] -translate-x-1/2 rounded-xl border border-line-strong bg-[#101726]/95 px-3 py-2 text-xs leading-relaxed text-fg/90 shadow-2xl backdrop-blur-xl",
                  pos.place === "top" ? "-translate-y-full" : "",
                )}
              >
                {content}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}

/** ⓘ button with a plain-English explanation. */
export function InfoTip({ content, label = "More info" }: { content: ReactNode; label?: string }) {
  return (
    <Tooltip content={content}>
      <button
        type="button"
        aria-label={label}
        className="grid size-5 place-items-center rounded-full text-muted/80 transition-colors hover:text-accent-2 focus-visible:text-accent-2"
      >
        <Info className="size-3.5" />
      </button>
    </Tooltip>
  );
}
