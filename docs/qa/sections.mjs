// Usage: node sections.mjs <url> <outPrefix> <width> <height> <selector|y:number> [...]
// Scrolls to each target (in order), waits for animations, and captures the viewport.
import { chromium } from "playwright-core";

const [url, prefix, w, h, ...targets] = process.argv.slice(2);
const width = Number(w);
const height = Number(h);
const browser = await chromium.launch({ channel: "msedge", headless: true });
const context = await browser.newContext({
  viewport: { width, height },
  deviceScaleFactor: 1,
  hasTouch: width < 700,
  isMobile: width < 700,
});
const page = await context.newPage();
const logs = [];
page.on("console", (m) => {
  if (["error", "warning"].includes(m.type())) logs.push(`[${m.type()}] ${m.text()}`);
});
page.on("pageerror", (e) => logs.push(`[pageerror] ${e.message}`));
page.on("response", (r) => {
  if (r.status() >= 400) logs.push(`[http ${r.status()}] ${r.url()}`);
});

await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(1500);

let i = 0;
for (const t of targets) {
  if (t.startsWith("y:")) {
    const y = Number(t.slice(2));
    // step so scroll-linked effects see intermediate positions
    const cur = await page.evaluate(() => window.scrollY);
    const steps = 6;
    for (let s = 1; s <= steps; s++) {
      await page.evaluate((yy) => window.scrollTo(0, yy), cur + ((y - cur) * s) / steps);
      await page.waitForTimeout(90);
    }
  } else {
    const found = await page.$(t);
    if (!found) {
      logs.push(`[missing] ${t}`);
      continue;
    }
    const top = await page.evaluate((sel) => {
      const el = document.querySelector(sel);
      const r = el.getBoundingClientRect();
      return r.top + window.scrollY - 70;
    }, t);
    const cur = await page.evaluate(() => window.scrollY);
    const steps = 8;
    for (let s = 1; s <= steps; s++) {
      await page.evaluate((yy) => window.scrollTo(0, yy), cur + ((top - cur) * s) / steps);
      await page.waitForTimeout(90);
    }
  }
  await page.waitForTimeout(1600);
  await page.screenshot({ path: `${prefix}-${String(i).padStart(2, "0")}.png` });
  i++;
}
const hScroll = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
console.log(`horizontal overflow: ${hScroll}px`);
console.log(logs.length ? [...new Set(logs)].join("\n") : "no console errors");
await browser.close();
