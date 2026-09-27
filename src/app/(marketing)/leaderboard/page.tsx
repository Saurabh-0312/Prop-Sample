import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { AuroraBackground } from "@/components/fx/AuroraBackground";
import { LeaderboardBoard } from "@/components/leaderboard/LeaderboardBoard";
import { Button } from "@/components/ui/Button";
import { Container, Eyebrow } from "@/components/ui/Misc";

export const metadata: Metadata = {
  title: "Leaderboard",
  description: "The top 25 NovaEdge traders this month and of all time.",
};

const w = (i: number) => ({ "--i": i }) as React.CSSProperties;

export default function LeaderboardPage() {
  return (
    <>
      <section className="relative isolate overflow-hidden">
        <AuroraBackground intensity={0.8} />
        <Container className="relative pb-10 pt-16 text-center sm:pb-14 sm:pt-24">
          <span className="word-in" style={w(0)}>
            <Eyebrow>Leaderboard</Eyebrow>
          </span>
          <h1 className="word-in mx-auto mt-6 max-w-3xl text-[42px] font-semibold leading-[1.04] tracking-[-0.045em] sm:text-6xl" style={w(1)}>
            The best traders on <span className="text-gradient">simulated capital</span>
          </h1>
          <p className="word-in mx-auto mt-5 max-w-2xl text-base text-muted sm:text-lg" style={w(2)}>
            Ranked by return on funded and evaluation accounts. Updated every trading day — names are masked for privacy.
          </p>
        </Container>
      </section>
      <Container className="pb-24">
        <LeaderboardBoard />
        <div className="card mt-10 flex flex-col items-center gap-4 rounded-3xl p-8 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <p className="text-lg font-semibold">Think you can make the board?</p>
            <p className="text-sm text-muted">Start a challenge today — your stats count from the first trade.</p>
          </div>
          <Button href="/challenges" iconRight={<ArrowRight className="size-4" />}>
            Start Challenge
          </Button>
        </div>
      </Container>
    </>
  );
}
