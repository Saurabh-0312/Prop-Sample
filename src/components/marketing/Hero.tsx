import type { CSSProperties } from "react";
import { Star, Zap } from "lucide-react";
import { AuroraBackground } from "@/components/fx/AuroraBackground";
import { ScrambleText } from "@/components/fx/ScrambleText";
import { Container } from "@/components/ui/Misc";
import { brand } from "@/config/brand";
import { formatNumber } from "@/lib/format";
import { HeroCtas, LatestRewardChip } from "./HeroClient";
import { HeroMockup } from "./HeroMockup";

const KEYWORDS = ["Forex", "Gold", "Indices", "Crypto"] as const;

const word = (i: number) => ({ "--i": i }) as CSSProperties;

export function Hero() {
  return (
    <section className="relative isolate overflow-hidden">
      <AuroraBackground />
      <Container className="relative grid grid-cols-1 items-center gap-16 pb-20 pt-12 sm:pt-16 lg:grid-cols-[1.08fr_1fr] lg:gap-8 lg:pb-28 lg:pt-20">
        <div className="relative z-10 max-w-2xl">
          {brand.promo.active && (
            <span className="word-in inline-flex items-center gap-2 rounded-full border border-line bg-white/[0.04] py-1 pl-1 pr-3 text-xs text-muted backdrop-blur" style={word(0)}>
              <span className="rounded-full bg-gradient-brand px-2 py-0.5 text-[11px] font-semibold text-ink">
                −{brand.promo.pct}%
              </span>
              {brand.promo.label} on 2-Step &amp; 1-Step challenges
            </span>
          )}

          <h1 className="mt-6 text-[44px] font-semibold leading-[1.02] tracking-[-0.045em] sm:text-[64px] lg:text-[76px]">
            <span className="word-in" style={word(1)}>Trade</span>{" "}
            <span className="word-in" style={word(2)}>up</span>{" "}
            <span className="word-in" style={word(3)}>to</span>{" "}
            <span className="word-in" style={word(4)}>
              <span className="text-gradient-animated">$200,000</span>
            </span>{" "}
            <span className="word-in" style={word(5)}>of</span>{" "}
            <span className="word-in" style={word(6)}>our</span>{" "}
            <span className="word-in" style={word(7)}>capital.</span>
          </h1>

          <p className="word-in mt-5 font-mono text-[19px] sm:text-2xl" style={word(9)}>
            <span className="text-muted">Your edge in </span>
            <ScrambleText words={KEYWORDS} className="font-semibold text-gradient" />
            <span className="caret" aria-hidden />
          </p>

          <p className="word-in mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg" style={word(10)}>
            {brand.tagline} Prove your edge on simulated capital, get funded, and receive rewards within 24 hours of
            requesting them.
          </p>

          <HeroCtas />

          <div className="word-in mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm" style={word(13)}>
            <div className="flex items-center gap-2">
              <span className="flex text-warning" aria-hidden>
                {[0, 1, 2, 3, 4].map((i) => (
                  <Star key={i} className="size-4 fill-current" />
                ))}
              </span>
              <span className="font-semibold">{brand.stats.trustpilot}/5</span>
              <span className="text-muted">· {formatNumber(brand.stats.reviews)} reviews</span>
            </div>
            <div className="flex items-center gap-2 text-muted">
              <Zap className="size-4 text-accent-1" />
              Payouts in under 24h
            </div>
          </div>
          <div className="word-in mt-4" style={word(14)}>
            <LatestRewardChip />
          </div>
        </div>

        <HeroMockup />
      </Container>
    </section>
  );
}
