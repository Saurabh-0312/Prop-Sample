import { Footer } from "@/components/marketing/Footer";
import { Navbar } from "@/components/marketing/Navbar";
import { TickerTape } from "@/components/marketing/TickerTape";

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Navbar />
      <TickerTape />
      <main id="main">{children}</main>
      <Footer />
    </>
  );
}
