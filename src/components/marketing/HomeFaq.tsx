import { Headphones, Mail } from "lucide-react";
import { Reveal } from "@/components/fx/Reveal";
import { Accordion } from "@/components/ui/Accordion";
import { Button } from "@/components/ui/Button";
import { Container, SectionHeading } from "@/components/ui/Misc";
import { brand } from "@/config/brand";
import { HOME_FAQ } from "@/data/faq";

export function HomeFaq() {
  return (
    <section id="faq" className="relative py-20 sm:py-24">
      <Container className="grid grid-cols-1 gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <Reveal>
          <SectionHeading
            align="left"
            eyebrow="FAQ"
            title="Questions, answered"
            subtitle="Everything traders ask before their first challenge. Still curious? Our team replies in minutes, 24/7."
          />
          <div className="card mt-8 rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <span className="grid size-10 place-items-center rounded-xl bg-accent-2/12 text-accent-2">
                <Headphones className="size-5" />
              </span>
              <div>
                <p className="text-sm font-semibold">24/7 trader support</p>
                <p className="text-xs text-muted">Average first reply: 3 minutes</p>
              </div>
            </div>
            <Button
              href={`mailto:${brand.supportEmail}`}
              variant="secondary"
              size="sm"
              className="mt-4"
              iconLeft={<Mail className="size-3.5" />}
            >
              {brand.supportEmail}
            </Button>
          </div>
        </Reveal>
        <Reveal delay={0.08}>
          <div className="card rounded-3xl px-5 sm:px-7">
            <Accordion items={HOME_FAQ} />
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
