// Flow 2: pass phase → payouts timeline → certificates → affiliate → settings (KYC, 2FA) → leaderboards → admin → theme → auth → 404
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
page.on("response", (r) => r.status() >= 400 && !r.url().includes("does-not-exist") && logs.push(`[http ${r.status()}] ${r.url()}`));
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
const openControls = async () => {
  const panel = page.getByRole("dialog", { name: "Demo controls" });
  if (!(await panel.count())) await page.getByRole("button", { name: "Demo Controls" }).click();
  await page.waitForTimeout(500);
};

await step("login", async () => {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await shot("login");
  await hOverflow("login");
  await page.getByRole("button", { name: "Continue as Demo Trader" }).click();
  await page.waitForURL("**/dashboard", { timeout: 15000 });
  await page.waitForTimeout(3000);
});

await step("pass", async () => {
  await openControls();
  await page.selectOption("#demo-target", "acc-100k");
  await page.waitForTimeout(300);
  await shot("controls-riskmonitor");
  await page.getByRole("button", { name: /Pass phase/ }).click();
  await page.waitForTimeout(1500);
  await shot("pass-modal");
  await page.getByRole("button", { name: /Open Phase 2 account/ }).click();
  await page.waitForTimeout(2500);
  await shot("phase2-detail");
});

await step("payouts", async () => {
  await page.goto(`${BASE}/dashboard/payouts`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1800);
  await shot("payouts");
  await hOverflow("payouts");
  await page.getByRole("button", { name: "Request Payout" }).click();
  await page.waitForTimeout(700);
  await page.getByRole("button", { name: "Use saved" }).click();
  await shot("payout-modal");
  await page.getByRole("button", { name: /^Request \$/ }).click();
  await page.waitForTimeout(1300);
  await page.evaluate(() => window.scrollTo(0, 380));
  await page.waitForTimeout(300);
  await shot("payout-timeline-1");
  await page.waitForTimeout(3000);
  await shot("payout-timeline-2");
  await page.waitForTimeout(3200);
  await shot("payout-paid");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(600);
  await shot("payout-after");
});

await step("certificates", async () => {
  await page.goto(`${BASE}/dashboard/certificates`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1800);
  await page.mouse.move(520, 380);
  await page.waitForTimeout(400);
  await shot("certificates");
  await hOverflow("certificates");
});

await step("affiliate", async () => {
  await page.goto(`${BASE}/dashboard/affiliate`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  await shot("affiliate");
  await page.evaluate(() => window.scrollTo(0, 700));
  await page.waitForTimeout(1200);
  await shot("affiliate-2");
  await hOverflow("affiliate");
});

await step("settings", async () => {
  await page.goto(`${BASE}/dashboard/settings`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await shot("settings");
  await hOverflow("settings");
  await page.getByRole("button", { name: "Start verification" }).click();
  await page.waitForTimeout(700);
  await shot("kyc-1");
  await page.getByRole("button", { name: "Upload document" }).click();
  await page.waitForTimeout(1500);
  await page.getByRole("button", { name: "Take selfie" }).click();
  await page.waitForTimeout(1500);
  await shot("kyc-3");
  await page.getByRole("button", { name: "Submit for review" }).click();
  await page.waitForTimeout(2300);
  await shot("kyc-done");
  await page.getByRole("button", { name: "Done" }).click();
  await page.waitForTimeout(600);
  await page.getByRole("switch", { name: "Two-factor authentication" }).click();
  await page.waitForTimeout(700);
  await shot("2fa-modal");
  await page.fill("#tfa-code", "123456");
  await page.getByRole("button", { name: "Enable 2FA" }).click();
  await page.waitForTimeout(900);
  await shot("settings-after");
});

await step("dash-leaderboard", async () => {
  await page.goto(`${BASE}/dashboard/leaderboard`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1800);
  await shot("dash-leaderboard");
  await page.getByRole("tab", { name: "All Time" }).click();
  await page.waitForTimeout(1500);
  await shot("dash-leaderboard-all");
});

await step("accounts-after-kyc", async () => {
  await page.goto(`${BASE}/dashboard/accounts`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await shot("accounts-after-kyc");
});

await step("admin", async () => {
  await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  await shot("admin");
  await hOverflow("admin");
  await page.locator("#risk").scrollIntoViewIfNeeded();
  await page.waitForTimeout(2500);
  await shot("admin-risk");
  await page.getByRole("button", { name: "View" }).first().click();
  await page.waitForTimeout(700);
  await shot("admin-risk-view");
  await page.getByRole("button", { name: "Disable trading" }).click();
  await page.waitForTimeout(500);
  await page.keyboard.press("Escape");
  await page.waitForTimeout(500);
  await page.locator("#payouts").scrollIntoViewIfNeeded();
  await page.waitForTimeout(600);
  await page.getByRole("button", { name: "Approve" }).first().click();
  await page.waitForTimeout(400);
  await page.getByRole("button", { name: "Reject" }).nth(1).click();
  await page.waitForTimeout(900);
  await shot("admin-queue");
  await page.locator("#builder").scrollIntoViewIfNeeded();
  await page.waitForTimeout(800);
  await page.fill("#cb-dl", "50");
  await page.fill("#cb-price-100000", "449");
  await page.waitForTimeout(600);
  await shot("admin-builder");
});

await step("theme", async () => {
  await openControls();
  await page.getByRole("button", { name: /Gold Luxe/ }).click();
  await page.waitForTimeout(900);
  await page.keyboard.press("Escape");
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(800);
  await shot("theme-gold-admin");
  await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2500);
  await shot("theme-gold-dashboard");
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2200);
  await shot("theme-gold-home");
  await openControls();
  await page.getByRole("button", { name: /Electric Blue/ }).click();
  await page.waitForTimeout(900);
  await page.keyboard.press("Escape");
  await page.locator("#challenges").scrollIntoViewIfNeeded();
  await page.waitForTimeout(1500);
  await shot("theme-electric-selector");
  await page.evaluate(() => window.scrollTo(0, 3400));
  await page.waitForTimeout(2200);
  await shot("theme-electric-globe");
  await openControls();
  await page.getByRole("button", { name: /Neon Terminal/ }).click();
  await page.waitForTimeout(600);
});

await step("public-leaderboard", async () => {
  await page.goto(`${BASE}/leaderboard`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2000);
  await shot("leaderboard");
  await hOverflow("leaderboard");
});

await step("signup", async () => {
  await page.goto(`${BASE}/signup`, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  await page.fill("#su-password", "trade1");
  await page.getByRole("button", { name: "Create account" }).click();
  await page.waitForTimeout(700);
  await shot("signup");
  await hOverflow("signup");
});

await step("404", async () => {
  await page.goto(`${BASE}/does-not-exist`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1200);
  await shot("404");
});

console.log(logs.length ? [...new Set(logs)].join("\n") : "no console errors");
await browser.close();
