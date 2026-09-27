"use client";

import { useEffect, type ReactNode } from "react";
import { MotionConfig } from "motion/react";
import { DemoControls } from "@/components/DemoControls";
import { Toaster } from "@/components/ui/Toaster";
import { hydrateDemoStore } from "@/lib/store";

export function Providers({ children }: { children: ReactNode }) {
  useEffect(() => {
    void hydrateDemoStore();
  }, []);

  return (
    <MotionConfig reducedMotion="user">
      {children}
      <Toaster />
      <DemoControls />
    </MotionConfig>
  );
}
