"use client";

import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { BadgeDollarSign, Crosshair, Rocket, Target } from "lucide-react";
import { Reveal } from "@/components/fx/Reveal";
import { Container, SectionHeading } from "@/components/ui/Misc";
import { cn } from "@/lib/cn";

const STEPS = [
  {
    icon: Crosshair,
    title: "Choose your challenge",
    text: "Pick 2-Step, 1-Step or Instant Funding and an account size from $5K to $200K. One-time fee, no subscriptions.",
    chip: "From $39 with promo",
  },
  {
    icon: Target,
    title: "Pass the evaluation",
    text: "Hit the profit target while respecting the daily and max loss limits. Our risk engine tracks every tick in real time.",
    chip: "8% → 5% targets",
  },
  {
    icon: Rocket,
    title: "Get funded",
    text: "Complete a quick KYC and receive your funded account on MT5, cTrader, Match-Trader or TradeLocker.",
    chip: "Up to $200K simulated capital",
  },
  {
    icon: BadgeDollarSign,
    title: "Get paid",
    text: "Request rewards monthly or bi-weekly in USDT, USDC, bank transfer or Rise. Keep up to 90% of the profits.",
    chip: "Avg. 7h 42m to paid",
  },
];

/** Scroll-linked timeline: the gradient line fills as you scroll and each step lights up. */
export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 72%", "end 60%"] });
  const fill = useSpring(scrollYProgress, { stiffness: 120, damping: 24, mass: 0.4 });
  const [active, setActive] = useState(-1);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    const next = STEPS.findLastIndex((_, i) => v >= (i / (STEPS.length - 1)) * 0.92 + 0.02);
    setActive((prev) => (prev === next ? prev : next));
  });

  return (
    <section id="how-it-works" className="relative py-20 sm:py-28">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="How it works"
            title={
              <>
                From challenge to payout in <span className="text-gradient">four steps</span>
              </>
            }
            subtitle="A transparent path with rules you can see on every screen. No hidden conditions, no time pressure."
          />
        </Reveal>

        <div ref={ref} className="relative mx-auto mt-16 max-w-4xl">
          {/* track + scroll-linked fill */}
          <div aria-hidden className="absolute bottom-6 left-[23px] top-6 w-px bg-white/[0.08] md:left-1/2 md:-translate-x-1/2">
            <motion.div
              style={{ scaleY: fill }}
              className="h-full w-full origin-top bg-[linear-gradient(to_bottom,var(--accent-1),var(--accent-2),var(--accent-3))] shadow-[0_0_14px_var(--accent-2)]"
            />
          </div>

          <ol className="relative space-y-8 md:space-y-0 md:[&>li+li]:-mt-10">
            {STEPS.map((s, i) => {
              const lit = i <= active;
              const right = i % 2 === 1;
              return (
                <li key={s.title} className="relative grid grid-cols-[48px_1fr] items-start gap-5 md:grid-cols-2 md:gap-16">
                  {/* node */}
                  <div className="relative z-10 md:absolute md:left-1/2 md:top-6 md:-translate-x-1/2">
                    <div
                      className={cn(
                        "grid size-12 place-items-center rounded-2xl border transition-all duration-500 ease-expo",
                        lit
                          ? "scale-110 border-transparent bg-gradient-brand text-ink shadow-[0_0_32px_-4px_var(--accent-2)]"
                          : "border-line-strong bg-[#0b101a] text-muted",
                      )}
                    >
                      <s.icon className="size-5" />
                    </div>
                  </div>
                  {/* card */}
                  <div className={cn("md:col-span-1", right ? "md:col-start-2" : "md:col-start-1 md:text-right")}>
                    <div
                      className={cn(
                        "card rounded-2xl p-5 transition-all duration-500 ease-expo sm:p-6",
                        lit ? "translate-y-0 border-white/15 opacity-100" : "translate-y-3 opacity-55",
                      )}
                    >
                      <p className="num text-xs text-accent-1">0{i + 1}</p>
                      <h3 className="mt-2 text-xl font-semibold tracking-tight">{s.title}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted">{s.text}</p>
                      <span
                        className={cn(
                          "mt-4 inline-flex rounded-full border px-2.5 py-1 text-xs",
                          lit ? "border-accent-1/30 bg-accent-1/10 text-accent-1" : "border-line text-muted",
                        )}
                      >
                        {s.chip}
                      </span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </Container>
    </section>
  );
}
