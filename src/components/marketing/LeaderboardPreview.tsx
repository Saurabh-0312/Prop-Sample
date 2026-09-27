import Link from "next/link";
import { ArrowRight, ArrowUpRight, Crown } from "lucide-react";
import { Reveal } from "@/components/fx/Reveal";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Container, SectionHeading } from "@/components/ui/Misc";
import { flag } from "@/data/countries";
import { LEADERBOARD } from "@/data/leaderboard";
import { MODELS } from "@/data/plans";
import { formatSize, formatUSD } from "@/lib/format";
import { cn } from "@/lib/cn";

const MEDAL = ["text-warning", "text-[#c8d3e6]", "text-[#e0a574]"];

export function LeaderboardPreview() {
  const top = LEADERBOARD.month.slice(0, 5);
  return (
    <section className="relative py-20 sm:py-24">
      <Container className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:gap-14">
        <Reveal>
          <SectionHeading
            align="left"
            eyebrow="Leaderboard"
            title={
              <>
                This month’s <span className="text-gradient">top performers</span>
              </>
            }
            subtitle="Ranked by return on funded and evaluation accounts. Updated every trading day."
          />
          <Link
            href="/leaderboard"
            className="group mt-8 inline-flex items-center gap-2 text-sm font-semibold text-accent-1"
          >
            View full leaderboard
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Reveal>

        <Reveal delay={0.08}>
          <div className="card overflow-hidden rounded-3xl">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[540px] text-sm">
                <thead>
                  <tr className="border-b border-line text-left text-xs text-muted">
                    <th className="px-5 py-3.5 font-medium">#</th>
                    <th className="px-2 py-3.5 font-medium">Trader</th>
                    <th className="px-2 py-3.5 font-medium">Account</th>
                    <th className="px-2 py-3.5 text-right font-medium">Profit</th>
                    <th className="px-5 py-3.5 text-right font-medium">Gain</th>
                  </tr>
                </thead>
                <tbody>
                  {top.map((t, i) => (
                    <tr key={t.name} className="border-b border-line/70 transition-colors last:border-0 hover:bg-white/[0.025]">
                      <td className="px-5 py-3.5">
                        {i < 3 ? (
                          <Crown className={cn("size-4", MEDAL[i])} aria-label={`Rank ${t.rank}`} />
                        ) : (
                          <span className="num text-muted">{t.rank}</span>
                        )}
                      </td>
                      <td className="px-2 py-3.5">
                        <div className="flex items-center gap-3">
                          <Avatar name={t.name} size="sm" />
                          <span className="font-medium">
                            {t.name} <span>{flag(t.country)}</span>
                          </span>
                        </div>
                      </td>
                      <td className="px-2 py-3.5">
                        <Badge tone={t.model === "instant" ? "funded" : "neutral"} dot={false}>
                          {formatSize(t.size)} {MODELS[t.model].shortName}
                        </Badge>
                      </td>
                      <td className="px-2 py-3.5 text-right">
                        <span className="num inline-flex items-center gap-0.5 font-semibold text-profit">
                          <ArrowUpRight className="size-3.5" />+{t.profitPct.toFixed(2)}%
                        </span>
                      </td>
                      <td className="num px-5 py-3.5 text-right text-fg/90">+{formatUSD(t.gain, 0)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
