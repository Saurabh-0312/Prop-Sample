// Full demo-script walk (README §"3–4 minute demo script") + extra paths. node qa-final.mjs <outPrefix>
import { chromium } from "playwright-core";

const OUT = process.argv[2];
const BASE = "http://localhost:3000";
const browser = await chromium.launch({ channel: "msedge", headless: true });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await ctx.newPage();
const logs = [];
const checks = [];
page.on("console", (m) => ["error", "warning"].includes(m.type()) && logs.push(`[${m.type()}] ${m.text()}`));
page.on("pageerror", (e) => logs.push(`[pageerror] ${e.message}`));
page.on("response", (r) => r.status() >= 400 && logs.push(`[http ${r.status()}] ${r.url()}`));
let n = 0;
const shot = async (name) => page.screenshot({ path: `${OUT}-${String(++n).padStart(2, "0")}-${name}.png` });
const ok = (cond, label) => checks.push(`${cond ? "PASS" : "FAIL"} ${label}`);
const step = async (label, fn) => {
  try {
    await fn();
  } catch (e) {
    checks.push(`FAIL ${label}: ${e.message.split("\n")[0]}`);
    await shot(`FAIL-${label}`);
  }
};
const store = () => page.evaluate(() => JSON.parse(localStorage.getItem("novaedge-demo-v1") ?? "{}").state ?? {});
const openControls = async () => {
  if (!(await page.getByRole("dialog", { name: "Demo controls" }).count())) await page.getByRole("button", { name: "Demo Controls" }).click();
  await page.waitForTimeout(450);
};
const bodyText = () => page.evaluate(() => document.body.innerText);

await step("home", async () => {
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.mouse.move(1100, 400);
  await page.waitForTimeout(1800);
  await shot("home");
  // selector: 1-Step + $200K → price should be 1-Step $200K promo price ($879)
  await page.locator("#challenges").scrollIntoViewIfNeeded();
  await page.waitForTimeout(700);
  await page.locator("#challenges").getByRole("tab", { name: "1-Step" }).click();
  await page.locator("#challenges").getByRole("radio", { name: /\$200K/ }).click();
  await page.waitForTimeout(1400);
  ok((await page.locator("#challenges").innerText()).includes("$1,099"), "selector shows 1-Step $200K compare-at $1,099");
  await shot("selector-1step-200k");
  // footer legal modal
  await page.getByRole("button", { name: "Risk Disclosure" }).click();
  await page.waitForTimeout(600);
  ok(await page.getByRole("dialog").filter({ hasText: "Simulated accounts" }).count(), "risk disclosure modal opens");
  await page.keyboard.press("Escape");
  await page.waitForTimeout(400);
});

