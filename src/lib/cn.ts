type ClassValue = string | number | bigint | boolean | null | undefined | ClassValue[];

const DISPLAY = new Set([
  "block",
  "inline-block",
  "inline",
  "flex",
  "inline-flex",
  "grid",
  "inline-grid",
  "hidden",
  "contents",
  "table",
  "flow-root",
  "list-item",
]);

function collect(values: ClassValue[], out: string[]) {
  for (const v of values) {
    if (!v || v === true) continue;
    if (Array.isArray(v)) collect(v, out);
    else for (const t of String(v).split(/\s+/)) if (t) out.push(t);
  }
}

/**
 * Joins truthy class names. Components list their defaults first and the caller's
 * `className` last; for the base (un-prefixed) display utility the last one wins, so
 * `className="hidden sm:inline-flex"` can override a component's `inline-flex`.
 */
export function cn(...values: ClassValue[]): string {
  const tokens: string[] = [];
  collect(values, tokens);
  let lastDisplay = -1;
  for (let i = tokens.length - 1; i >= 0; i--) {
    if (DISPLAY.has(tokens[i])) {
      lastDisplay = i;
      break;
    }
  }
  return tokens.filter((t, i) => !DISPLAY.has(t) || i === lastDisplay).join(" ");
}
