"use client";

import { useEffect, useRef } from "react";
import {
  CandlestickSeries,
  ColorType,
  CrosshairMode,
  LineSeries,
  createChart,
  type CandlestickData,
  type IChartApi,
  type ISeriesApi,
  type UTCTimestamp,
} from "lightweight-charts";
import { SYMBOLS } from "@/data/symbols";
import { priceDecimals } from "@/lib/format";
import { useReducedMotionPref } from "@/lib/hooks";
import { createRng } from "@/lib/rng";
import { currentAccents, usePaletteColors } from "@/lib/theme";

export const TIMEFRAMES = { M5: 300, M15: 900, H1: 3600, H4: 14400 } as const;
export type Timeframe = keyof typeof TIMEFRAMES;

const COUNT = 200;
const UP = "#00D395";
const DOWN = "#FF4D5E";

function generate(symbol: string, tf: Timeframe, endSec: number): CandlestickData<UTCTimestamp>[] {
  const info = SYMBOLS[symbol];
  const rng = createRng(`candles-${symbol}-${tf}`);
  const step = TIMEFRAMES[tf];
  const vol = info.vol * Math.sqrt(step / 60) * 2.2;
  const start = Math.floor(endSec / step) * step - (COUNT - 1) * step;
  let price = info.base * (1 + rng.normal(0, 0.006));
  const out: CandlestickData<UTCTimestamp>[] = [];
  for (let i = 0; i < COUNT; i++) {
    const open = price;
    const trend = Math.sin(i / 23) * vol * 0.35;
    const close = open * (1 + rng.normal(trend, vol));
    const high = Math.max(open, close) * (1 + Math.abs(rng.normal(0, vol * 0.55)));
    const low = Math.min(open, close) * (1 - Math.abs(rng.normal(0, vol * 0.55)));
    out.push({ time: (start + i * step) as UTCTimestamp, open, high, low, close });
    price = close;
  }
  return out;
}

function ema(data: CandlestickData<UTCTimestamp>[], period = 20) {
  const k = 2 / (period + 1);
  let prev = data[0]?.close ?? 0;
  return data.map((d) => {
    prev = d.close * k + prev * (1 - k);
    return { time: d.time, value: prev };
  });
}

/** TradingView lightweight-charts candles: builds up left→right, last candle ticks live. */
export default function CandleChart({ symbol, tf, height = 380 }: { symbol: string; tf: Timeframe; height?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const chartRef = useRef<IChartApi | null>(null);
  const emaRef = useRef<ISeriesApi<"Line"> | null>(null);
  const reduced = useReducedMotionPref();
  const [, accent2] = usePaletteColors();

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const [, a2] = currentAccents();
    const font = getComputedStyle(document.documentElement).getPropertyValue("--font-jetbrains").trim() || "monospace";
    const dec = priceDecimals(symbol);

    const chart = createChart(el, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: "transparent" },
        textColor: "#8A94A6",
        fontFamily: font,
        fontSize: 11,
      },
      grid: {
        vertLines: { color: "rgba(255,255,255,0.035)" },
        horzLines: { color: "rgba(255,255,255,0.035)" },
      },
      crosshair: {
        mode: CrosshairMode.Normal,
        vertLine: { color: "rgba(255,255,255,0.25)", labelBackgroundColor: "#1a2336" },
        horzLine: { color: "rgba(255,255,255,0.25)", labelBackgroundColor: "#1a2336" },
      },
      rightPriceScale: { borderColor: "rgba(255,255,255,0.08)", scaleMargins: { top: 0.12, bottom: 0.08 } },
      timeScale: {
        borderColor: "rgba(255,255,255,0.08)",
        timeVisible: true,
        secondsVisible: false,
        rightOffset: 4,
        shiftVisibleRangeOnNewBar: true,
      },
    });
    chartRef.current = chart;

    const candles = chart.addSeries(CandlestickSeries, {
      upColor: UP,
      downColor: DOWN,
      borderUpColor: UP,
      borderDownColor: DOWN,
      wickUpColor: "rgba(0,211,149,0.75)",
      wickDownColor: "rgba(255,77,94,0.75)",
      priceFormat: { type: "price", precision: dec, minMove: 1 / 10 ** dec },
    });
    const line = chart.addSeries(LineSeries, {
      color: a2,
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
      crosshairMarkerVisible: false,
    });
    emaRef.current = line;

    const data = generate(symbol, tf, Math.floor(Date.now() / 1000));
    const avg = ema(data);
    let raf = 0;
    let live: ReturnType<typeof setInterval> | null = null;

    const startLive = () => {
      const rng = createRng(`live-${symbol}-${tf}`);
      const step = TIMEFRAMES[tf];
      const info = SYMBOLS[symbol];
      let bar = { ...data[data.length - 1] };
      let ticks = 0;
      let lastEma = avg[avg.length - 1].value;
      live = setInterval(() => {
        ticks++;
        if (ticks % 14 === 0) {
          bar = { time: (bar.time + step) as UTCTimestamp, open: bar.close, high: bar.close, low: bar.close, close: bar.close };
        }
        const close = bar.close * (1 + rng.normal(0, info.vol * 1.4));
        bar = { ...bar, close, high: Math.max(bar.high, close), low: Math.min(bar.low, close) };
        candles.update(bar);
        lastEma = close * (2 / 21) + lastEma * (19 / 21);
        line.update({ time: bar.time, value: lastEma });
      }, 1000);
    };

    if (reduced) {
      candles.setData(data);
      line.setData(avg);
      chart.timeScale().fitContent();
      startLive();
    } else {
      // Build the candles up from left to right.
      chart.timeScale().applyOptions({ shiftVisibleRangeOnNewBar: false });
      candles.setData(data.slice(0, 1));
      line.setData(avg.slice(0, 1));
      chart.timeScale().setVisibleLogicalRange({ from: -1, to: COUNT + 3 });
      let i = 1;
      const grow = () => {
        const next = Math.min(COUNT, i + 5);
        for (; i < next; i++) {
          candles.update(data[i]);
          line.update(avg[i]);
        }
        if (i < COUNT) raf = requestAnimationFrame(grow);
        else {
          chart.timeScale().applyOptions({ shiftVisibleRangeOnNewBar: true });
          startLive();
        }
      };
      raf = requestAnimationFrame(grow);
    }

    return () => {
      cancelAnimationFrame(raf);
      if (live) clearInterval(live);
      chart.remove();
      chartRef.current = null;
      emaRef.current = null;
    };
  }, [symbol, tf, reduced]);

  // Recolour the EMA line when the theme palette changes.
  useEffect(() => {
    emaRef.current?.applyOptions({ color: accent2 });
  }, [accent2]);

  return <div ref={ref} style={{ minHeight: height }} className="h-full w-full" />;
}
