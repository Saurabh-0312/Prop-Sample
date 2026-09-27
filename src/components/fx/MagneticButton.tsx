"use client";

import { useRef, type ReactNode } from "react";
import { motion, useSpring } from "motion/react";
import { cn } from "@/lib/cn";
import { useFinePointer, useReducedMotionPref } from "@/lib/hooks";

type Props = { children: ReactNode; strength?: number; className?: string };

/** Pulls its child gently towards the cursor. No-op on touch devices / reduced motion. */
export function Magnetic({ children, strength = 0.28, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const fine = useFinePointer();
  const reduced = useReducedMotionPref();
  const spring = { stiffness: 260, damping: 17, mass: 0.35 };
  const x = useSpring(0, spring);
  const y = useSpring(0, spring);
  const enabled = fine && !reduced;

  return (
    <motion.div
      ref={ref}
      className={cn("inline-flex", className)}
      style={enabled ? { x, y } : undefined}
      onPointerMove={(e) => {
        if (!enabled || !ref.current) return;
        const r = ref.current.getBoundingClientRect();
        x.set((e.clientX - (r.left + r.width / 2)) * strength);
        y.set((e.clientY - (r.top + r.height / 2)) * strength);
      }}
      onPointerLeave={() => {
        x.set(0);
        y.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}
