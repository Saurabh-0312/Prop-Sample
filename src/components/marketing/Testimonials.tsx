import { Quote, Star } from "lucide-react";
import { Marquee } from "@/components/fx/Marquee";
import { Reveal } from "@/components/fx/Reveal";
import { Avatar } from "@/components/ui/Avatar";
import { Container, SectionHeading } from "@/components/ui/Misc";
import { brand } from "@/config/brand";
import { flag } from "@/data/countries";
import { TESTIMONIALS } from "@/data/testimonials";
import { formatNumber } from "@/lib/format";

export function Testimonials() {
  return (
    <section className="relative py-20 sm:py-24">
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow="Trader stories"
            title="Built with traders, rated by traders"
            subtitle={`${brand.stats.trustpilot}/5 average from ${formatNumber(brand.stats.reviews)} verified reviews.`}
          />
        </Reveal>
      </Container>
      <div className="mt-12">
        <Marquee duration={65}>
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.name}
              className="flex w-[340px] shrink-0 flex-col rounded-3xl border border-line bg-[linear-gradient(180deg,#0e1420,#0a0e17)] p-6 sm:w-[380px]"
            >
              <div className="flex items-center justify-between">
                <span className="flex text-warning" aria-label={`${t.rating} out of 5 stars`}>
                  {Array.from({ length: 5 }, (_, i) => (
                    <Star key={i} className={i < t.rating ? "size-4 fill-current" : "size-4 opacity-30"} />
                  ))}
                </span>
                <Quote className="size-5 text-accent-2/40" />
              </div>
              <blockquote className="mt-4 flex-1 text-[15px] leading-relaxed text-fg/90">“{t.quote}”</blockquote>
              <figcaption className="mt-6 flex items-center gap-3 border-t border-line pt-4">
                <Avatar name={t.name} />
                <div>
                  <p className="text-sm font-semibold">
                    {t.name} <span>{flag(t.country)}</span>
                  </p>
                  <p className="text-xs text-muted">{t.badge}</p>
                </div>
              </figcaption>
            </figure>
          ))}
        </Marquee>
      </div>
    </section>
  );
}
