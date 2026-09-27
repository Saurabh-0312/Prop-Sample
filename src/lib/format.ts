const usd2 = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const usd0 = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});
const int = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });

export const MINUS = "−";

/** $1,234.56 (or $1,235 with decimals 0). */
export function formatUSD(value: number, decimals: 0 | 2 = 2): string {
  const f = decimals === 0 ? usd0 : usd2;
  const s = f.format(Math.abs(value));
  return value < 0 ? `${MINUS}${s}` : s;
}

/** +$1,234.56 / −$1,234.56 — always signed, for P/L. */
export function formatSignedUSD(value: number, decimals: 0 | 2 = 2): string {
  const f = decimals === 0 ? usd0 : usd2;
  const sign = value > 0 ? "+" : value < 0 ? MINUS : "";
  return `${sign}${f.format(Math.abs(value))}`;
}

export function formatNumber(value: number, decimals = 0): string {
  if (decimals === 0) return int.format(value);
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/** 0.0825 → "8.25%". */
export function formatPct(ratio: number, decimals = 1, signed = false): string {
  const v = ratio * 100;
  const body = `${Math.abs(v).toFixed(decimals)}%`;
  if (!signed) return v < 0 ? `${MINUS}${body}` : body;
  return `${v > 0 ? "+" : v < 0 ? MINUS : ""}${body}`;
}

/** 100000 → "$100K", 5000 → "$5K", 1_240_000 → "$1.24M". */
export function formatSize(value: number): string {
  if (value >= 1_000_000) return `$${+(value / 1_000_000).toFixed(2)}M`;
  if (value >= 1000) return `$${+(value / 1000).toFixed(1)}K`;
  return `$${value}`;
}

export function formatCompactUSD(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 10_000) return `$${(value / 1000).toFixed(1)}K`;
  return usd0.format(value);
}

/** Minutes → "3h 12m" / "45m" / "2d 4h". */
export function formatDuration(minutes: number): string {
  const m = Math.max(0, Math.round(minutes));
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ${m % 60}m`;
  const d = Math.floor(h / 24);
  return `${d}d ${h % 24}h`;
}

/** Milliseconds countdown → "2d 14h 05m 12s". */
export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const d = Math.floor(total / 86400);
  const h = Math.floor((total % 86400) / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return d > 0 ? `${d}d ${pad(h)}h ${pad(m)}m ${pad(s)}s` : `${pad(h)}h ${pad(m)}m ${pad(s)}s`;
}

const dateFmt = new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" });
const dateTimeFmt = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
});
const timeFmt = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});
const longDateFmt = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

export const formatDate = (ts: number) => dateFmt.format(ts);
export const formatDateTime = (ts: number) => dateTimeFmt.format(ts);
export const formatTime = (ts: number) => timeFmt.format(ts);
export const formatLongDate = (ts: number) => longDateFmt.format(ts);

export function timeAgo(ts: number, now: number): string {
  const s = Math.max(0, Math.round((now - ts) / 1000));
  if (s < 10) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}

/** Decimal places used to display a symbol's price. */
export function priceDecimals(symbol: string): number {
  if (symbol.endsWith("JPY")) return 3;
  if (["XAUUSD", "ETHUSD", "BTCUSD", "USOIL"].includes(symbol)) return 2;
  if (["US30", "NAS100", "SPX500", "GER40"].includes(symbol)) return 1;
  return 5;
}

export function formatPrice(symbol: string, price: number): string {
  const d = priceDecimals(symbol);
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  }).format(price);
}

/** Local calendar day key, e.g. "2026-09-26". */
export function dayKey(ts: number): string {
  const d = new Date(ts);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}
