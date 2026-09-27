// Visits every route on the DEV server and reports React warnings (hydration mismatches etc.).
import { chromium } from "playwright-core";

const BASE = process.argv[2] ?? "http://localhost:3001";
const browser = await chromium.launch({ channel: "msedge", headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const logs = [];
let where = "";
page.on("console", (m) => {
  if (["error", "warning"].includes(m.type())) logs.push(`${where} [${m.type()}] ${m.text().slice(0, 400)}`);
});
page.on("pageerror", (e) => logs.push(`${where} [pageerror] ${e.message}`));

const visit = async (path, wait = 2500) => {
  where = path;
  await page.goto(`${BASE}${path}`, { waitUntil: "networkidle", timeout: 120000 });
  await page.waitForTimeout(wait);
  await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
  await page.waitForTimeout(800);
};

for (const p of ["/", "/challenges", "/leaderboard", "/checkout?model=instant&size=25000", "/login", "/signup", "/admin"]) await visit(p);
where = "/login→demo";
await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
await page.getByRole("button", { name: "Continue as Demo Trader" }).click();
await page.waitForURL("**/dashboard", { timeout: 60000 });
await page.waitForTimeout(3500);
for (const p of ["/dashboard", "/dashboard/accounts", "/dashboard/accounts/acc-100k", "/dashboard/payouts", "/dashboard/certificates", "/dashboard/affiliate", "/dashboard/leaderboard", "/dashboard/settings"]) await visit(p);

const interesting = logs.filter((l) => !/Download the React DevTools|\[HMR\]|Fast Refresh/.test(l));
console.log(interesting.length ? [...new Set(interesting)].join("\n") : "no React warnings or errors in dev");
await browser.close();
