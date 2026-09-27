import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { AuthPanel } from "@/components/auth/AuthPanel";
import { Logo } from "@/components/ui/Logo";
import { DemoPill } from "@/components/ui/Misc";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 min-h-dvh lg:grid-cols-[1fr_1.05fr]">
      <div className="relative flex flex-col px-5 py-6 sm:px-10 lg:px-16">
        <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden lg:hidden">
          <div className="grid-lines opacity-60" />
        </div>
        <div className="relative flex items-center justify-between gap-3">
          <Logo />
          <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-fg">
            <ArrowLeft className="size-4" /> Home
          </Link>
        </div>
        <div className="relative flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[420px]">{children}</div>
        </div>
        <div className="relative flex justify-center">
          <DemoPill />
        </div>
      </div>
      <AuthPanel />
    </div>
  );
}
