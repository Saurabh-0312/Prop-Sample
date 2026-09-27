import { createRng } from "@/lib/rng";
import type { PayoutMethod } from "@/lib/types";

export const PAYOUT_METHODS: Record<
  PayoutMethod,
  { label: string; short: string; eta: string; field: string; placeholder: string; example: string }
> = {
  usdt: {
    label: "USDT (TRC20)",
    short: "USDT",
    eta: "~15 min after approval",
    field: "TRC20 wallet address",
    placeholder: "T…",
    example: "TQ5b8vRk2mD3hXcN9pYfGw4sLzJa7uE1Vt",
  },
  usdc: {
    label: "USDC (ERC20)",
    short: "USDC",
    eta: "~15 min after approval",
    field: "ERC20 wallet address",
    placeholder: "0x…",
    example: "0x7a3F9c21B04e5D6a8f1C2b3E4d5A6b7C8d9E0f12",
  },
  bank: {
    label: "Bank transfer",
    short: "Bank",
    eta: "1–2 business days",
    field: "IBAN",
    placeholder: "GB29 NWBK …",
    example: "GB29 NWBK 6016 1331 9268 19",
  },
  rise: {
    label: "Rise",
    short: "Rise",
    eta: "Same day",
    field: "Rise account email",
    placeholder: "you@example.com",
    example: "alex.morgan@example.com",
  },
};

/** Validates a payout destination for the chosen method. Returns an error message or null. */
export function validateDestination(method: PayoutMethod, value: string): string | null {
  const v = value.trim();
  if (!v) return `Enter your ${PAYOUT_METHODS[method].field}.`;
  switch (method) {
    case "usdt":
      return /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(v) ? null : "A TRC20 address starts with T and has 34 characters.";
    case "usdc":
      return /^0x[a-fA-F0-9]{40}$/.test(v) ? null : "An ERC20 address starts with 0x followed by 40 hex characters.";
    case "bank":
      return /^[A-Z]{2}\d{2}[A-Z0-9 ]{10,32}$/.test(v.toUpperCase()) ? null : "Enter a valid IBAN, e.g. GB29 NWBK 6016 1331 9268 19.";
    case "rise":
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? null : "Enter the email linked to your Rise account.";
  }
}

export type WallPayout = {
  name: string;
  country: string;
  amount: number;
  method: PayoutMethod;
  ago: string;
  size: string;
};

const NAMES: [string, string][] = [
  ["Ahmed K.", "AE"],
  ["Chiamaka E.", "NG"],
  ["Lucas M.", "BR"],
  ["Priya S.", "IN"],
  ["Daniel W.", "GB"],
  ["Mei Z.", "MY"],
  ["Yusuf A.", "TR"],
  ["Sofia R.", "ES"],
  ["Kwame A.", "GH"],
  ["Hannah K.", "DE"],
  ["Omar F.", "SA"],
  ["Mateo G.", "MX"],
  ["Aisha N.", "KE"],
  ["Chen L.", "SG"],
  ["Tomasz W.", "PL"],
  ["Rafael C.", "PT"],
  ["Noah D.", "AU"],
  ["Isabella F.", "IT"],
];

const AGOS = ["2 min ago", "9 min ago", "18 min ago", "34 min ago", "1h ago", "2h ago", "3h ago", "5h ago", "7h ago", "9h ago", "12h ago", "16h ago", "19h ago", "22h ago"];
const SIZES = ["$25K", "$50K", "$100K", "$100K", "$200K", "$200K"];
const METHODS: PayoutMethod[] = ["usdt", "usdt", "usdt", "rise", "bank", "usdc"];

export const PAYOUT_WALL: WallPayout[] = (() => {
  const rng = createRng("payout-wall");
  return NAMES.map(([name, country], i) => ({
    name,
    country,
    amount: Math.round(rng.range(840, 14_900) * 100) / 100,
    method: rng.pick(METHODS),
    ago: AGOS[i % AGOS.length],
    size: rng.pick(SIZES),
  }));
})();
