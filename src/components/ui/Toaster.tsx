"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ArrowDownRight, ArrowUpRight, CircleAlert, CircleCheck, Info, TriangleAlert, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useToastStore, type ToastItem, type ToastTone } from "@/lib/toast";

const icons: Record<ToastTone, typeof Info> = {
  success: CircleCheck,
  error: CircleAlert,
  info: Info,
  warning: TriangleAlert,
  profit: ArrowUpRight,
  loss: ArrowDownRight,
};

const toneClass: Record<ToastTone, string> = {
  success: "text-accent-1 bg-accent-1/12",
  error: "text-loss bg-loss/12",
  info: "text-accent-2 bg-accent-2/12",
  warning: "text-warning bg-warning/12",
  profit: "text-profit bg-profit/12",
  loss: "text-loss bg-loss/12",
};

function ToastCard({ item }: { item: ToastItem }) {
  const dismiss = useToastStore((s) => s.dismiss);
  const Icon = icons[item.tone];

  useEffect(() => {
    const id = setTimeout(() => dismiss(item.id), item.duration);
    return () => clearTimeout(id);
  }, [dismiss, item.id, item.duration]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -14, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 48, scale: 0.96, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 420, damping: 32 }}
      role={item.tone === "error" ? "alert" : "status"}
      className="glass-solid pointer-events-auto flex w-[min(92vw,380px)] items-start gap-3 rounded-2xl p-3.5 pr-10 backdrop-blur-xl"
    >
      <span className={cn("grid size-8 shrink-0 place-items-center rounded-xl", toneClass[item.tone])}>
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 pt-0.5">
        <p className="text-sm font-semibold leading-5 text-fg">{item.title}</p>
        {item.description && <p className="mt-0.5 text-[13px] leading-5 text-muted">{item.description}</p>}
      </div>
      <button
        type="button"
        aria-label="Dismiss notification"
        onClick={() => dismiss(item.id)}
        className="absolute right-2.5 top-2.5 grid size-7 place-items-center rounded-lg text-muted transition-colors hover:bg-white/[0.06] hover:text-fg"
      >
        <X className="size-3.5" />
      </button>
    </motion.div>
  );
}

export function Toaster() {
  const toasts = useToastStore((s) => s.toasts);
  return (
    <div
      aria-live="polite"
      className="pointer-events-none fixed inset-x-0 top-3 z-[90] flex flex-col items-center gap-2 px-3 sm:inset-x-auto sm:right-5 sm:top-[84px] sm:items-end sm:px-0"
    >
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <ToastCard key={t.id} item={t} />
        ))}
      </AnimatePresence>
    </div>
  );
}
