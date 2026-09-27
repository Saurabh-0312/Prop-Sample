"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { motion, useMotionTemplate, useMotionValue, useSpring, useTransform } from "motion/react";
import { cn } from "@/lib/cn";
import { useFinePointer, useReducedMotionPref } from "@/lib/hooks";

type Props = {
  children: ReactNode;
  className?: string;
  innerClassName?: string;
  /** max tilt in degrees */
  max?: number;
  /** follow the cursor anywhere on the page, not only while hovering */
  trackWindow?: boolean;
  glare?: boolean;
};

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Perspective tilt that follows the mouse. Disabled on touch devices and with reduced motion. */
export function TiltCard({ children, className, innerClassName, max = 9, trackWindow = false, glare = true }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const fine = useFinePointer();
  const reduced = useReducedMotionPref();
  const enabled = fine && !reduced;

  const px = useMotionValue(0.5);
  const py = useMotionValue(0.5);
  const spring = { stiffness: 110, damping: 18, mass: 0.6 };
  const rotateY = useSpring(useTransform(px, [0, 1], [-max, max]), spring);
  const rotateX = useSpring(useTransform(py, [0, 1], [max * 0.8, -max * 0.8]), spring);
  const gx = useTransform(px, [0, 1], ["15%", "85%"]);
  const gy = useTransform(py, [0, 1], ["10%", "90%"]);
  const glareBg = useMotionTemplate`radial-gradient(520px circle at ${gx} ${gy}, rgba(255,255,255,0.07), transparent 45%)`;

  useEffect(() => {
    if (!enabled || !trackWindow) return;
    let raf = 0;
    const onMove = (e: PointerEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const el = ref.current;
        if (!el) return;
        const r = el.getBoundingClientRect();
        px.set(clamp((e.clientX - r.left) / r.width, -0.3, 1.3));
        py.set(clamp((e.clientY - r.top) / r.height, -0.3, 1.3));
      });
    };
    const onLeave = () => {
      px.set(0.5);
      py.set(0.5);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
    };
  }, [enabled, trackWindow, px, py]);

  const local = enabled && !trackWindow;

  return (
    <div
      ref={ref}
      className={cn("[perspective:1400px]", className)}
      onPointerMove={
        local
          ? (e) => {
              const r = e.currentTarget.getBoundingClientRect();
              px.set((e.clientX - r.left) / r.width);
              py.set((e.clientY - r.top) / r.height);
            }
          : undefined
      }
      onPointerLeave={
        local
          ? () => {
              px.set(0.5);
              py.set(0.5);
            }
          : undefined
      }
    >
      <motion.div
        className={cn("relative [transform-style:preserve-3d]", innerClassName)}
        style={enabled ? { rotateX, rotateY } : undefined}
      >
        {children}
        {glare && enabled && (
          <motion.div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-[inherit]"
            style={{ background: glareBg }}
          />
        )}
      </motion.div>
    </div>
  );
}
