# NovaEdge Capital — prop firm demo

A clickable sales demo of a prop trading firm platform. It has a marketing site, a challenge comparison page, checkout, a trader dashboard with a live rules engine, and an admin back-office preview.

Everything runs in the browser. There is no backend, no environment variables and no real payments. The data is seeded mock data kept in `localStorage`, so a purchase made in checkout shows up in the dashboard, and your progress survives a refresh.

> **Demo preview · simulated data.** All accounts, prices, traders and payouts are fictional.

---

## Run it

```bash
npm install
npm run dev              # http://localhost:3000
```

Production build (this is what Vercel runs):

```bash
npm run build
npm start
npm run lint             # ESLint — next build no longer lints in Next.js 16
```

Requirements: Node.js 20.9+.

## Deploy to Vercel

**Option 1:**
1. Push the folder to a GitHub repository.
2. In Vercel, click **Add New → Project**, import the repo, then click **Deploy**.

There is nothing to configure: no env vars and no build settings.

**Option 2:** run `npx vercel --prod` from this folder and accept the defaults.

## Demo access

| What | How |
|---|---|
| Log in | Any email and password, or the one-click **Continue as Demo Trader** button (Alex Morgan) |
| Coupon | **`DEMO50`** gives 50% off at checkout. Any other code shows the error state. |
| Card | Click **Use test card** in checkout (4242 4242 4242 4242, 12/29, 123) |
| Payout wallet | Click **Use saved** in the payout modal to fill a valid USDT/USDC/IBAN/Rise destination |
| Reset | **Demo Controls → Reset Demo** (click twice) restores the seeded data |

**Seeded accounts:**
- **#8812301**: $100K 2-Step, Phase 1, active, 62% to target.
- **#8812287**: $50K 1-Step, passed.
- **#8812199**: $200K funded, $6,420 profit × 90% = **$5,778** available.

The first checkout purchase gets login **8812345**.

## Demo Controls

Open **Demo Controls** from the floating button in the bottom-right corner (shortcut: **Shift + D**). Every action goes through the rules engine (`src/lib/rules.ts → evaluate()`), so the gauges, modals and account statuses always agree.

| Control | Effect |
|---|---|
| Target account | The account the actions apply to. A live risk readout shows daily and max loss usage. |
| Winning / Losing trade | Closes a +$1.2K–$2.5K or −$0.8K–$1.8K trade (scaled to account size), with a toast and a number flash |
| Push to daily limit | Floating loss moves the daily-loss gauge to gold (~75%), then red (~92%) |
| Trigger breach | Daily loss breach. Shows the breach modal (glitch, vignette, evidence) with **Reset (−20%)** and **Buy New Challenge** |
| Pass phase | Profit target and minimum days met. Pass modal with confetti; the Phase 2 or funded account is created. |
| Theme | Neon Terminal, Electric Blue or Gold Luxe, applied live. Charts, gauges, the globe and candles all recolour. |

Inside the dashboard, **Ctrl + K** (**⌘K** on Mac) opens a command palette for pages, demo actions, account switching and themes.

## 3–4 minute demo script

1. **Home.** Let the hero play: headline blur-in, scrambling keyword, tilt dashboard mockup (move the mouse), live ticker. Scroll through the stats count-up and the How-it-works timeline.
2. **Challenge Selector** (home). Switch **2-Step / 1-Step / Instant** and the sizes (prices roll). Toggle **% / $**, hover an ⓘ. Point out the "Most popular" border beam on $100K 2-Step.
3. **Globe.** Scroll to *Traders in 150+ countries*: the live reward feed draws arcs on the globe. Then the payout wall.
4. **Challenges page.** Click **Compare all plans →**.
   1. Switch model tabs.
   2. Turn on the **90% Reward Share** add-on (every price re-rolls).
   3. Open **Compare models**.
   4. Scroll to show the sticky header.
5. **Checkout.** Click **Start** on $100K.
   1. Fill in the name, email and country, and click **Use test card**.
   2. Enter `DEMO50` (it glows).
   3. Tick the terms and click **Pay**.
   4. The processing steps run, then the success screen appears with confetti and credentials (login 8812345).
