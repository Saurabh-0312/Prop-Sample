import type { ReactNode } from "react";
import { NumberRoll } from "@/components/fx/NumberRoll";
import { Reveal } from "@/components/fx/Reveal";
import { Container } from "@/components/ui/Misc";
import { brand } from "@/config/brand";

function Stat({ label, sub, children }: { label: string; sub: string; children: ReactNode }) {
  return (
    <div className="group relative bg-[#080c15] px-5 py-7 sm:px-8 sm:py-9">
      <p className="text-[13px] font-medium text-muted">{label}</p>
      <div className="mt-2 text-[30px] font-semibold leading-none tracking-tight text-fg sm:text-[42px]">{children}</div>
      <p className="mt-3 text-xs text-muted/90">{sub}</p>
      <span className="absolute inset-x-8 bottom-0 h-px scale-x-0 bg-gradient-brand transition-transform duration-500 ease-expo group-hover:scale-x-100" />
    </div>
  );
}

export function StatsBand() {
  const s = brand.stats;
  return (
    <section aria-label="Key numbers" className="relative py-6 sm:py-10">
      <Container>
        <Reveal>
          <div className="grid grid-cols-2 gap-px overflow-hidden rounded-3xl border border-line bg-line lg:grid-cols-4">
            <Stat label="Total Rewards Paid" sub="To funded traders since 2021">
              <NumberRoll value={s.rewardsPaidMillions} format="dec1" prefix="$" suffix="M+" countUp />
            </Stat>
            <Stat label="Funded Traders" sub="Across 2-Step, 1-Step & Instant">
              <NumberRoll value={s.fundedTraders} format="int" suffix="+" countUp />
            </Stat>
            <Stat label="Countries" sub="One global trading community">
              <NumberRoll value={s.countries} format="int" suffix="+" countUp />
            </Stat>
            <Stat label="Avg Payout Time" sub="From request to paid">
              <span className="inline-flex items-baseline gap-2">
                <NumberRoll value={s.avgPayoutHours} format="int" suffix="h" countUp />
                <NumberRoll value={s.avgPayoutMinutes} format="int" suffix="m" countUp />
              </span>
            </Stat>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
