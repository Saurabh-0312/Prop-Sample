import type { CSSProperties } from "react";
import { cn } from "@/lib/cn";

type Beam = {
  dir: "v" | "h";
  /** grid line index (48px cells) */
  line: number;
  dur: number;
  delay: number;
  color: 1 | 2 | 3;
  desktopOnly?: boolean;
};

// Fixed positions (deterministic → identical on server and client).
const BEAMS: Beam[] = [
  { dir: "v", line: 4, dur: 9, delay: 0.5, color: 1 },
  { dir: "v", line: 11, dur: 11, delay: 3.2, color: 2, desktopOnly: true },
  { dir: "v", line: 19, dur: 8.5, delay: 1.6, color: 3 },
  { dir: "v", line: 27, dur: 12, delay: 5.1, color: 1, desktopOnly: true },
  { dir: "v", line: 33, dur: 10, delay: 2.4, color: 2, desktopOnly: true },
  { dir: "h", line: 3, dur: 13, delay: 1.1, color: 2 },
  { dir: "h", line: 8, dur: 15, delay: 6.3, color: 3, desktopOnly: true },
];

export function GridBeams({ beams = true, className }: { beams?: boolean; className?: string }) {
  return (
    <div className={cn("grid-lines", className)}>
      {beams &&
        BEAMS.map((b, i) => (
          <span
            key={i}
            className={cn(b.dir === "v" ? "beam-v" : "beam-h", b.desktopOnly && "hidden md:block")}
            style={
              {
                [b.dir === "v" ? "left" : "top"]: `${b.line * 48}px`,
                "--beam-dur": `${b.dur}s`,
                "--beam-delay": `${b.delay}s`,
                "--beam-color": `var(--accent-${b.color})`,
              } as CSSProperties
            }
          />
        ))}
    </div>
  );
}
