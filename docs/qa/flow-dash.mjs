import { chromium } from "playwright-core";

const OUT = process.argv[2];
const W = Number(process.argv[3] ?? 1440);
const H = Number(process.argv[4] ?? 900);
const browser = await chromium.launch({ channel: "msedge", headless: true });
const ctx = await browser.newContext({ viewport: { width: W, height: H }, hasTouch: W < 700, isMobile: W < 700 });
const page = await ctx.newPage();
const logs = [];
page.on("console", (m) => ["error", "warning"].includes(m.type()) && logs.push(`[${m.type()}] ${m.text()}`));
page.on("pageerror", (e) => logs.push(`[pageerror] ${e.message}`));
page.on("response", (r) => r.status() >= 400 && logs.push(`[http ${r.status()}] ${r.url()}`));
const shot = async (name) => page.screenshot({ path: `${OUT}-${name}.png` });

await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
await page.waitForTimeout(800);
await page.getByRole("button", { name: "Continue as Demo Trader" }).click();
await page.waitForURL("**/dashboard", { timeout: 15000 });
await page.waitForTimeout(450);
await shot("1-boot");
await page.waitForTimeout(2600);
await shot("2-overview");
await page.evaluate(() => window.scrollTo(0, 620));
await page.waitForTimeout(1500);
await shot("3-overview-mid");

// Demo controls: win trade
await page.evaluate(() => window.scrollTo(0, 0));
await page.getByRole("button", { name: "Demo Controls" }).click();
await page.waitForTimeout(600);
await shot("4-controls");
await page.getByRole("button", { name: /Winning trade/ }).click();
await page.waitForTimeout(1200);
await shot("5-after-win");
// Push toward limit twice
await page.getByRole("button", { name: /Push to daily limit/ }).click();
await page.waitForTimeout(1600);
await page.evaluate(() => window.scrollTo(0, 620));
await page.waitForTimeout(1200);
await shot("6-push1");
await page.getByRole("button", { name: /Push to daily limit/ }).click();
await page.waitForTimeout(1600);
await shot("7-push2");
await page.getByRole("button", { name: /Trigger breach/ }).click();
await page.waitForTimeout(900);
await shot("8-breach");
console.log(logs.length ? [...new Set(logs)].join("\n") : "no console errors");
await browser.close();
