import type { Metadata } from "next";
import { ChallengesExplorer } from "@/components/challenges/ChallengesExplorer";
import { AuroraBackground } from "@/components/fx/AuroraBackground";
import { Reveal } from "@/components/fx/Reveal";
import { Accordion } from "@/components/ui/Accordion";
import { Container, Eyebrow } from "@/components/ui/Misc";
import { brand } from "@/config/brand";
import { CHALLENGE_FAQ } from "@/data/faq";

export const metadata: Metadata = {
  title: "Challenges",
  description: "Compare every NovaEdge challenge: 2-Step, 1-Step and Instant Funding from $5K to $200K.",
};

export default function ChallengesPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden">
        <AuroraBackground intensity={0.8} />
        <Container className="relative pb-12 pt-16 text-center sm:pb-16 sm:pt-24">
          <span className="word-in" style={{ "--i": 0 } as React.CSSProperties}>
            <Eyebrow>All programs</Eyebrow>
          </span>
          <h1 className="word-in mx-auto mt-6 max-w-3xl text-[42px] font-semibold leading-[1.04] tracking-[-0.045em] sm:text-6xl" style={{ "--i": 1 } as React.CSSProperties}>
            Choose your <span className="text-gradient">challenge</span>
          </h1>
          <p className="word-in mx-auto mt-5 max-w-2xl text-base text-muted sm:text-lg" style={{ "--i": 2 } as React.CSSProperties}>
            Every model, every account size, every rule — side by side. Toggle add-ons to see live prices, and hover any
            rule for a plain-English explanation.
          </p>
          <div className="word-in mt-6 flex flex-wrap items-center justify-center gap-2 text-xs text-muted" style={{ "--i": 3 } as React.CSSProperties}>
            {["One-time fee", "Unlimited time", `Up to ${brand.maxRewardShare}% reward share`, "Fee refunded with 1st reward"].map((t) => (
              <span key={t} className="rounded-full border border-line bg-white/[0.03] px-3 py-1">
                {t}
              </span>
            ))}
          </div>
        </Container>
      </section>

      <Container className="relative pb-20">
        <ChallengesExplorer />

        <section className="mx-auto mt-24 grid grid-cols-1 max-w-5xl gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <Reveal>
            <h2 className="text-3xl font-semibold tracking-[-0.03em]">Challenge FAQ</h2>
            <p className="mt-3 text-muted">Short answers to the questions we hear most while traders compare plans.</p>
          </Reveal>
          <Reveal delay={0.08}>
            <div className="card rounded-3xl px-5 sm:px-7">
              <Accordion items={CHALLENGE_FAQ} defaultOpen={null} />
            </div>
          </Reveal>
        </section>
      </Container>
    </>
  );
}
