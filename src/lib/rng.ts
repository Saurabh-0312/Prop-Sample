/**
 * Seeded PRNG (mulberry32). All mock data is generated from fixed seeds so the
 * server and client render identical markup — no Math.random() during render.
 */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** FNV-1a string hash → 32-bit seed. */
export function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export type Rng = {
  next: () => number;
  range: (min: number, max: number) => number;
  int: (min: number, max: number) => number;
  pick: <T>(items: readonly T[]) => T;
  chance: (p: number) => boolean;
  normal: (mean?: number, sd?: number) => number;
  shuffle: <T>(items: readonly T[]) => T[];
};

export function createRng(seed: number | string): Rng {
  const next = mulberry32(typeof seed === "string" ? hashString(seed) : seed);
  const range = (min: number, max: number) => min + (max - min) * next();
  const int = (min: number, max: number) => Math.floor(range(min, max + 1));
  return {
    next,
    range,
    int,
    pick: (items) => items[Math.floor(next() * items.length)],
    chance: (p) => next() < p,
    normal: (mean = 0, sd = 1) => {
      // Box–Muller
      const u = Math.max(next(), 1e-9);
      const v = next();
      return mean + sd * Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
    },
    shuffle: (items) => {
      const arr = items.slice();
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(next() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
      return arr;
    },
  };
}
