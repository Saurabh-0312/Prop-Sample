import Link from "next/link";
import { ArrowLeft, Lock } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { Container, DemoPill } from "@/components/ui/Misc";

export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh">
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[520px] overflow-hidden">
        <div className="grid-lines opacity-70" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_0%,color-mix(in_oklab,var(--accent-2)_12%,transparent),transparent)]" />
      </div>
      <header className="relative border-b border-line">
        <Container className="flex h-16 items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Logo />
            <span className="hidden items-center gap-1.5 rounded-full border border-line px-2.5 py-1 text-xs text-muted sm:inline-flex">
              <Lock className="size-3 text-accent-1" /> Secure checkout
            </span>
          </div>
          <div className="flex items-center gap-3">
            <DemoPill className="hidden md:inline-flex" />
            <Link href="/challenges" className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-fg">
              <ArrowLeft className="size-4" /> All plans
            </Link>
          </div>
        </Container>
      </header>
      <main className="relative">{children}</main>
    </div>
  );
}
