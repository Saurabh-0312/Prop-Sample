"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";
import { useReducedMotionPref } from "@/lib/hooks";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#%&*+=<>/";

type Props = {
  words: readonly string[];
  interval?: number;
  duration?: number;
  className?: string;
};

/** Cycles through words with a decrypt/scramble effect. First word is server-rendered. */
export function ScrambleText({ words, interval = 2600, duration = 700, className }: Props) {
  const [text, setText] = useState(words[0]);
  const reduced = useReducedMotionPref();

  useEffect(() => {
    let idx = 0;
    let raf = 0;
    let timer: ReturnType<typeof setTimeout>;

    const scrambleTo = (target: string) => {
      const start = performance.now();
      const step = (t: number) => {
        const p = Math.min(1, (t - start) / duration);
        let out = "";
        for (let i = 0; i < target.length; i++) {
          const reveal = p * (target.length + 4) - i;
          out += reveal >= 3 ? target[i] : GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
        }
        setText(out);
        if (p < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };

    const loop = () => {
      if (!document.hidden) {
        idx = (idx + 1) % words.length;
        if (reduced) setText(words[idx]);
        else scrambleTo(words[idx]);
      }
      timer = setTimeout(loop, interval);
    };
    timer = setTimeout(loop, interval);
    return () => {
      clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [words, interval, duration, reduced]);

  return (
    <>
      <span aria-hidden className={cn("whitespace-pre", className)}>
        {text}
      </span>
      <span className="sr-only">{words.join(", ")}</span>
    </>
  );
}
