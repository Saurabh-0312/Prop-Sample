import { useSyncExternalStore } from "react";
import { brand, palettes, paletteOrder, type PaletteId } from "@/config/brand";

const listeners = new Set<() => void>();

function readPalette(): PaletteId {
  const v = document.documentElement.getAttribute("data-palette");
  return v && (paletteOrder as string[]).includes(v) ? (v as PaletteId) : brand.defaultPalette;
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** Switches the live palette; CSS variables animate over ~450ms. */
export function setPalette(id: PaletteId) {
  document.documentElement.setAttribute("data-palette", id);
  try {
    localStorage.setItem(brand.storageKeys.palette, id);
  } catch {
    /* storage unavailable — palette still applies for this visit */
  }
  listeners.forEach((l) => l());
}

export function usePalette(): PaletteId {
  return useSyncExternalStore(subscribe, readPalette, () => brand.defaultPalette);
}

/** Current accent hex colours — for canvas/WebGL consumers (globe, candles, confetti). */
export function usePaletteColors(): [string, string, string] {
  return palettes[usePalette()].accents;
}

export function currentAccents(): [string, string, string] {
  return palettes[readPalette()].accents;
}

export function hexToRgb01(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  const n = parseInt(h.length === 3 ? h.replace(/./g, "$&$&") : h, 16);
  return [((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255];
}

export function hexWithAlpha(hex: string, alpha: number): string {
  const [r, g, b] = hexToRgb01(hex).map((v) => Math.round(v * 255));
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
