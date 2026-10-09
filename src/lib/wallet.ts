"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { brand } from "@/config/brand";
import { toast } from "./toast";

/*
 * Browser-wallet connections without a web3 SDK.
 *  - EVM wallets (MetaMask, Rabby, Coinbase, …) are discovered via EIP-6963,
 *    with `window.ethereum` as a fallback for older MetaMask builds.
 *  - Phantom connects through its Solana provider (`window.phantom.solana`).
 */

/* ─────────────────────────── Provider types ─────────────────────────── */

type Eip1193Provider = {
  request(args: { method: string; params?: unknown[] | object }): Promise<unknown>;
  on?(event: string, fn: (...args: never[]) => void): void;
  removeListener?(event: string, fn: (...args: never[]) => void): void;
  isMetaMask?: boolean;
  isPhantom?: boolean;
};

type SolanaPublicKey = { toString(): string };
type PhantomSolana = {
  isPhantom?: boolean;
  publicKey: SolanaPublicKey | null;
  connect(opts?: { onlyIfTrusted?: boolean }): Promise<{ publicKey: SolanaPublicKey }>;
  disconnect(): Promise<void>;
  on(event: "accountChanged" | "disconnect" | "connect", fn: (arg?: SolanaPublicKey | null) => void): void;
  removeListener?(event: string, fn: (...args: never[]) => void): void;
};

type Eip6963Info = { uuid: string; name: string; icon: string; rdns: string };
type Eip6963AnnounceEvent = CustomEvent<{ info: Eip6963Info; provider: Eip1193Provider }>;

declare global {
  interface Window {
    ethereum?: Eip1193Provider;
    phantom?: { solana?: PhantomSolana };
  }
  interface WindowEventMap {
    "eip6963:announceProvider": Eip6963AnnounceEvent;
  }
}

/* ─────────────────────────── Public types ─────────────────────────── */

export type WalletChain = "evm" | "solana";

export type WalletOption = {
  /** "metamask", "phantom", or the EIP-6963 rdns of another detected wallet */
  id: string;
  name: string;
  chain: WalletChain;
  icon?: string;
  installed: boolean;
  installUrl?: string;
  /** opens the site inside the wallet's in-app browser (mobile) */
  deepLink?: () => string;
};

export type WalletConnection = {
  walletId: string;
  name: string;
  chain: WalletChain;
  icon?: string;
  address: string;
  /** hex chain id for EVM wallets */
  chainId?: string;
};

/* ─────────────────────────── Known wallets ─────────────────────────── */

const METAMASK_RDNS = "io.metamask";
const PHANTOM_RDNS = "app.phantom";

const KNOWN: Record<"metamask" | "phantom", Omit<WalletOption, "installed" | "icon">> = {
  metamask: {
    id: "metamask",
    name: "MetaMask",
    chain: "evm",
    installUrl: "https://metamask.io/download/",
    deepLink: () => `https://metamask.app.link/dapp/${location.host}${location.pathname}`,
  },
  phantom: {
    id: "phantom",
    name: "Phantom",
    chain: "solana",
    installUrl: "https://phantom.com/download",
    deepLink: () =>
      `https://phantom.app/ul/browse/${encodeURIComponent(location.href)}?ref=${encodeURIComponent(location.origin)}`,
  },
};

const CHAINS: Record<string, { name: string; explorer: string }> = {
  "0x1": { name: "Ethereum", explorer: "https://etherscan.io" },
  "0xa": { name: "Optimism", explorer: "https://optimistic.etherscan.io" },
  "0x38": { name: "BNB Chain", explorer: "https://bscscan.com" },
  "0x89": { name: "Polygon", explorer: "https://polygonscan.com" },
  "0x2105": { name: "Base", explorer: "https://basescan.org" },
  "0xa4b1": { name: "Arbitrum", explorer: "https://arbiscan.io" },
  "0xaa36a7": { name: "Sepolia", explorer: "https://sepolia.etherscan.io" },
};

export function networkName(c: WalletConnection): string {
  if (c.chain === "solana") return "Solana";
  return (c.chainId && CHAINS[c.chainId]?.name) ?? `Chain ${c.chainId ? parseInt(c.chainId, 16) : "?"}`;
}

