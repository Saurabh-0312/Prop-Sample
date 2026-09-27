"use client";

import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "motion/react";
import { X } from "lucide-react";
import { BootSequence } from "@/components/fx/BootSequence";
import { Skeleton } from "@/components/ui/Misc";
import { useMounted } from "@/lib/hooks";
import { useDemoStore } from "@/lib/store";
import { CommandPalette } from "./CommandPalette";
import { EventModals } from "./EventModals";
import { LiveEngine } from "./LiveEngine";
import { Sidebar, SidebarContent } from "./Sidebar";
import { Topbar } from "./Topbar";

function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading dashboard">
      <div className="flex gap-4 overflow-hidden">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-[132px] w-[280px] shrink-0 rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-[118px] rounded-2xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.4fr_1fr]">
        <Skeleton className="h-[380px] rounded-2xl" />
        <Skeleton className="h-[380px] rounded-2xl" />
      </div>
    </div>
  );
}

function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const mounted = useMounted();
  if (!mounted) return null;
  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[75] lg:hidden">
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.aside
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            className="absolute inset-y-0 left-0 w-[284px] max-w-[85vw] border-r border-line bg-elevated"
            aria-label="Navigation"
          >
            <button
              type="button"
              onClick={onClose}
              aria-label="Close navigation"
              className="absolute right-3 top-3.5 z-10 grid size-9 place-items-center rounded-lg border border-line text-muted"
            >
              <X className="size-4" />
            </button>
            <SidebarContent onNavigate={onClose} layoutId="dash-nav-mobile" />
          </motion.aside>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

export function DashboardShell({ children }: { children: ReactNode }) {
  const hydrated = useDemoStore((s) => s.hydrated);
  const session = useDemoStore((s) => s.session);
  const router = useRouter();
  const pathname = usePathname();
  const [drawer, setDrawer] = useState(false);
  const ready = hydrated && !!session;

  useEffect(() => {
    if (hydrated && !session) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [hydrated, session, router, pathname]);

  return (
    <div className="relative min-h-dvh">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(ellipse_70%_45%_at_60%_-10%,color-mix(in_oklab,var(--accent-2)_9%,transparent),transparent)]"
      />
      <Sidebar />
      <MobileDrawer open={drawer} onClose={() => setDrawer(false)} />
      <div className="lg:pl-[264px]">
        <Topbar onMenu={() => setDrawer(true)} />
        <main className="mx-auto w-full max-w-[1480px] px-4 pb-28 pt-6 sm:px-6 lg:px-8 lg:pt-8">
          {ready ? children : <DashboardSkeleton />}
        </main>
      </div>
      {ready && <LiveEngine />}
      {ready && <EventModals />}
      {ready && <CommandPalette />}
      <BootSequence />
    </div>
  );
}
