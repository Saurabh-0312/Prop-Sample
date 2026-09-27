"use client";

import type { ReactNode } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/cn";

type SwitchProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
};

export function Switch({ checked, onChange, label, disabled, className }: SwitchProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-[background-color,border-color,box-shadow] duration-300 focus-visible:outline-none focus-visible:ring-glow disabled:opacity-40",
        checked
          ? "border-transparent bg-gradient-brand shadow-[0_0_18px_-4px_var(--accent-1)]"
          : "border-line-strong bg-white/[0.06]",
        className,
      )}
    >
      <span
        className={cn(
          "inline-block size-[18px] rounded-full shadow-md transition-transform duration-300 ease-expo",
          checked ? "translate-x-[22px] bg-ink" : "translate-x-[3px] bg-white/85",
        )}
      />
    </button>
  );
}

type CheckboxProps = {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
  invalid?: boolean;
  className?: string;
};

export function Checkbox({ id, checked, onChange, children, invalid, className }: CheckboxProps) {
  return (
    <label htmlFor={id} className={cn("group flex cursor-pointer items-start gap-3", className)}>
      <span className="relative mt-0.5 shrink-0">
        <input
          id={id}
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-invalid={invalid || undefined}
        />
        <span
          className={cn(
            "grid size-5 place-items-center rounded-md border transition-all duration-200 peer-focus-visible:ring-glow",
            checked
              ? "border-transparent bg-gradient-brand"
              : invalid
                ? "border-loss/70 bg-loss/5"
                : "border-line-strong bg-solid group-hover:border-white/25",
          )}
        >
          <Check className={cn("size-3.5 text-ink transition-opacity", checked ? "opacity-100" : "opacity-0")} strokeWidth={3} />
        </span>
      </span>
      <span className="text-[13px] leading-5 text-muted">{children}</span>
    </label>
  );
}
