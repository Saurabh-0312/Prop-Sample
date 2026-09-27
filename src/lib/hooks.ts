"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import { useDemoStore } from "./store";

const noopSubscribe = () => () => {};

/** false during SSR and hydration, true afterwards — without setState-in-effect. */
export function useMounted(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}

/* ── Shared 1s clock (one interval for the whole app) ── */
let clockNow = 0;
const clockListeners = new Set<() => void>();
let clockTimer: ReturnType<typeof setInterval> | null = null;

function subscribeClock(cb: () => void) {
  clockListeners.add(cb);
  if (!clockTimer) {
    clockNow = Date.now();
    clockTimer = setInterval(() => {
      clockNow = Date.now();
      clockListeners.forEach((l) => l());
    }, 1000);
    queueMicrotask(() => clockListeners.forEach((l) => l()));
  }
  return () => {
    clockListeners.delete(cb);
    if (!clockListeners.size && clockTimer) {
      clearInterval(clockTimer);
      clockTimer = null;
    }
  };
}

/** Current time, updated every second. 0 on the server / before mount. */
export function useNow(): number {
  return useSyncExternalStore(
    subscribeClock,
    () => clockNow,
    () => 0,
  );
}

const mediaSubs = new Map<string, (cb: () => void) => () => void>();

function mediaSubscribe(query: string) {
  let sub = mediaSubs.get(query);
  if (!sub) {
    sub = (cb: () => void) => {
      const mql = window.matchMedia(query);
      mql.addEventListener("change", cb);
      return () => mql.removeEventListener("change", cb);
    };
    mediaSubs.set(query, sub);
  }
  return sub;
}

export function useMediaQuery(query: string, serverValue = false): boolean {
  return useSyncExternalStore(
    mediaSubscribe(query),
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

/** Mouse/trackpad users — cursor effects are disabled on touch devices. */
export function useFinePointer(): boolean {
  return useMediaQuery("(hover: hover) and (pointer: fine)");
}

export function useReducedMotionPref(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}

export function useIsDesktop(): boolean {
  return useMediaQuery("(min-width: 1024px)", true);
}

/** setInterval that always calls the latest callback. Pauses while the tab is hidden. */
export function useInterval(callback: () => void, ms: number | null) {
  const saved = useRef(callback);
  useEffect(() => {
    saved.current = callback;
  }, [callback]);
  useEffect(() => {
    if (ms === null) return;
    const id = setInterval(() => {
      if (typeof document !== "undefined" && document.hidden) return;
      saved.current();
    }, ms);
    return () => clearInterval(id);
  }, [ms]);
}

function subscribeScroll(cb: () => void) {
  window.addEventListener("scroll", cb, { passive: true });
  return () => window.removeEventListener("scroll", cb);
}

/** true once the page is scrolled past `threshold` px. */
export function useScrolled(threshold = 8): boolean {
  return useSyncExternalStore(
    subscribeScroll,
    () => window.scrollY > threshold,
    () => false,
  );
}

/** True once the persisted demo store has loaded on the client. */
export function useStoreHydrated(): boolean {
  return useDemoStore((s) => s.hydrated);
}
