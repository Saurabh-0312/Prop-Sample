"use client";

import { useEffect, useId, useRef, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useMounted } from "@/lib/hooks";

type Props = {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "breach" | "success";
  className?: string;
  hideClose?: boolean;
  /** prevent closing by backdrop click / Escape (e.g. while processing) */
  locked?: boolean;
  /** called after the exit animation finishes */
  onExited?: () => void;
};

const widths = { sm: "sm:max-w-md", md: "sm:max-w-lg", lg: "sm:max-w-2xl", xl: "sm:max-w-4xl" };

let openCount = 0;

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  size = "md",
  variant = "default",
  className,
  hideClose,
  locked,
  onExited,
}: Props) {
  const mounted = useMounted();
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  useEffect(() => {
    if (!open) return;
    openCount++;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const prevFocus = document.activeElement as HTMLElement | null;
    const t = setTimeout(() => {
      const first = panelRef.current?.querySelector<HTMLElement>("[data-autofocus], input, select, textarea");
      (first ?? panelRef.current)?.focus({ preventScroll: true });
    }, 60);
    return () => {
      clearTimeout(t);
      openCount--;
      if (openCount === 0) document.body.style.overflow = prevOverflow === "hidden" ? "" : prevOverflow;
      prevFocus?.focus?.({ preventScroll: true });
    };
  }, [open]);

  useEffect(() => {
    if (!open || locked) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, locked, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence onExitComplete={onExited}>
      {open && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4">
          <motion.div
            className="absolute inset-0 bg-[#020308]/70 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={locked ? undefined : onClose}
          />
          {variant === "breach" && (
            <motion.div
              aria-hidden
              className="breach-vignette"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )}
          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            tabIndex={-1}
            initial={{ opacity: 0, y: 28, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className={cn(
              "relative z-10 max-h-[92dvh] w-full overflow-y-auto rounded-t-3xl border border-line-strong bg-[linear-gradient(180deg,rgba(20,28,45,0.97),rgba(9,13,22,0.97))] p-5 shadow-[0_30px_120px_-20px_rgba(0,0,0,0.8)] outline-none sm:rounded-3xl sm:p-7",
              widths[size],
              variant === "breach" && "border-loss/40 shadow-[0_0_80px_-20px_var(--loss)]",
              variant === "success" && "border-accent-1/30",
              className,
            )}
          >
            <div className={cn(variant === "breach" && "shake")}>
              {variant === "breach" && <div aria-hidden className="scanlines rounded-[inherit]" />}
              {!hideClose && !locked && (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="absolute right-4 top-4 z-10 grid size-9 place-items-center rounded-full text-muted transition-colors hover:bg-white/[0.06] hover:text-fg"
                >
                  <X className="size-4.5" />
                </button>
              )}
              {(title || description) && (
                <div className="mb-5 pr-10">
                  {title && (
                    <h2 id={titleId} className="text-xl font-semibold tracking-tight">
                      {title}
                    </h2>
                  )}
                  {description && <p className="mt-1.5 text-sm text-muted">{description}</p>}
                </div>
              )}
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
