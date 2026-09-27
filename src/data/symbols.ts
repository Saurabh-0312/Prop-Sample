export type SymbolInfo = {
  symbol: string;
  name: string;
  base: number;
  /** USD value of a 1.0 price move for 1 lot (for USD-quoted instruments). */
  contract: number;
  /** true when the quote currency is JPY (P/L converted by price). */
  jpy?: boolean;
  /** typical per-trade move range, in price units */
  move: [number, number];
  /** typical tick volatility as a fraction of price */
  vol: number;
};

export const SYMBOLS: Record<string, SymbolInfo> = {
  EURUSD: { symbol: "EURUSD", name: "Euro / US Dollar", base: 1.17342, contract: 100_000, move: [0.0008, 0.0042], vol: 0.00018 },
  GBPUSD: { symbol: "GBPUSD", name: "British Pound / US Dollar", base: 1.34518, contract: 100_000, move: [0.001, 0.0055], vol: 0.0002 },
  USDJPY: { symbol: "USDJPY", name: "US Dollar / Japanese Yen", base: 147.862, contract: 100_000, jpy: true, move: [0.12, 0.85], vol: 0.0002 },
  GBPJPY: { symbol: "GBPJPY", name: "British Pound / Japanese Yen", base: 198.914, contract: 100_000, jpy: true, move: [0.15, 1.1], vol: 0.00024 },
  AUDUSD: { symbol: "AUDUSD", name: "Australian Dollar / US Dollar", base: 0.65941, contract: 100_000, move: [0.0006, 0.003], vol: 0.0002 },
  XAUUSD: { symbol: "XAUUSD", name: "Gold / US Dollar", base: 3764.28, contract: 100, move: [2.5, 22], vol: 0.00035 },
  US30: { symbol: "US30", name: "Wall Street 30", base: 46318.4, contract: 1, move: [35, 240], vol: 0.00025 },
  NAS100: { symbol: "NAS100", name: "US Tech 100", base: 24612.8, contract: 1, move: [22, 170], vol: 0.0003 },
  SPX500: { symbol: "SPX500", name: "US 500", base: 6641.3, contract: 1, move: [6, 42], vol: 0.00025 },
  GER40: { symbol: "GER40", name: "Germany 40", base: 23684.2, contract: 1, move: [20, 140], vol: 0.00028 },
  BTCUSD: { symbol: "BTCUSD", name: "Bitcoin / US Dollar", base: 109284.5, contract: 1, move: [260, 1900], vol: 0.0006 },
  ETHUSD: { symbol: "ETHUSD", name: "Ethereum / US Dollar", base: 4018.62, contract: 1, move: [14, 95], vol: 0.0008 },
  USOIL: { symbol: "USOIL", name: "WTI Crude Oil", base: 64.82, contract: 1000, move: [0.2, 1.4], vol: 0.0004 },
};

export const TICKER_SYMBOLS = [
  "EURUSD",
  "GBPUSD",
  "XAUUSD",
  "US30",
  "NAS100",
  "BTCUSD",
  "USDJPY",
  "ETHUSD",
  "GER40",
  "SPX500",
  "USOIL",
  "GBPJPY",
];

/** Weighted list used when generating trades. */
export const TRADED_SYMBOLS = [
  "XAUUSD",
  "XAUUSD",
  "XAUUSD",
  "EURUSD",
  "EURUSD",
  "NAS100",
  "NAS100",
  "GBPUSD",
  "US30",
  "USDJPY",
  "BTCUSD",
  "GER40",
  "GBPJPY",
  "ETHUSD",
  "AUDUSD",
];

/** USD value of a price move of `move` for `lots` lots at `price`. */
export function moveValue(info: SymbolInfo, lots: number, move: number, price: number): number {
  return info.jpy ? (lots * info.contract * move) / price : lots * info.contract * move;
}
