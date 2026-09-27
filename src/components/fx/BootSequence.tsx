"use client";

import { useEffect, useState, useSyncExternalStore, type CSSProperties } from "react";
import { Check } from "lucide-react";
import { brand } from "@/config/brand";
import { cn } from "@/lib/cn";

const LINES: [string, string][] = [
  [`Connecting to ${brand.server} server…`, "OK"],
  ["Authenticating session…", "OK"],
  ["Syncing equity…", "OK"],
  ["Loading risk engine…", "6 rules"],
  ["Streaming market data…", "LIVE"],
];
const LINE_MS = 230;
const TOTAL_MS = LINES.length * LINE_MS + 380;

const noop = () => () => {};
// Decided once per page session, so re-renders never cut the sequence short.
let bootPending: boolean | null = null;
function readNeedsBoot() {
  if (bootPending === null) {
    try {
      bootPending = sessionStorage.getItem(brand.storageKeys.booted) !== "1";
    } catch {
      bootPending = false;
    }
  }
  return bootPending;
}

/** ~1.3s terminal boot on the first dashboard entry of each browser session. */
export function BootSequence() {
  const needsBoot = useSyncExternalStore(noop, readNeedsBoot, () => false);
  const [phase, setPhase] = useState<"run" | "fade" | "done">("run");

  useEffect(() => {
    if (!needsBoot) return;
    try {
      sessionStorage.setItem(brand.storageKeys.booted, "1");
    } catch {
      /* ignore */
    }
    const t1 = setTimeout(() => setPhase("fade"), TOTAL_MS);
    const t2 = setTimeout(() => {
      bootPending = false;
      setPhase("done");
    }, TOTAL_MS + 450);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [needsBoot]);

  if (!needsBoot || phase === "done") return null;

  return (
    <div
      aria-hidden
      onClick={() => {
        setPhase("fade");
        setTimeout(() => {
          bootPending = false;
          setPhase("done");
        }, 450);
      }}
      className={cn(
        "fixed inset-0 z-[80] flex items-center justify-center bg-bg/95 backdrop-blur-xl transition-all duration-500 ease-out",
        phase === "fade" && "pointer-events-none scale-[1.03] opacity-0 blur-md",
      )}
    >
      <div className="grid-lines opacity-60" />
      <div className="relative w-[min(92vw,540px)] rounded-2xl border border-line bg-solid/90 p-6 font-mono text-[13px] shadow-2xl sm:text-sm">
        <div className="mb-4 flex items-center gap-2 text-xs text-muted">
          <span className="size-2.5 rounded-full bg-loss/70" />
          <span className="size-2.5 rounded-full bg-warning/70" />
          <span className="size-2.5 rounded-full bg-profit/70" />
          <span className="ml-2">novaedge — risk-terminal</span>
        </div>
        <ul className="space-y-2">
          {LINES.map(([text, status], i) => (
            <li
              key={text}
              className="boot-line flex items-center justify-between gap-4"
              style={{ animationDelay: `${i * LINE_MS}ms` } as CSSProperties}
            >
              <span className="flex min-w-0 items-center gap-2 text-fg/90">
                <span className="text-accent-1">›</span>
                <span className="truncate">{text}</span>
              </span>
              <span
                className="boot-status flex shrink-0 items-center gap-1 text-accent-1"
                style={{ animationDelay: `${i * LINE_MS + 170}ms` } as CSSProperties}
              >
                <Check className="size-3.5" strokeWidth={3} />
                {status}
              </span>
            </li>
          ))}
        </ul>
        <div className="mt-5 h-1 overflow-hidden rounded-full bg-white/5">
          <div className="boot-progress h-full rounded-full bg-gradient-brand" style={{ animationDuration: `${TOTAL_MS}ms` }} />
        </div>
      </div>
    </div>
  );
}
