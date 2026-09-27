import { cn } from "@/lib/cn";
import { GridBeams } from "./GridBeams";

type Props = {
  className?: string;
  grid?: boolean;
  beams?: boolean;
  /** 0–1 overall strength of the aurora blobs */
  intensity?: number;
};

/** Slow-moving accent blobs + a 48px grid with radial fade and travelling light beams. */
export function AuroraBackground({ className, grid = true, beams = true, intensity = 1 }: Props) {
  return (
    <div aria-hidden className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <div className="aurora" style={{ opacity: intensity }}>
        <span className="a1" />
        <span className="a2" />
        <span className="a3" />
      </div>
      {grid && <GridBeams beams={beams} />}
      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-bg" />
    </div>
  );
}
