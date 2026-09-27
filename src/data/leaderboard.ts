import { createRng } from "@/lib/rng";
import type { AccountSize, ModelId } from "./plans";

export type Leader = {
  rank: number;
  name: string;
  country: string;
  size: AccountSize;
  model: ModelId;
  profitPct: number;
  gain: number;
  winRate: number;
  trades: number;
  days: number;
};

const TRADERS: [string, string][] = [
  ["Ahmed K.", "AE"],
  ["Sofia R.", "ES"],
  ["Kenji T.", "JP"],
  ["Lucas M.", "BR"],
  ["Amara O.", "NG"],
  ["Daniel W.", "GB"],
  ["Priya S.", "IN"],
  ["Mateo G.", "MX"],
  ["Chen L.", "SG"],
  ["Olivia B.", "CA"],
  ["Yusuf A.", "TR"],
  ["Hannah K.", "DE"],
  ["Rafael C.", "PT"],
  ["Aisha N.", "KE"],
  ["Tomasz W.", "PL"],
  ["Emeka U.", "NG"],
  ["Isabella F.", "IT"],
  ["Arjun P.", "IN"],
  ["Noah D.", "AU"],
  ["Layla H.", "SA"],
  ["Viktor S.", "CZ"],
  ["Mei Z.", "MY"],
  ["Gabriel R.", "CO"],
  ["Fatima Z.", "MA"],
  ["Jonas E.", "SE"],
  ["Diego H.", "AR"],
  ["Sara V.", "NL"],
  ["Omar F.", "EG"],
];

const SIZES: AccountSize[] = [25000, 50000, 100000, 100000, 200000, 200000, 200000];
const MODELS: ModelId[] = ["two-step", "two-step", "one-step", "instant"];

function build(seed: string, top: number, spread: number): Leader[] {
  const rng = createRng(seed);
  const people = rng.shuffle(TRADERS).slice(0, 25);
  let pct = top;
  return people.map(([name, country], i) => {
    const size = rng.pick(SIZES);
    const profitPct = Math.round(pct * 100) / 100;
    pct -= rng.range(spread * 0.3, spread);
    return {
      rank: i + 1,
      name,
      country,
      size,
      model: rng.pick(MODELS),
      profitPct,
      gain: Math.round((size * profitPct) / 100),
      winRate: Math.round(rng.range(52, 78)),
      trades: rng.int(38, 260),
      days: rng.int(9, 29),
    };
  });
}

export const LEADERBOARD = {
  month: build("leaders-month", 24.86, 1.1),
  all: build("leaders-all", 68.42, 2.6),
};
