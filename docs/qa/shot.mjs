// Usage: node shot.mjs <url> <out.png> [width] [height] [--full] [--wait=ms] [--scrollTo=y] [--reduced] [--click=selector] [--eval=js]
import { chromium } from "playwright-core";

const args = process.argv.slice(2);
const url = args[0];
const out = args[1];
const width = Number(args[2] ?? 1440);
const height = Number(args[3] ?? 900);
const flags = Object.fromEntries(
  args
    .filter((a) => a.startsWith("--"))
    .map((a) => {
      const [k, ...v] = a.slice(2).split("=");
      return [k, v.length ? v.join("=") : true];
    }),
);

const browser = await chromium.launch({ channel: "msedge", headless: true });
const context = await browser.newContext({
  viewport: { width, height },
  deviceScaleFactor: 1,
  reducedMotion: flags.reduced ? "reduce" : "no-preference",
  hasTouch: width < 700,
  isMobile: width < 700,
});
const page = await context.newPage();
const logs = [];
page.on("console", (m) => {
  if (["error", "warning"].includes(m.type())) logs.push(`[${m.type()}] ${m.text()}`);
});
page.on("pageerror", (e) => logs.push(`[pageerror] ${e.message}`));

await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(Number(flags.wait ?? 1800));

if (flags.eval) {
  await page.evaluate(flags.eval);
  await page.waitForTimeout(800);
}
if (flags.click) {
  for (const sel of String(flags.click).split("||")) {
    await page.click(sel, { timeout: 5000 });
    await page.waitForTimeout(Number(flags.clickwait ?? 900));
  }
}

if (flags.full) {
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += Math.floor(height * 0.6)) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(260);
  }
  await page.waitForTimeout(900);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
  await page.screenshot({ path: out, fullPage: true });
} else {
  if (flags.scrollTo) {
    await page.evaluate((yy) => window.scrollTo(0, Number(yy)), flags.scrollTo);
    await page.waitForTimeout(Number(flags.after ?? 1400));
  }
  await page.screenshot({ path: out, fullPage: false });
}

const hScroll = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
console.log(`horizontal overflow: ${hScroll}px`);
console.log(logs.length ? logs.join("\n") : "no console errors");
await browser.close();
