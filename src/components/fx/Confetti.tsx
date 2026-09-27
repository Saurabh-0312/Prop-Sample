"use client";

import confetti from "canvas-confetti";
import { cn } from "@/lib/cn";
import { currentAccents } from "@/lib/theme";

/** Pass effect: accent-coloured confetti bursts. Reduced motion gets a single small burst. */
export function celebrate(options: { intensity?: "full" | "light" } = {}) {
  if (typeof window === "undefined") return;
  const colors = [...currentAccents(), "#ffffff"];
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const base = { colors, zIndex: 1000, disableForReducedMotion: false };

  if (reduced || options.intensity === "light") {
    confetti({ ...base, particleCount: 60, spread: 70, startVelocity: 32, origin: { y: 0.6 }, ticks: 140 });
    return;
  }

  confetti({ ...base, particleCount: 140, spread: 100, startVelocity: 46, origin: { y: 0.55 }, scalar: 0.95 });
  const end = Date.now() + 900;
  const frame = () => {
    confetti({ ...base, particleCount: 4, angle: 60, spread: 58, origin: { x: 0, y: 0.72 } });
    confetti({ ...base, particleCount: 4, angle: 120, spread: 58, origin: { x: 1, y: 0.72 } });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}

/** Expanding gradient ring. Re-key it to replay. */
export function Shockwave({ className, delay = 0 }: { className?: string; delay?: number }) {
  return <span aria-hidden className={cn("shockwave", className)} style={{ animationDelay: `${delay}ms` }} />;
}