export function explorerUrl(c: WalletConnection): string | null {
  if (c.chain === "solana") return `https://solscan.io/account/${c.address}`;
  const explorer = c.chainId && CHAINS[c.chainId]?.explorer;
  return explorer ? `${explorer}/address/${c.address}` : null;
}

export function shortAddress(address: string): string {
  return address.length > 12 ? `${address.slice(0, 6)}…${address.slice(-4)}` : address;
}

/* ─────────────────────────── Provider registry ─────────────────────────── */

const evmProviders = new Map<string, { info: Eip6963Info; provider: Eip1193Provider }>();

function phantomSolana(): PhantomSolana | undefined {
  const p = typeof window !== "undefined" ? window.phantom?.solana : undefined;
  return p?.isPhantom ? p : undefined;
}

function evmProvider(walletId: string): Eip1193Provider | undefined {
  const rdns = walletId === "metamask" ? METAMASK_RDNS : walletId;
  const found = evmProviders.get(rdns)?.provider;
  if (found) return found;
  // Legacy MetaMask without EIP-6963 support
  if (walletId === "metamask" && window.ethereum?.isMetaMask && !window.ethereum.isPhantom) return window.ethereum;
  return undefined;
}

function buildOptions(): WalletOption[] {
  const mm = evmProviders.get(METAMASK_RDNS);
  const options: WalletOption[] = [
    { ...KNOWN.metamask, installed: !!evmProvider("metamask"), icon: mm?.info.icon },
    { ...KNOWN.phantom, installed: !!phantomSolana(), icon: evmProviders.get(PHANTOM_RDNS)?.info.icon },
  ];
  for (const { info } of evmProviders.values()) {
    if (info.rdns === METAMASK_RDNS || info.rdns === PHANTOM_RDNS) continue;
    options.push({ id: info.rdns, name: info.name, chain: "evm", icon: info.icon, installed: true });
  }
  return options;
}

/* ─────────────────────────── Store ─────────────────────────── */

type WalletState = {
  connection: WalletConnection | null;
  options: WalletOption[];
  connectingId: string | null;
  modalOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  connect: (walletId: string) => Promise<void>;
  disconnect: () => Promise<void>;
};

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      connection: null,
      options: [],
      connectingId: null,
      modalOpen: false,
      openModal: () => set({ modalOpen: true, options: buildOptions() }),
      closeModal: () => set({ modalOpen: false }),

      connect: async (walletId) => {
        if (get().connectingId) return;
        const option = get().options.find((o) => o.id === walletId);
        const name = option?.name ?? walletId;
        set({ connectingId: walletId });
        try {
          const connection =
            walletId === "phantom" ? await connectPhantom(false) : await connectEvm(walletId, option, true);
          if (!connection) throw new Error(`${name} isn’t available in this browser.`);
          detachListeners();
          attachListeners(connection);
          set({ connection, modalOpen: false });
          toast.success(`${name} connected`, `${shortAddress(connection.address)} · ${networkName(connection)}`);
        } catch (err) {
          const { title, body } = describeError(err, name);
          toast.error(title, body);
        } finally {
          set({ connectingId: null });
        }
      },

      disconnect: async () => {
        const c = get().connection;
        detachListeners();
        set({ connection: null });
        if (!c) return;
        try {
          if (c.chain === "solana") await phantomSolana()?.disconnect();
          // Revoke so the next connect shows the account picker again (MetaMask supports this).
          else await evmProvider(c.walletId)?.request({ method: "wallet_revokePermissions", params: [{ eth_accounts: {} }] });
        } catch {
          /* not every wallet supports revoking — the local session is cleared regardless */
        }
        toast.info("Wallet disconnected", `${c.name} · ${shortAddress(c.address)}`);
      },
    }),
    {
      name: brand.storageKeys.wallet,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
      partialize: (s) => ({ connection: s.connection }),
    },
  ),
);

/* ─────────────────────────── Connect helpers ─────────────────────────── */

