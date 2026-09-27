import type { Metadata } from "next";
import { ArrowLeft, LayoutDashboard } from "lucide-react";
import { AuroraBackground } from "@/components/fx/AuroraBackground";
import { Button } from "@/components/ui/Button";
import { LogoMark } from "@/components/ui/Logo";

export const metadata: Metadata = { title: "Page not found" };

export default function NotFound() {
  return (
    <main className="relative isolate grid min-h-dvh place-items-center overflow-hidden px-4 py-16">
      <AuroraBackground />
      <div className="relative text-center">
        <LogoMark className="mx-auto size-12" />
        <p className="mt-8 font-mono text-xs tracking-[0.2em] text-accent-1">ERROR 404 · ROUTE NOT FOUND</p>
        <h1 className="mt-3 text-[104px] font-bold leading-none tracking-[-0.06em] sm:text-[150px]">
          <span className="glitch-text" data-text="404">
            <span className="text-gradient">404</span>
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-md text-muted">
          This chart has no candles — the page you’re looking for moved or never existed.
        </p>
        <div className="mt-9 flex flex-wrap justify-center gap-3">
          <Button href="/" iconLeft={<ArrowLeft className="size-4" />}>
            Back to home
          </Button>
          <Button href="/challenges" variant="secondary">
            View challenges
          </Button>
          <Button href="/dashboard" variant="ghost" iconLeft={<LayoutDashboard className="size-4" />}>
            Dashboard
          </Button>
        </div>
      </div>
    </main>
  );
}
