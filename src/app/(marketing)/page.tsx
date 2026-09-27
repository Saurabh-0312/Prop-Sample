import { ChallengeSelector } from "@/components/marketing/ChallengeSelector";
import { FinalCta } from "@/components/marketing/FinalCta";
import { GlobalCommunity } from "@/components/marketing/GlobalCommunity";
import { Hero } from "@/components/marketing/Hero";
import { HomeFaq } from "@/components/marketing/HomeFaq";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { LeaderboardPreview } from "@/components/marketing/LeaderboardPreview";
import { PayoutWall } from "@/components/marketing/PayoutWall";
import { Platforms } from "@/components/marketing/Platforms";
import { StatsBand } from "@/components/marketing/StatsBand";
import { Testimonials } from "@/components/marketing/Testimonials";

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatsBand />
      <HowItWorks />
      <ChallengeSelector />
      <GlobalCommunity />
      <PayoutWall />
      <Platforms />
      <LeaderboardPreview />
      <Testimonials />
      <HomeFaq />
      <FinalCta />
    </>
  );
}