6. **Go to Dashboard.** The terminal boot sequence plays, then the new account appears, selected.
7. **Demo Controls** on the $100K Phase 1 (#8812301):
   1. **Winning trade**.
   2. **Push to daily limit** twice (gauge goes gold, then red).
   3. **Trigger breach**, then **Reset Account (−20%)**.
   4. **Pass phase** (confetti, Phase 2 created).
   5. Switch the theme to **Gold Luxe** and back.
8. **Account detail.** Open **Account details**:
   - The candles build up and the last candle ticks.
   - Switch **M5 / H1**.
   - Hover the P/L calendar.
   - Filter the trade history to **Wins** and change page.
9. **Payouts.**
   1. Show $6,420 × 90% = **$5,778**.
   2. Click **Request Payout**, then **Use saved**, then **Request**.
   3. The timeline runs Requested → Under Review → Approved → **Paid ✓**, with confetti. A new certificate appears in **Certificates**.
10. **Admin preview** (user menu → Admin preview):
    - The KPIs roll up.
    - The risk console updates live; open **View** to see the fraud flags.
    - **Approve / Reject** payouts.
    - Edit the **Challenge builder** and watch the preview card update.

Tip: run **Reset Demo** before each presentation.

## Rebrand in minutes

- **`src/config/brand.ts`:**
  - Name, tagline, support email, social handles.
  - Headline stats, promo (label, percent, models), coupon code.
  - **Colour palettes.** The CSS variables are generated from this file.
- **`src/data/plans.ts`:** prices per model and size, rules (targets, daily and max loss, trailing/static, min days), reward share, payout frequency, add-ons and rule tooltips.
- **Logo:** `LogoMark` in `src/components/ui/Logo.tsx` (it uses the live palette) and `src/app/icon.svg` (favicon).

**Add or change a theme:** add an entry to `palettes` (three accent colours) and its id to `paletteOrder` in `brand.ts`. It appears in Demo Controls and the command palette automatically. The base colours and the profit/loss colours stay fixed on purpose.

## What's inside

| Area | Routes |
|---|---|
| Marketing | `/` (14 sections), `/challenges` (full comparison), `/leaderboard` |
| Purchase | `/checkout?model=two-step&size=100000` → success |
| Auth | `/login`, `/signup` |
| Trader dashboard | `/dashboard` (overview), `/dashboard/accounts`, `/dashboard/accounts/[id]`, `/dashboard/payouts`, `/dashboard/certificates`, `/dashboard/affiliate`, `/dashboard/leaderboard`, `/dashboard/settings` (profile, 2FA, KYC) |
| Back office | `/admin` (KPIs, revenue, risk console, payout queue, challenge builder) |

```
src/config/brand.ts         brand + palettes (single source of truth)
src/data/                   plans, seeded accounts/trades (seeded PRNG), leaderboard, payouts, admin, globe, faq …
src/lib/rules.ts            pure rules engine: evaluate(), floors, objectives
src/lib/store.ts            zustand + persist: accounts, trades, payouts, events, settings
src/components/fx/          aurora, grid beams, border beam, spotlight, tilt, scramble, rolling numbers,
                            marquee, WebGL globe, magnetic button, boot sequence, radial gauge, confetti
src/components/ui/          buttons, badges, modal, tabs, tooltip, toasts, fields, switches …
src/components/{marketing,challenges,checkout,auth,dashboard,admin,leaderboard}/
docs/                       brief, blueprint, design research, QA scripts
```

**Tech stack:**
- Next.js 16 (App Router, Turbopack) and TypeScript.
- Tailwind CSS v4 with CSS-variable tokens.
- motion, cobe (globe), lightweight-charts (candles), recharts, zustand, canvas-confetti, NumberFlow and lucide-react.
- Geist and JetBrains Mono through `next/font`.

## Notes and limitations

- **Frontend only:** no backend, database, real auth, payments or KYC. Every flow is simulated with realistic timing.
- **Browser storage:** state lives in `localStorage` and is per browser. Use **Reset Demo** to start fresh.
- **Accessibility and motion:** the site respects `prefers-reduced-motion`. Parallax-free by design; Lenis smooth scrolling was left out to keep scrolling native and reliable.
- **Chart attribution:** the TradingView logo on the candlestick chart is the attribution that lightweight-charts' license requires.
- **Market data:** prices, traders and statistics are fictional. Platform names appear as text badges only.
