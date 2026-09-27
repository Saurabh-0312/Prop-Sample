import { Monitor, Smartphone, Globe2, Cpu } from "lucide-react";
import { SpotlightCard } from "@/components/fx/SpotlightCard";
import { Stagger, StaggerItem, Reveal } from "@/components/fx/Reveal";
import { Container, SectionHeading } from "@/components/ui/Misc";

const PLATFORMS = [
  {
    name: "MetaTrader 5",
    tag: "MT5",
    text: "The industry standard. Full EA support, deep history and one-click trading.",
    chips: ["Desktop", "Web", "Mobile"],
  },
  {
    name: "cTrader",
    tag: "cTrader",
    text: "Level II pricing, advanced order types and a clean, modern interface.",
    chips: ["Desktop", "Web", "cBots"],
  },
  {
    name: "Match-Trader",
    tag: "Match",
    text: "TradingView charts in the browser with built-in risk tools. Zero install.",
    chips: ["Web", "Mobile", "TradingView"],
  },
  {
    name: "TradeLocker",
    tag: "TL",
    text: "Discretionary-first workflow with an integrated lot-size calculator.",
    chips: ["Web", "Mobile", "TradingView"],
  },
];

export function Platforms() {
  return (
    <section className="relative py-20 sm:py-24">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Platforms"
            title="Trade on the platform you already know"
            subtitle="Pick your platform at checkout. Credentials are issued instantly and your dashboard syncs in real time."
          />
        </Reveal>
        <Stagger className="mt-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PLATFORMS.map((p) => (
            <StaggerItem key={p.name}>
              <SpotlightCard className="h-full rounded-2xl p-5 sm:p-6">
                <div className="flex items-center justify-between">
                  <span className="rounded-lg border border-line-strong bg-white/[0.04] px-2.5 py-1 font-mono text-xs font-semibold tracking-wide text-fg">
                    {p.tag}
                  </span>
                  <span className="flex gap-1.5 text-muted">
                    <Monitor className="size-4" />
                    <Globe2 className="size-4" />
                    <Smartphone className="size-4" />
                  </span>
                </div>
                <h3 className="mt-6 text-lg font-semibold tracking-tight">{p.name}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{p.text}</p>
                <div className="mt-5 flex flex-wrap gap-1.5">
                  {p.chips.map((c) => (
                    <span key={c} className="rounded-full border border-line px-2 py-0.5 text-[11px] text-muted">
                      {c}
                    </span>
                  ))}
                </div>
              </SpotlightCard>
            </StaggerItem>
          ))}
        </Stagger>
        <Reveal delay={0.1}>
          <p className="mt-8 flex items-center justify-center gap-2 text-center text-sm text-muted">
            <Cpu className="size-4 text-accent-2" />
            Forex, metals, indices, energies and crypto · leverage up to 1:100
          </p>
        </Reveal>
      </Container>
    </section>
  );
}
