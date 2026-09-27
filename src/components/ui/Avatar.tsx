import { cn } from "@/lib/cn";
import { initials } from "@/lib/format";
import { hashString } from "@/lib/rng";

const TINTS = [
  "bg-accent-1/15 text-accent-1 ring-accent-1/25",
  "bg-accent-2/15 text-accent-2 ring-accent-2/25",
  "bg-accent-3/15 text-accent-3 ring-accent-3/25",
];

export function Avatar({ name, className, size = "md" }: { name: string; className?: string; size?: "sm" | "md" | "lg" }) {
  const tint = TINTS[hashString(name) % TINTS.length];
  return (
    <span
      aria-hidden
      className={cn(
        "grid shrink-0 place-items-center rounded-full font-semibold ring-1",
        size === "sm" ? "size-7 text-[11px]" : size === "lg" ? "size-12 text-base" : "size-9 text-xs",
        tint,
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
