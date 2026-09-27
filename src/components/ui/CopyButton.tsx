"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/cn";
import { toast } from "@/lib/toast";

async function copyText(value: string) {
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    const ta = document.createElement("textarea");
    ta.value = value;
    ta.setAttribute("readonly", "");
    ta.style.position = "fixed";
    ta.style.opacity = "0";
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand("copy");
    ta.remove();
    return ok;
  }
}

export function CopyButton({
  value,
  label = "Copy",
  toastLabel,
  className,
}: {
  value: string;
  label?: string;
  toastLabel?: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      aria-label={label}
      onClick={async () => {
        const ok = await copyText(value);
        if (ok) {
          setCopied(true);
          toast.success(toastLabel ?? "Copied to clipboard");
          setTimeout(() => setCopied(false), 1600);
        } else {
          toast.error("Couldn’t copy", "Select the text and copy it manually.");
        }
      }}
      className={cn(
        "grid size-8 shrink-0 place-items-center rounded-lg text-muted transition-colors hover:bg-white/[0.06] hover:text-fg",
        copied && "text-accent-1 hover:text-accent-1",
        className,
      )}
    >
      {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
    </button>
  );
}
