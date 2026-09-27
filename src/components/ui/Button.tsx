import Link from "next/link";
import type { ButtonHTMLAttributes, MouseEventHandler, ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

const base =
  "relative inline-flex select-none items-center justify-center gap-2 whitespace-nowrap rounded-xl font-semibold tracking-tight transition-[background-color,border-color,color,box-shadow,transform,filter] duration-200 focus-visible:outline-none focus-visible:ring-glow disabled:pointer-events-none disabled:opacity-50";

const variants: Record<Variant, string> = {
  primary: "btn-primary",
  secondary:
    "border border-line-strong bg-white/[0.04] text-fg hover:border-white/20 hover:bg-white/[0.08] active:scale-[0.98]",
  ghost: "text-muted hover:bg-white/[0.05] hover:text-fg",
  danger: "border border-loss/35 bg-loss/12 text-loss hover:bg-loss/20 active:scale-[0.98]",
  outline:
    "border border-accent-1/40 text-accent-1 hover:border-accent-1/70 hover:bg-accent-1/10 active:scale-[0.98]",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[13px]",
  md: "h-11 px-5 text-sm",
  lg: "h-13 px-7 text-[15px]",
};

type Common = {
  variant?: Variant;
  size?: Size;
  className?: string;
  children?: ReactNode;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  loading?: boolean;
  fullWidth?: boolean;
};

type AsButton = Common & ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };
type AsLink = Common & {
  href: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
  target?: string;
  rel?: string;
  prefetch?: boolean;
  scroll?: boolean;
  "aria-label"?: string;
};

export type ButtonProps = AsButton | AsLink;

export function buttonClasses(variant: Variant = "primary", size: Size = "md", extra?: string) {
  return cn(base, variants[variant], sizes[size], extra);
}

export function Button(props: ButtonProps) {
  return props.href !== undefined ? <LinkButton {...props} /> : <NativeButton {...props} />;
}

function LinkButton({
  variant = "primary",
  size = "md",
  className,
  children,
  iconLeft,
  iconRight,
  fullWidth,
  loading,
  href,
  onClick,
  target,
  rel,
  prefetch,
  scroll,
  ...aria
}: AsLink) {
  return (
    <Link
      href={href}
      onClick={onClick}
      target={target}
      rel={rel}
      prefetch={prefetch}
      scroll={scroll}
      aria-label={aria["aria-label"]}
      className={buttonClasses(variant, size, cn(fullWidth && "w-full", className))}
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : iconLeft}
      {children}
      {iconRight}
    </Link>
  );
}

function NativeButton({
  variant = "primary",
  size = "md",
  className,
  children,
  iconLeft,
  iconRight,
  fullWidth,
  loading,
  type = "button",
  disabled,
  ...rest
}: AsButton) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={buttonClasses(variant, size, cn(fullWidth && "w-full", className))}
      {...rest}
    >
      {loading ? <Loader2 className="size-4 animate-spin" /> : iconLeft}
      {children}
      {iconRight}
    </button>
  );
}
