"use client";

import { ChevronRight, Download, Ghost, Loader2, ShieldCheck, Smartphone, Wallet } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { cn } from "@/lib/cn";
import { useMediaQuery } from "@/lib/hooks";
import { useWalletStore, type WalletOption } from "@/lib/wallet";

const FALLBACK: Record<string, { bg: string; icon: typeof Wallet }> = {
  metamask: { bg: "bg-[#F6851B]", icon: Wallet },
  phantom: { bg: "bg-[#AB9FF2]", icon: Ghost },
};

/** Wallet logo: the EIP-6963 icon when the extension provides one, a brand tile otherwise. */
export function WalletIcon({ id, icon, className }: { id: string; icon?: string; className?: string }) {
  if (icon) {
    // eslint-disable-next-line @next/next/no-img-element -- data: URI supplied by the wallet extension
    return <img src={icon} alt="" className={cn("size-9 shrink-0 rounded-xl", className)} />;
  }
  const f = FALLBACK[id] ?? { bg: "bg-white/[0.08]", icon: Wallet };
  const Icon = f.icon;
  return (
    <span className={cn("grid size-9 shrink-0 place-items-center rounded-xl text-white", f.bg, className)}>
      <Icon className="size-[55%]" />
    </span>
  );
}

const CHAIN_LABEL = { evm: "Ethereum & EVM", solana: "Solana" } as const;

function WalletRow({ option, isMobile }: { option: WalletOption; isMobile: boolean }) {
  const connectingId = useWalletStore((s) => s.connectingId);
  const connect = useWalletStore((s) => s.connect);
  const busy = connectingId === option.id;

  const row =
    "group flex w-full items-center gap-3.5 rounded-2xl border border-line bg-white/[0.02] p-3.5 text-left transition-colors hover:border-white/15 hover:bg-white/[0.05] disabled:opacity-60";
  const body = (
    <>
      <WalletIcon id={option.id} icon={option.icon} className="size-10" />
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold">{option.name}</span>
        <span className="block text-xs text-muted">{CHAIN_LABEL[option.chain]}</span>
      </span>
    </>
  );

  if (!option.installed) {
    // On phones, browser extensions don't exist — open the site inside the wallet app instead.
    const href = isMobile && option.deepLink ? option.deepLink() : option.installUrl;
    if (!href) return null;
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={row}>
        {body}
        <span className="flex items-center gap-1.5 text-xs font-medium text-accent-2">
          {isMobile ? <Smartphone className="size-3.5" /> : <Download className="size-3.5" />}
          {isMobile ? "Open in app" : "Install"}
        </span>
      </a>
    );
  }

  return (
    <button type="button" className={row} disabled={!!connectingId} onClick={() => void connect(option.id)}>
      {body}
      {busy ? (
        <span className="flex items-center gap-1.5 text-xs font-medium text-muted">
          <Loader2 className="size-3.5 animate-spin" /> Check wallet…
        </span>
      ) : (
        <span className="flex items-center gap-1.5">
          <span className="rounded-full border border-accent-1/25 bg-accent-1/10 px-2 py-0.5 text-[10.5px] font-medium text-accent-1">
            Detected
          </span>
          <ChevronRight className="size-4 text-muted transition-transform group-hover:translate-x-0.5" />
        </span>
      )}
    </button>
  );
}

export function ConnectWalletModal() {
  const open = useWalletStore((s) => s.modalOpen);
  const options = useWalletStore((s) => s.options);
  const connectingId = useWalletStore((s) => s.connectingId);
  const close = useWalletStore((s) => s.closeModal);
  const isMobile = useMediaQuery("(hover: none) and (pointer: coarse)");

  return (
    <Modal
      open={open}
      onClose={close}
      locked={!!connectingId}
      size="sm"
      title="Connect a wallet"
      description="Link a wallet to pay for challenges and receive crypto payouts."
    >
      <div className="space-y-2.5">
        {options.map((o) => (
          <WalletRow key={o.id} option={o} isMobile={isMobile} />
        ))}
      </div>
      <p className="mt-5 flex items-start gap-2 text-xs leading-relaxed text-muted">
        <ShieldCheck className="mt-px size-3.5 shrink-0 text-accent-1" />
        We only read your public address. Connecting never moves funds or asks for your seed phrase.
      </p>
    </Modal>
  );
}
