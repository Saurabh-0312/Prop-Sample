// Flow 1: challenges → checkout (validation, DEMO50, pay) → success → dashboard → accounts → account detail
import { chromium } from "playwright-core";

const OUT = process.argv[2];
const W = Number(process.argv[3] ?? 1440);
const H = Number(process.argv[4] ?? 900);
const BASE = "http://localhost:3000";
const browser = await chromium.launch({ channel: "msedge", headless: true });
const ctx = await browser.newContext({ viewport: { width: W, height: H }, hasTouch: W < 700, isMobile: W < 700 });
const page = await ctx.newPage();
const logs = [];
page.on("console", (m) => ["error", "warning"].includes(m.type()) && logs.push(`[${m.type()}] ${m.text()}`));
page.on("pageerror", (e) => logs.push(`[pageerror] ${e.message}`));
page.on("response", (r) => r.status() >= 400 && logs.push(`[http ${r.status()}] ${r.url()}`));
let n = 0;
const shot = async (name) => page.screenshot({ path: `${OUT}-${String(++n).padStart(2, "0")}-${name}.png` });
const step = async (label, fn) => {
  try {
    await fn();
  } catch (e) {
    logs.push(`[STEP FAILED] ${label}: ${e.message.split("\n")[0]}`);
    await shot(`FAIL-${label}`);
  }
};
const hOverflow = async (where) => {
  const o = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  if (o > 0) logs.push(`[overflow] ${where}: ${o}px`);
};

await step("challenges", async () => {
  await page.goto(`${BASE}/challenges`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await shot("challenges-top");
  await hOverflow("challenges");
  await page.evaluate(() => window.scrollTo(0, 620));
  await page.waitForTimeout(900);
  await shot("challenges-table");
  // add-on toggle
  await page.getByRole("switch", { name: "90% Reward Share" }).first().click();
  await page.waitForTimeout(900);
  await shot("challenges-addon");
  // tooltip
  await page.getByRole("button", { name: "What is Daily Loss Limit?" }).first().hover();
  await page.waitForTimeout(500);
  await shot("challenges-tooltip");
  // compare models view
  await page.getByRole("tab", { name: /Compare models/ }).click();
  await page.waitForTimeout(900);
  await shot("challenges-compare");
  // scroll to sticky header check
  await page.evaluate(() => window.scrollTo(0, 1100));
  await page.waitForTimeout(700);
  await shot("challenges-sticky");
});

await step("checkout", async () => {
  await page.goto(`${BASE}/checkout?model=two-step&size=100000`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await shot("checkout");
  await hOverflow("checkout");
  // pay empty → errors
  await page.getByRole("button", { name: /^Pay / }).click();
  await page.waitForTimeout(900);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(300);
  await shot("checkout-errors");
  await page.fill("#co-name", "Jordan Blake");
  await page.fill("#co-email", "jordan.blake@example.com");
  await page.selectOption("#co-country", "AE");
  await page.getByRole("button", { name: "Use test card" }).click();
  // wrong coupon then DEMO50
  await page.fill("#co-coupon", "WRONG10");
  await page.getByRole("button", { name: "Apply" }).click();
  await page.waitForTimeout(200);
  await shot("checkout-coupon-error");
  await page.fill("#co-coupon", "DEMO50");
  await page.getByRole("button", { name: "Apply" }).click();
  await page.waitForTimeout(900);
  await page.getByRole("switch", { name: "Bi-weekly Payouts" }).click();
  await page.locator("label[for=co-terms]").click();
  await page.waitForTimeout(700);
  await shot("checkout-ready");
  await page.getByRole("button", { name: /^Pay / }).click();
  await page.waitForTimeout(1100);
  await shot("checkout-processing");
  await page.waitForTimeout(2600);
  await shot("checkout-success");
  await page.waitForTimeout(1200);
  await page.getByRole("button", { name: /Show Password/ }).click();
  await page.waitForTimeout(300);
  await shot("checkout-success-pw");
});

await step("dashboard", async () => {
  await page.getByRole("button", { name: "Go to Dashboard" }).click();
  await page.waitForURL("**/dashboard", { timeout: 15000 });
  await page.waitForTimeout(3200);
  await shot("dashboard-new-account");
  await hOverflow("dashboard");
});

await step("accounts", async () => {
  await page.getByRole("link", { name: "Accounts" }).first().click();
  await page.waitForURL("**/dashboard/accounts", { timeout: 15000 });
  await page.waitForTimeout(1500);
  await shot("accounts");
  await page.evaluate(() => window.scrollTo(0, 99999));
  await page.waitForTimeout(700);
  await shot("accounts-orders");
});

await step("detail", async () => {
  await page.goto(`${BASE}/dashboard/accounts/acc-100k`, { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);
  await shot("detail-top");
  await hOverflow("detail");
  await page.getByRole("tab", { name: "H1" }).click();
  await page.waitForTimeout(1500);
  await shot("detail-h1");
  await page.evaluate(() => window.scrollTo(0, 700));
  await page.waitForTimeout(1200);
  await shot("detail-stats");
  await page.evaluate(() => window.scrollTo(0, 1250));
  await page.waitForTimeout(1200);
  // calendar tooltip
  const cell = page.locator('button[aria-label*=": +"], button[aria-label*=": −"]').first();
  if (await cell.count()) {
    await cell.hover();
    await page.waitForTimeout(500);
  }
  await shot("detail-calendar");
  await page.evaluate(() => window.scrollTo(0, 99999));
  await page.waitForTimeout(800);
  await page.getByRole("tab", { name: /Wins/ }).click();
  await page.waitForTimeout(600);
  await shot("detail-history-wins");
  await page.getByRole("button", { name: "Next page" }).click();
  await page.waitForTimeout(600);
  await shot("detail-history-p2");
});

console.log(logs.length ? [...new Set(logs)].join("\n") : "no console errors");
await browser.close();
