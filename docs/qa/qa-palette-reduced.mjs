import { chromium } from "playwright-core";

const OUT = process.argv[2];
const browser = await chromium.launch({ channel: "msedge", headless: true });
const logs = [];
const hook = (page) => {
  page.on("console", (m) => ["error", "warning"].includes(m.type()) && logs.push(`[${m.type()}] ${m.text()}`));
  page.on("pageerror", (e) => logs.push(`[pageerror] ${e.message}`));
};

// 1) Command palette
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  hook(page);
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Continue as Demo Trader" }).click();
  await page.waitForURL("**/dashboard");
  await page.waitForTimeout(2800);
  await page.keyboard.press("Control+k");
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${OUT}-palette-open.png` });
  await page.keyboard.type("gold");
  await page.waitForTimeout(300);
  await page.screenshot({ path: `${OUT}-palette-search.png` });
  await page.keyboard.press("Enter");
  await page.waitForTimeout(900);
  const pal = await page.evaluate(() => document.documentElement.getAttribute("data-palette"));
  if (pal !== "gold") logs.push(`[palette] expected gold, got ${pal}`);
  await page.getByRole("button", { name: "Open command palette" }).click();
  await page.waitForTimeout(400);
  await page.keyboard.type("win");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}-palette-win.png` });
  await page.keyboard.press("Control+k");
  await page.keyboard.type("neon");
  await page.keyboard.press("Enter");
  await page.waitForTimeout(500);
  await ctx.close();
}

// 2) Reduced motion: content must be fully visible without animations
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const page = await ctx.newPage();
  hook(page);
  await page.goto("http://localhost:3000/", { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: `${OUT}-reduced-hero.png` });
  await page.evaluate(() => window.scrollTo(0, 900));
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${OUT}-reduced-stats.png` });
  const hidden = await page.evaluate(() => {
    // any visible-area heading still transparent?
    return [...document.querySelectorAll("h1,h2,h3")]
      .filter((h) => {
        const r = h.getBoundingClientRect();
        return r.top > 0 && r.bottom < window.innerHeight && Number(getComputedStyle(h).opacity) < 0.5;
      })
      .map((h) => h.textContent?.slice(0, 40));
  });
  if (hidden.length) logs.push(`[reduced] transparent headings: ${hidden.join(" | ")}`);
  await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
  await page.getByRole("button", { name: "Continue as Demo Trader" }).click();
  await page.waitForURL("**/dashboard");
  await page.waitForTimeout(700);
  await page.screenshot({ path: `${OUT}-reduced-boot.png` });
  await page.waitForTimeout(2200);
  await page.screenshot({ path: `${OUT}-reduced-dashboard.png` });
  await ctx.close();
}

console.log(logs.length ? [...new Set(logs)].join("\n") : "no console errors");
await browser.close();
