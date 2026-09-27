"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Menu, X } from "lucide-react";
import { Magnetic } from "@/components/fx/MagneticButton";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/ui/Logo";
import { Container, DemoPill } from "@/components/ui/Misc";
import { cn } from "@/lib/cn";
import { useMounted, useScrolled } from "@/lib/hooks";

export const NAV_LINKS = [
  { href: "/challenges", label: "Challenges" },
  { href: "/#how-it-works", label: "How it Works" },
  { href: "/#payouts", label: "Payouts" },
  { href: "/leaderboard", label: "Leaderboard" },
  { href: "/#faq", label: "FAQ" },
];

export function Navbar() {
  const pathname = usePathname();
  const scrolled = useScrolled(8);
  const mounted = useMounted();
  const [open, setOpen] = useState(false);

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-300",
          scrolled
            ? "border-line bg-[#05070d]/88 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.8)] backdrop-blur-xl"
            : "border-transparent bg-transparent",
        )}
      >
        <Container className="flex h-16 items-center justify-between gap-4">
          <Logo />
          <nav aria-label="Main" className="hidden items-center gap-0.5 lg:flex">
            {NAV_LINKS.map((l) => {
              const active = !l.href.includes("#") && pathname === l.href;
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "relative rounded-lg px-3.5 py-2 text-[13.5px] font-medium transition-colors",
                    active ? "text-fg" : "text-muted hover:text-fg",
                  )}
                >
                  {l.label}
                  {active && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-x-3 -bottom-[13px] h-px bg-gradient-brand shadow-[0_0_12px_var(--accent-2)]"
                    />
                  )}
                </Link>
              );
            })}
          </nav>
          <div className="flex items-center gap-2">
            <DemoPill className="hidden xl:inline-flex" />
            <Button href="/login" variant="ghost" size="sm" className="hidden sm:inline-flex">
              Log in
            </Button>
            <Magnetic className="hidden sm:inline-flex">
              <Button href="/challenges" size="sm" iconRight={<ArrowRight className="size-3.5" />}>
                Start Challenge
              </Button>
            </Magnetic>
            <button
              type="button"
              onClick={() => setOpen(true)}
              aria-label="Open menu"
              aria-expanded={open}
              className="grid size-10 place-items-center rounded-xl border border-line text-fg lg:hidden"
            >
              <Menu className="size-5" />
            </button>
          </div>
        </Container>
      </header>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[75] flex flex-col bg-[#05070d]/95 backdrop-blur-2xl lg:hidden"
                role="dialog"
                aria-modal="true"
                aria-label="Menu"
              >
                <div className="grid-lines opacity-50" />
                <Container className="relative flex h-16 items-center justify-between">
                  <Logo />
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    aria-label="Close menu"
                    className="grid size-10 place-items-center rounded-xl border border-line"
                  >
                    <X className="size-5" />
                  </button>
                </Container>
                <Container className="relative flex flex-1 flex-col gap-1 pt-6">
                  {NAV_LINKS.map((l, i) => (
                    <motion.div
                      key={l.href}
                      initial={{ opacity: 0, y: 16 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 + i * 0.05, ease: [0.22, 1, 0.36, 1], duration: 0.5 }}
                    >
                      <Link
                        href={l.href}
                        onClick={() => setOpen(false)}
                        className="flex items-center justify-between border-b border-line py-4 text-2xl font-semibold tracking-tight"
                      >
                        {l.label}
                        <ArrowRight className="size-5 text-muted" />
                      </Link>
                    </motion.div>
                  ))}
                  <div className="mt-8 flex flex-col gap-3">
                    <Button href="/challenges" size="lg" onClick={() => setOpen(false)} iconRight={<ArrowRight className="size-4" />}>
                      Start Challenge
                    </Button>
                    <Button href="/login" variant="secondary" size="lg" onClick={() => setOpen(false)}>
                      Log in
                    </Button>
                  </div>
                  <DemoPill className="mt-6 self-start" />
                </Container>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
}
