// Responsive sweep: node qa-responsive.mjs <outPrefix> <width> <height>
import { chromium } from "playwright-core";

const [OUT, w, h] = process.argv.slice(2);
const W = Number(w);
const H = Number(h);
const BASE = "http://localhost:3000";
const browser = await chromium.launch({ channel: "msedge", headless: true });
const ctx = await browser.newContext({ viewport: { width: W, height: H }, hasTouch: W < 900, isMobile: W < 900, deviceScaleFactor: 1 });
const page = await ctx.newPage();
const logs = [];
page.on("console", (m) => ["error", "warning"].includes(m.type()) && logs.push(`[${m.type()}] ${m.text()}`));
page.on("pageerror", (e) => logs.push(`[pageerror] ${e.message}`));
page.on("response", (r) => r.status() >= 400 && logs.push(`[http ${r.status()}] ${r.url()}`));
let n = 0;
const shot = async (name) => page.screenshot({ path: `${OUT}-${String(++n).padStart(2, "0")}-${name}.png` });
const overflow = async (where) => {
  const o = await page.evaluate(() => {
    const d = document.documentElement.scrollWidth - document.documentElement.clientWidth;
    if (d <= 0) return null;
    // find the widest offender
    let worst = null;
    for (const el of document.querySelectorAll("body *")) {
      const r = el.getBoundingClientRect();
      if (r.right > window.innerWidth + 1 && r.width > 0) {
        const cs = getComputedStyle(el);
        if (cs.position === "fixed") continue;
        if (!worst || r.right > worst.right) worst = { right: Math.round(r.right), tag: el.tagName, cls: (el.className?.toString?.() ?? "").slice(0, 90) };
      }
    }
    return { d, worst };
  });
  if (o) logs.push(`[overflow] ${where}: ${o.d}px — ${JSON.stringify(o.worst)}`);
};
const scrollShots = async (name, stops) => {
  for (const y of stops) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(900);
    await shot(`${name}-${y}`);
  }
};
const step = async (label, fn) => {
  try {
    await fn();
  } catch (e) {
    logs.push(`[STEP FAILED] ${label}: ${e.message.split("\n")[0]}`);
    await shot(`FAIL-${label}`);
  }
};

await step("home", async () => {
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2200);
  await overflow("home");
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  const stops = [];
  for (let y = 0; y < total; y += Math.round(H * 0.95)) stops.push(y);
  await scrollShots("home", stops);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(400);
  if (W < 1024) {
    await page.getByRole("button", { name: "Open menu" }).click();
    await page.waitForTimeout(700);
    await shot("home-menu");
    await page.getByRole("button", { name: "Close menu" }).click();
  }
});

await step("challenges", async () => {
  await page.goto(`${BASE}/challenges`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await overflow("challenges");
  await scrollShots("challenges", [0, H, H * 2]);
  // horizontal scroll inside the table card
  await page.evaluate(() => {
    const sc = [...document.querySelectorAll("div")].find((d) => d.scrollWidth > d.clientWidth + 20 && getComputedStyle(d).overflowX === "auto");
    if (sc) sc.scrollLeft = 260;
  });
  await page.waitForTimeout(500);
  await shot("challenges-table-scrolled");
});

await step("checkout", async () => {
  await page.goto(`${BASE}/checkout?model=one-step&size=50000`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await overflow("checkout");
  await scrollShots("checkout", [0, H, H * 2, H * 3]);
});

await step("login", async () => {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1000);
  await overflow("login");
  await shot("login");
  await page.getByRole("button", { name: "Continue as Demo Trader" }).click();
  await page.waitForURL("**/dashboard", { timeout: 15000 });
  await page.waitForTimeout(3000);
});

await step("dashboard", async () => {
  await overflow("dashboard");
  await scrollShots("dash", [0, H, H * 2, H * 3]);
  if (W < 1024) {
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.getByRole("button", { name: "Open navigation" }).click();
    await page.waitForTimeout(700);
    await shot("dash-drawer");
    await page.getByRole("button", { name: "Close navigation" }).click();
    await page.waitForTimeout(400);
  }
  await page.getByRole("button", { name: "Demo Controls" }).click();
  await page.waitForTimeout(700);
  await shot("dash-controls");
  await page.keyboard.press("Escape");
});

await step("detail", async () => {
  await page.goto(`${BASE}/dashboard/accounts/acc-200k`, { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);
  await overflow("detail");
  await scrollShots("detail", [0, H, H * 2]);
});

await step("payouts", async () => {
  await page.goto(`${BASE}/dashboard/payouts`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await overflow("payouts");
  await scrollShots("payouts", [0, H]);
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.getByRole("button", { name: "Request Payout" }).click();
  await page.waitForTimeout(800);
  await shot("payout-modal");
});

await step("admin", async () => {
  await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
  await page.waitForTimeout(2200);
  await overflow("admin");
  await scrollShots("admin", [0, H, H * 2]);
});

for (const p of ["/dashboard/settings", "/dashboard/certificates", "/dashboard/leaderboard", "/leaderboard", "/signup"]) {
  await step(p, async () => {
    await page.goto(`${BASE}${p}`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1400);
    await overflow(p);
    await shot(p.replace(/\//g, "_"));
  });
}

console.log(logs.length ? [...new Set(logs)].join("\n") : "no console errors, no overflow");
await browser.close();
