"use client";

import { useEffect, useRef } from "react";
import createGlobe, { type Arc, type Marker } from "cobe";
import { cn } from "@/lib/cn";
import { useReducedMotionPref } from "@/lib/hooks";
import { currentAccents, hexToRgb01, usePaletteColors } from "@/lib/theme";

type Props = {
  markers: Marker[];
  arcs?: Arc[];
  className?: string;
};

type RGB = [number, number, number];
const lerp = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const dim = (c: RGB, k: number): RGB => [c[0] * k, c[1] * k, c[2] * k];

/**
 * Interactive dotted WebGL globe (cobe v2). We drive our own animation loop:
 * paused off-screen, slowed for reduced motion, draggable, and recoloured smoothly
 * when the theme palette changes.
 */
export default function Globe({ markers, arcs = [], className }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const markersRef = useRef(markers);
  const arcsRef = useRef(arcs);
  const targetColors = useRef<{ marker: RGB; glow: RGB; arc: RGB } | null>(null);
  const [a1, a2] = usePaletteColors();
  const reduced = useReducedMotionPref();

  useEffect(() => {
    markersRef.current = markers;
  }, [markers]);
  useEffect(() => {
    arcsRef.current = arcs;
  }, [arcs]);
  useEffect(() => {
    targetColors.current = { marker: hexToRgb01(a1), glow: dim(hexToRgb01(a2), 0.32), arc: hexToRgb01(a2) };
  }, [a1, a2]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const [c1, c2] = currentAccents();
    const colors = { marker: hexToRgb01(c1), glow: dim(hexToRgb01(c2), 0.32), arc: hexToRgb01(c2) };
    targetColors.current ??= { ...colors };

    let width = wrap.offsetWidth || 400;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const small = width < 460;
    const globe = createGlobe(canvas, {
      devicePixelRatio: dpr,
      width,
      height: width,
      phi: 4.4,
      theta: 0.3,
      dark: 1,
      diffuse: 1.25,
      mapSamples: small ? 11000 : 20000,
      mapBrightness: 5.5,
      mapBaseBrightness: 0.03,
      baseColor: [0.17, 0.21, 0.3],
      markerColor: colors.marker,
      glowColor: colors.glow,
      markers: markersRef.current,
      arcs: arcsRef.current,
      arcColor: colors.arc,
      arcWidth: 0.55,
      arcHeight: 0.28,
      markerElevation: 0.015,
      opacity: 0.95,
    });
    canvas.style.opacity = "1";

    let phi = 4.4;
    let drag = 0;
    let dragStart: { x: number; drag: number } | null = null;
    let raf = 0;
    let running = false;
    let t = 0;

    const frame = () => {
      t += 1;
      if (!dragStart) phi += reduced ? 0.0008 : 0.0032;
      const target = targetColors.current;
      if (target) {
        colors.marker = lerp(colors.marker, target.marker, 0.08);
        colors.glow = lerp(colors.glow, target.glow, 0.08);
        colors.arc = lerp(colors.arc, target.arc, 0.08);
      }
      const pulsing = reduced
        ? markersRef.current
        : markersRef.current.map((m, i) => ({ ...m, size: m.size * (1 + 0.38 * Math.sin(t * 0.045 + i * 1.7)) }));
      globe.update({
        phi: phi + drag,
        markers: pulsing,
        arcs: arcsRef.current,
        markerColor: colors.marker,
        glowColor: colors.glow,
        arcColor: colors.arc,
      });
      raf = requestAnimationFrame(frame);
    };
    const start = () => {
      if (running) return;
      running = true;
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const io = new IntersectionObserver(([entry]) => (entry.isIntersecting ? start() : stop()), {
      rootMargin: "80px",
    });
    io.observe(wrap);

    const ro = new ResizeObserver(() => {
      const w = wrap.offsetWidth;
      if (w && Math.abs(w - width) > 2) {
        width = w;
        globe.update({ width: w, height: w });
      }
    });
    ro.observe(wrap);

    const onDown = (e: PointerEvent) => {
      dragStart = { x: e.clientX, drag };
      canvas.style.cursor = "grabbing";
      canvas.setPointerCapture(e.pointerId);
    };
    const onMove = (e: PointerEvent) => {
      if (dragStart) drag = dragStart.drag + (e.clientX - dragStart.x) / 180;
    };
    const onUp = () => {
      dragStart = null;
      canvas.style.cursor = "grab";
    };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointercancel", onUp);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointercancel", onUp);
      globe.destroy();
    };
  }, [reduced]);

  return (
    <div ref={wrapRef} className={cn("relative aspect-square w-full", className)}>
      <canvas
        ref={canvasRef}
        className="h-full w-full cursor-grab touch-pan-y opacity-0 transition-opacity duration-1000 [contain:layout_paint_size]"
        aria-label="Interactive globe showing where NovaEdge traders are based"
        role="img"
      />
    </div>
  );
}