async function connectEvm(
  walletId: string,
  option: WalletOption | undefined,
  prompt: boolean,
): Promise<WalletConnection | null> {
  const provider = evmProvider(walletId);
  if (!provider) return null;
  const accounts = (await provider.request({ method: prompt ? "eth_requestAccounts" : "eth_accounts" })) as string[];
  if (!accounts?.length) return null;
  const chainId = (await provider.request({ method: "eth_chainId" })) as string;
  return {
    walletId,
    name: option?.name ?? evmProviders.get(walletId)?.info.name ?? walletId,
    chain: "evm",
    icon: option?.icon,
    address: accounts[0],
    chainId: chainId?.toLowerCase(),
  };
}

async function connectPhantom(silent: boolean): Promise<WalletConnection | null> {
  const provider = phantomSolana();
  if (!provider) return null;
  const { publicKey } = await provider.connect(silent ? { onlyIfTrusted: true } : undefined);
  return {
    walletId: "phantom",
    name: "Phantom",
    chain: "solana",
    icon: evmProviders.get(PHANTOM_RDNS)?.info.icon,
    address: publicKey.toString(),
  };
}

function describeError(err: unknown, name: string): { title: string; body?: string } {
  const e = err as { code?: number; message?: string } | undefined;
  if (e?.code === 4001) return { title: "Request rejected", body: `You declined the connection in ${name}.` };
  if (e?.code === -32002)
    return { title: "Request already pending", body: `Open ${name} to approve the waiting connection request.` };
  return { title: `Couldn’t connect ${name}`, body: e?.message };
}

/* ─────────────────────────── Live account / network changes ─────────────────────────── */

let detach: (() => void) | null = null;

function detachListeners() {
  detach?.();
  detach = null;
}

function attachListeners(c: WalletConnection) {
  const update = (patch: Partial<WalletConnection>) => {
    const cur = useWalletStore.getState().connection;
    if (cur) useWalletStore.setState({ connection: { ...cur, ...patch } });
  };
  const drop = () => {
    detachListeners();
    useWalletStore.setState({ connection: null });
    toast.info("Wallet disconnected", `${c.name} ended the session.`);
  };

  if (c.chain === "solana") {
    const p = phantomSolana();
    if (!p) return;
    const onAccount = (pk?: SolanaPublicKey | null) => (pk ? update({ address: pk.toString() }) : drop());
    p.on("accountChanged", onAccount);
    p.on("disconnect", drop);
    detach = () => {
      p.removeListener?.("accountChanged", onAccount as never);
      p.removeListener?.("disconnect", drop as never);
    };
    return;
  }

  const p = evmProvider(c.walletId);
  if (!p?.on) return;
  const onAccounts = (accounts: string[]) => (accounts.length ? update({ address: accounts[0] }) : drop());
  const onChain = (chainId: string) => update({ chainId: chainId.toLowerCase() });
  p.on("accountsChanged", onAccounts as never);
  p.on("chainChanged", onChain as never);
  detach = () => {
    p.removeListener?.("accountsChanged", onAccounts as never);
    p.removeListener?.("chainChanged", onChain as never);
  };
}

/* ─────────────────────────── Init ─────────────────────────── */

let initialized = false;

/** Discovers installed wallets and silently restores the previous session. Client only, idempotent. */
export function initWallets() {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  // Rehydrate before any setState — persist writes on every set and would overwrite the saved session.
  void Promise.resolve(useWalletStore.persist.rehydrate()).then(() => {
    window.addEventListener("eip6963:announceProvider", (e) => {
      evmProviders.set(e.detail.info.rdns, e.detail);
      useWalletStore.setState({ options: buildOptions() });
    });
    window.dispatchEvent(new Event("eip6963:requestProvider"));
    useWalletStore.setState({ options: buildOptions() });

    const saved = useWalletStore.getState().connection;
    if (!saved) return;
    // Extensions announce asynchronously; give them a moment before restoring.
    setTimeout(async () => {
      try {
        const restored =
          saved.chain === "solana" ? await connectPhantom(true) : await connectEvm(saved.walletId, undefined, false);
        if (!restored) throw new Error("not authorized");
        attachListeners(restored);
        useWalletStore.setState({ connection: { ...restored, name: saved.name, icon: restored.icon ?? saved.icon } });
      } catch {
        useWalletStore.setState({ connection: null });
      }
    }, 400);
  });
}