await step("challenges", async () => {
  await page.goto(`${BASE}/challenges`, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  const before = await page.locator("table").innerText();
  await page.getByRole("switch", { name: "No Min Trading Days" }).click();
  await page.waitForTimeout(1200);
  const after = await page.locator("table").innerText();
  ok(before !== after && after.includes("None"), "add-on toggle changes table (min days → None, prices)");
  await page.getByRole("tab", { name: /Instant/ }).click();
  await page.waitForTimeout(900);
  ok((await page.locator("table").innerText()).includes("Not refundable"), "model tab switches table to Instant");
});

await step("checkout-crypto", async () => {
  await page.goto(`${BASE}/checkout?model=instant&size=25000`, { waitUntil: "networkidle" });
  await page.waitForTimeout(900);
  await page.fill("#co-name", "Priya Shah");
  await page.fill("#co-email", "priya.shah@example.com");
  await page.selectOption("#co-country", "IN");
  await page.getByRole("button", { name: /Crypto/ }).click();
  await page.waitForTimeout(400);
  await page.fill("#co-coupon", "demo50");
  await page.getByRole("button", { name: "Apply" }).click();
  await page.locator("label[for=co-terms]").click();
  await page.waitForTimeout(500);
  await shot("checkout-crypto");
  await page.getByRole("button", { name: /^Pay / }).click();
  await page.waitForTimeout(3600);
  ok((await bodyText()).includes("Your funded account is ready"), "instant purchase → funded account ready");
  await shot("checkout-success");
  await page.getByRole("button", { name: "Go to Dashboard" }).click();
  await page.waitForURL("**/dashboard");
  await page.waitForTimeout(3200);
  const s = await store();
  ok(s.accounts?.some((a) => a.login === "8812345" && a.model === "instant"), "store has new Instant account 8812345");
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(2200);
  ok((await bodyText()).includes("#8812345"), "new account persists after reload");
});

await step("controls", async () => {
  await openControls();
  await page.selectOption("#demo-target", "acc-100k");
  const t0 = (await store()).accounts.find((a) => a.id === "acc-100k").trades.length;
  await page.getByRole("button", { name: /Winning trade/ }).click();
  await page.waitForTimeout(700);
  await page.getByRole("button", { name: /Losing trade/ }).click();
  await page.waitForTimeout(700);
  const t1 = (await store()).accounts.find((a) => a.id === "acc-100k").trades.length;
  ok(t1 === t0 + 2, "win + loss add two trades");
  await page.getByRole("button", { name: /Push to daily limit/ }).click();
  await page.waitForTimeout(600);
  await page.getByRole("button", { name: /Push to daily limit/ }).click();
  await page.waitForTimeout(900);
  await shot("pushed");
  await page.getByRole("button", { name: /Trigger breach/ }).click();
  await page.waitForTimeout(1200);
  ok((await bodyText()).includes("Daily Loss Limit Exceeded"), "breach modal shows");
  ok((await store()).accounts.find((a) => a.id === "acc-100k").state.status === "breached", "account status breached");
  await page.getByRole("button", { name: /Reset Account/ }).click();
  await page.waitForTimeout(1900);
  const acc = (await store()).accounts.find((a) => a.id === "acc-100k");
  ok(acc.state.status === "active" && acc.state.balance === 100000, "reset restores a fresh active $100K");
  await openControls();
  await page.getByRole("button", { name: /Pass phase/ }).click();
  await page.waitForTimeout(1500);
  ok((await bodyText()).includes("Phase 1 Passed"), "pass modal shows");
  await shot("passed");
  await page.getByRole("button", { name: "View certificate" }).click();
  await page.waitForURL("**/dashboard/certificates");
  await page.waitForTimeout(1500);
  ok((await bodyText()).includes("Phase 1 Passed"), "certificate for the pass exists");
});

await step("notifications", async () => {
  await page.getByRole("button", { name: /Notifications/ }).click();
  await page.waitForTimeout(500);
  await shot("notifications");
  await page.getByRole("button", { name: /Reward available/ }).click();
  await page.waitForURL("**/dashboard/payouts");
  await page.waitForTimeout(1200);
  ok(true, "notification navigates to payouts");
});

await step("payout", async () => {
  await page.getByRole("button", { name: "Request Payout" }).click();
  await page.waitForTimeout(500);
  // validation: empty wallet → error
  await page.getByRole("button", { name: /^Request \$/ }).click();
  await page.waitForTimeout(300);
  ok((await bodyText()).includes("Enter your TRC20 wallet address"), "payout form validates destination");
  await page.getByRole("button", { name: "Use saved" }).click();
  await page.getByRole("button", { name: /^Request \$/ }).click();
  await page.waitForTimeout(7200);
  const p = (await store()).payouts[0];
  ok(p.stage === "paid" && p.finalized, "payout reaches Paid");
  await shot("payout-paid");
});

await step("admin", async () => {
  await page.goto(`${BASE}/admin`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.locator("#payouts").scrollIntoViewIfNeeded();
  await page.getByRole("button", { name: "Approve" }).first().click();
  await page.waitForTimeout(600);
  const d = (await store()).adminDecisions;
  ok(Object.values(d).includes("approved"), "admin approve persisted");
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.locator("#payouts").scrollIntoViewIfNeeded();
  ok((await page.locator("#payouts").innerText()).includes("Approved"), "admin decision survives reload");
});

await step("logout-reset", async () => {
  await page.goto(`${BASE}/dashboard`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  await page.getByRole("button", { name: "Account menu" }).click();
  await page.getByRole("button", { name: "Log out" }).click();
  await page.waitForURL(/\/login/);
  ok(true, "logout → /login");
  await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await openControls();
  await page.getByRole("button", { name: /Reset Demo/ }).click();
  await page.getByRole("button", { name: /Click again to reset/ }).click();
  await page.waitForTimeout(700);
  const s = await store();
  ok(s.accounts?.length === 3 && s.payouts?.length === 2 && Object.keys(s.adminDecisions ?? {}).length === 0, "Reset Demo restores seeded data");
  // protected route redirects when logged out
  await page.goto(`${BASE}/dashboard/payouts`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1500);
  ok(page.url().includes("/login?next="), "dashboard requires a session (redirects to login)");
});

console.log(checks.join("\n"));
console.log(logs.length ? [...new Set(logs)].join("\n") : "no console errors");
await browser.close();
