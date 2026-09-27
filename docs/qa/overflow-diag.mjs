// Finds elements that stick out past the viewport and are NOT clipped by an ancestor.
import { chromium } from "playwright-core";

const [W, ...paths] = process.argv.slice(2);
const browser = await chromium.launch({ channel: "msedge", headless: true });
const ctx = await browser.newContext({ viewport: { width: Number(W), height: 812 }, hasTouch: true, isMobile: true });
const page = await ctx.newPage();
for (const p of paths) {
  if (p === "@login") {
    await page.goto("http://localhost:3000/login", { waitUntil: "networkidle" });
    await page.getByRole("button", { name: "Continue as Demo Trader" }).click();
    await page.waitForURL("**/dashboard");
    await page.waitForTimeout(2500);
    continue;
  }
  await page.goto(`http://localhost:3000${p}`, { waitUntil: "networkidle" });
  await page.waitForTimeout(1800);
  // scroll through so lazy/in-view content renders
  const total = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < total; y += 600) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(120);
  }
  const res = await page.evaluate(() => {
    const vw = document.documentElement.clientWidth;
    const clipped = (el) => {
      for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
        const cs = getComputedStyle(a);
        if (["hidden", "clip", "auto", "scroll"].includes(cs.overflowX) || cs.position === "fixed") return true;
      }
      return false;
    };
    const out = [];
    for (const el of document.querySelectorAll("body *")) {
      const cs = getComputedStyle(el);
      if (cs.position === "fixed" || cs.display === "none") continue;
      const r = el.getBoundingClientRect();
      if (r.width === 0) continue;
      if (r.right > vw + 0.5 || r.left < -0.5) {
        if (!clipped(el)) out.push({ tag: el.tagName.toLowerCase(), left: Math.round(r.left), right: Math.round(r.right), w: Math.round(r.width), cls: (el.getAttribute("class") ?? "").slice(0, 110), text: (el.textContent ?? "").trim().slice(0, 40) });
      }
    }
    return { scroll: document.documentElement.scrollWidth - vw, items: out.slice(0, 8) };
  });
  console.log(`\n=== ${p} (scrollWidth excess ${res.scroll}px)`);
  for (const i of res.items) console.log(JSON.stringify(i));
}
await browser.close();
