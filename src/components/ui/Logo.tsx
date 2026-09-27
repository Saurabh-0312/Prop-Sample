import Link from "next/link";
import { useId } from "react";
import { brand } from "@/config/brand";
import { cn } from "@/lib/cn";

/** Gradient "N" mark with a rising arrow. Colours follow the live palette. */
export function LogoMark({ className }: { className?: string }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 32 32" className={cn("shrink-0", className)} aria-hidden>
      <defs>
        <linearGradient id={`lg-${id}`} x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="var(--accent-1)" />
          <stop offset="0.55" stopColor="var(--accent-2)" />
          <stop offset="1" stopColor="var(--accent-3)" />
        </linearGradient>
      </defs>
      <rect x="1" y="1" width="30" height="30" rx="9" fill={`url(#lg-${id})`} />
      <rect x="1.5" y="1.5" width="29" height="29" rx="8.5" fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1" />
      <path
        d="M9.5 22.5V10.5L20 21V9.5M16.5 13L20 9.5L23.5 13"
        fill="none"
        stroke="#05070D"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function Logo({ className, href = "/" }: { className?: string; href?: string }) {
  return (
    <Link href={href} className={cn("group flex items-center gap-2.5", className)} aria-label={`${brand.name} home`}>
      <LogoMark className="size-8 transition-transform duration-500 ease-expo group-hover:rotate-[8deg] group-hover:scale-105" />
      <span className="text-[17px] font-semibold tracking-[-0.02em] text-fg">
        {brand.shortName}
        <span className="font-normal text-muted"> {brand.name.replace(brand.shortName, "").trim()}</span>
      </span>
    </Link>
  );
}
