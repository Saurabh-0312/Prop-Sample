import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type FieldProps = {
  label: ReactNode;
  htmlFor: string;
  error?: string | null;
  hint?: ReactNode;
  className?: string;
  children: ReactNode;
  aside?: ReactNode;
};

/** Label + control + inline error/hint. */
export function Field({ label, htmlFor, error, hint, className, children, aside }: FieldProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center justify-between gap-2">
        <label htmlFor={htmlFor} className="text-[13px] font-medium text-fg/90">
          {label}
        </label>
        {aside}
      </div>
      {children}
      {error ? (
        <p id={`${htmlFor}-error`} role="alert" className="flex items-center gap-1.5 text-xs text-loss">
          <span className="size-1 rounded-full bg-loss" />
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
  icon?: ReactNode;
  trailing?: ReactNode;
};

export function Input({ className, invalid, icon, trailing, id, ...props }: InputProps) {
  return (
    <div className="relative">
      {icon && (
        <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted [&>svg]:size-4">
          {icon}
        </span>
      )}
      <input
        id={id}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid && id ? `${id}-error` : undefined}
        className={cn("field", icon && "pl-10", trailing && "pr-11", className)}
        {...props}
      />
      {trailing && <span className="absolute right-1.5 top-1/2 -translate-y-1/2">{trailing}</span>}
    </div>
  );
}

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean };

export function Select({ className, invalid, id, children, ...props }: SelectProps) {
  return (
    <select
      id={id}
      aria-invalid={invalid || undefined}
      aria-describedby={invalid && id ? `${id}-error` : undefined}
      className={cn("field", className)}
      {...props}
    >
      {children}
    </select>
  );
}
