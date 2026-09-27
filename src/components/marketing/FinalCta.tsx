import { ArrowRight } from "lucide-react";
import { BorderBeam } from "@/components/fx/BorderBeam";
import { GridBeams } from "@/components/fx/GridBeams";
import { Magnetic } from "@/components/fx/MagneticButton";
import { Reveal } from "@/components/fx/Reveal";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Misc";
import { brand } from "@/config/brand";

export function FinalCta() {
  return (
    <section className="relative py-20 sm:py-28">
      <Container>
        <Reveal>
          <div className="relative isolate overflow-hidden rounded-[32px] border border-transparent p-8 text-center sm:p-14 lg:p-20">
            <BorderBeam duration={7} width={1.5} />
            {/* aurora glow behind */}
            <div aria-hidden className="absolute inset-0 -z-10 bg-[#070b14]" />
            <div aria-hidden className="aurora -z-10 opacity-80">
              <span className="a1" />
              <span className="a2" />
            </div>
            <GridBeams className="-z-10 opacity-70" beams={false} />
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-1">Your capital is waiting</p>
            <h2 className="mx-auto mt-5 max-w-3xl text-[36px] font-semibold leading-[1.05] tracking-[-0.04em] sm:text-5xl lg:text-6xl">
              Prove your edge. <span className="text-gradient">Trade up to $200K.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base text-muted sm:text-lg">
              Start today with a one-time fee, clear rules and rewards of up to {brand.maxRewardShare}%. Your
              dashboard is ready the moment checkout completes.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Magnetic>
                <Button href="/challenges" size="lg" iconRight={<ArrowRight className="size-4" />}>
                  Start Challenge
                </Button>
              </Magnetic>
              <Button href="/checkout?model=two-step&size=100000" variant="secondary" size="lg">
                Get the $100K 2-Step
              </Button>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
