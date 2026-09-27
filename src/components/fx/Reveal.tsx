"use client";

import type { ReactNode } from "react";
import { motion, type Variants } from "motion/react";

const EASE = [0.22, 1, 0.36, 1] as const;

type RevealProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
  blur?: boolean;
};

/** Blur + rise reveal the first time the element enters the viewport. */
export function Reveal({ children, className, delay = 0, y = 18, blur = true }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: blur ? "blur(8px)" : "blur(0px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)", transitionEnd: { filter: "none" } }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.6, ease: EASE },
    // Leaving a filter on the wrapper would break backdrop-blur on glass cards inside.
    transitionEnd: { filter: "none" },
  },
};

type StaggerProps = {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
  /** animate on mount instead of on scroll */
  immediate?: boolean;
};

/** Container that staggers its <StaggerItem> children (60–90ms apart). */
export function Stagger({ children, className, stagger = 0.075, delay = 0, immediate = false }: StaggerProps) {
  const variants: Variants = {
    hidden: {},
    show: { transition: { staggerChildren: stagger, delayChildren: delay } },
  };
  return immediate ? (
    <motion.div className={className} initial="hidden" animate="show" variants={variants}>
      {children}
    </motion.div>
  ) : (
    <motion.div className={className} initial="hidden" whileInView="show" viewport={{ once: true, amount: 0.1 }} variants={variants}>
      {children}
    </motion.div>
  );
}

export function StaggerItem({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div className={className} variants={staggerItem}>
      {children}
    </motion.div>
  );
}
