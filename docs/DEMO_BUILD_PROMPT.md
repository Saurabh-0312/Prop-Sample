# Build a Clickable Prop Firm Demo Website (Next.js → Vercel)

You are a senior front-end engineer and an award-winning product designer who specializes in fintech and trading interfaces. Build a **visually stunning, high-tech, fully working demo** of a prop trading firm platform. I will show it to my client in **about 30 hours** and deploy it to **Vercel**.

This is a **sample / sales demo, NOT the complete software.** There's no real backend and the scope is limited to what this prompt lists. But **every feature that is in the sample must work properly**; it should not be a static mockup. Optimize for four things:

1. **Wow-factor UI.** Premium, futuristic, dark "trading terminal" look with the best possible color combination.
2. **High-tech animations** that make the site feel alive and expensive, while staying smooth and tasteful.
3. **A believable end-to-end flow** the client can click through.
4. **A few "live" interactions** that show how the real product will behave.

Everything behind the scenes is **mocked in the browser**. Do not ask clarifying questions; make sensible decisions and keep moving.

---

## ⚠️ Work standard: a focused sample, done properly (read this twice)

We have **about 30 hours** until the client demo.

- **This is a SAMPLE, not the complete software.** Do NOT build a real backend, real auth, real payments, or every feature from the blueprint. Build **only the pages and features listed in this prompt**, with mocked data in the browser. The blueprint is background knowledge, not a to-do list.
- **But what you do build must be finished and correct. No half-done work.** Every page and feature in scope must be fully finished and working: no "coming soon" sections, no placeholders, no lorem ipsum, no `TODO`s, no buttons that do nothing, nothing broken.
- **It must NOT feel like a static site.** The in-scope features need real, working interactions:
  - Data that carries between pages (e.g. a checkout purchase shows up in the dashboard)
  - Forms that validate
  - Tabs and filters that actually change the data
  - Live-updating numbers, modals, toasts and loading states
- **P0 is the demo. Make it polished first.** Add P1 items only after all of P0 is done and polished, and only if you can build them to the same quality. **A missing P1 page is fine; a broken or half-built one is not.**
- **Verify your own work.** After each milestone, run `npm run build`. Then run the dev server and click through the flows (use a browser or screenshot tool if you have one). Fix bugs, console errors and visual glitches before moving on.
- **Quality beats quantity.** A smaller sample that works flawlessly beats a bigger one that breaks during the live demo.

---

## 0. Fill-ins (use these values everywhere)

- **Brand name:** `NovaEdge Capital` ← *(replace with the client's brand if provided)*
- **Tagline:** "Trade our capital. Keep up to 90% of the profits."
- **Currency:** USD
- Keep all brand text, colors and plan data in **one config file** so it's easy to rebrand in minutes.

---

## 1. STEP 1: Research before you write any code

Do this first. **Time-box it to about 30–45 minutes (roughly 15–20 page fetches).** The build is the priority, so don't over-research.

### 1.1 Read the project blueprint

Read **`PROP_FIRM_BLUEPRINT.md`**. It's in this project folder, or at `E:\Prop\PROP_FIRM_BLUEPRINT.md`. It explains how prop firms work and what the real product will contain. Focus on:
- **§2** Business model
- **§3** Competitor research and the common website patterns
- **§4** Website flow, sitemap, trader dashboard features and admin features
- **§5** Rules engine (daily loss, max loss, profit target, trailing drawdown)
- **§16** Glossary

Use the correct terminology in the UI: "Phase 1", "Funded", "Daily Loss Limit", "Reward share", "simulated capital". The demo should look like it was built by people who know the industry. The backend sections (§8–§11) are for later, but skim them so the admin preview looks credible.

### 1.2 Visit real prop firm websites

Use web search and fetch. **If you have a browser or screenshot tool, use it to actually *see* the visuals.** Study at least 5 of these:

- https://ftmo.com
- https://fundednext.com
- https://the5ers.com
- https://fundingpips.com
- https://topstep.com
- https://e8markets.com
- https://fxify.com
- https://apextraderfunding.com

For each one, note:
- Homepage section order, hero message and CTA wording
- **How the challenge or plan selector works** (tabs, account sizes, how rules and prices are shown)
- Trust signals (total payouts, Trustpilot, payout proofs, certificates, trader counts)
- How they show dashboard previews
- Color palette, typography and the animations they use
- **What feels dated, cluttered or generic. These are our chances to stand out.**

### 1.3 Research modern high-tech UI/UX trends

Look at best-in-class fintech, crypto and SaaS interfaces for design and motion inspiration: TradingView, Linear, Vercel, Stripe, Raycast, and top crypto exchanges' landing pages. Also look at component galleries such as **Aceternity UI** and **Magic UI** for effect patterns (animated beams, border beams, spotlight cards, globes, number tickers, marquees) and Dribbble/Behance searches like "trading dashboard dark" and "fintech landing page".

**Do not copy any competitor's branding, text, logos or assets.** Take the patterns and make them better.

### 1.4 Write a short research summary, then build

Create **`docs/DESIGN_RESEARCH.md`** (1–2 pages max) with:
1. A table: competitor | what they do well | what's weak.
2. **Our design direction:**
   - The final color palette, validated against the rules in §4
   - Typography
   - Homepage section order
   - The 8–10 signature animations we'll implement (from §5)
3. 3–5 UX decisions taken from the research (e.g. "show rules directly on plan cards", "put payout proof above the fold").

Then **go straight into the build. Don't wait for my approval.**

---

## 2. Hard constraints

- **Frontend only.** No backend, no database, no real auth, no real payments, no API keys, **no environment variables**.
- All data comes from local mock files plus client-side state (Zustand with `persist` to localStorage), so a purchase made in checkout shows up in the dashboard.
- **Must pass `npm run build` with zero errors** (type errors and lint errors fail Vercel builds). Run the build yourself and fix everything before you finish.
- **Fully responsive.** The client may open it on a phone. The sidebar becomes a drawer on mobile, and tables scroll horizontally inside their cards (never the whole page).
- **No hydration errors.** Never call `Math.random()` or `Date.now()` during render. Use a **seeded PRNG** for mock data, and start live simulations inside `useEffect`.
- Use fictional people and data only. **Do not use real prop firm names or logos.** Platform names such as "MetaTrader 5", "cTrader" and "Match-Trader" may appear as **text badges only** (no logos).
- Show a small, tasteful **"Demo preview · simulated data"** pill in the navbar and dashboard header.
- No heavy images or videos. Build visuals with CSS, SVG, canvas and charts. Icons come from `lucide-react`.

---

## 3. Tech stack

- **Next.js (latest stable, App Router) + TypeScript**, `src/` directory, `@/*` import alias. Create it non-interactively, e.g.
  `npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm`
  - If create-next-app refuses because the folder isn't empty (e.g. the `.md` files are there), move those files aside first or scaffold in a temp folder and move the files in. Put the `.md` files in `docs/` afterwards.
- **Tailwind CSS.** Put the design tokens in `globals.css` as **CSS variables** so themes can be switched at runtime. Map them to Tailwind with `@theme` if v4 is installed, or in `tailwind.config` if v3.
- **framer-motion** (or its successor package `motion`, imported from `motion/react`) for all UI animation
- **cobe** for the lightweight interactive WebGL globe. Client-only; check the installed version's API.
- **lightweight-charts** (TradingView) for candlestick charts. Client-only: load it with `next/dynamic` and `ssr: false`. v5 uses `chart.addSeries(CandlestickSeries, options)`; v4 used `addCandlestickSeries`.
- **recharts** for area, bar and pie charts
- **zustand** for state (with `persist`)
- **canvas-confetti** for celebrations
- **Optional:** `@number-flow/react` for rolling-digit numbers, `lenis` for smooth scrolling. Use them only if they install and build cleanly.
- Fonts via `next/font/google`: **Inter** or **Geist** (UI; pick based on research) and **JetBrains Mono** (all numbers, prices and money)

Don't add anything else unless it's really needed.

---

## 4. Design system: "Futuristic trading terminal, premium fintech"

**Mood:** a Bloomberg/TradingView terminal meets a Linear/Vercel-grade landing page. Dark, glassy and luminous, with crisp monospace numbers and motion everywhere. **Dark mode only.**

### 4.1 Color rules (for the best color combination)

- **Base:** near-black with a blue tint, never pure `#000`.
- **60-30-10 rule:** 60% dark neutrals, 30% surfaces and text, 10% brand accent/gradient. The accent should feel precious, not everywhere.
- **Profit green and loss red are reserved** for P/L, pass and breach. Never use them decoratively. Always pair P/L with a **+/− sign and an up/down arrow**, so it reads correctly even when the brand color is also green.
- **Contrast:** all body text meets WCAG AA (≥ 4.5:1) against its background.
- **Glow, don't paint:** accents appear mainly as gradients, glows, borders, progress fills and highlights, not as large flat blocks.
- You may refine the default palette below based on your research, but keep these rules. Record the final palette in `docs/DESIGN_RESEARCH.md`.

### 4.2 Default palette: "Neon Terminal"

| Token | Value | Use |
|---|---|---|
| `--bg` | `#05070D` | Page background |
| `--bg-elevated` | `#0A0E17` | Sections, sidebar |
| `--surface` | `rgba(17, 24, 39, 0.6)` + `backdrop-blur-xl` | Glass cards |
| `--surface-solid` | `#0F1420` | Inputs, tables |
| `--border` | `rgba(255, 255, 255, 0.08)` | All borders (1px) |
| `--text` | `#E6EDF7` | Primary text |
| `--muted` | `#8A94A6` | Secondary text |
| `--accent-1` | `#00E5A0` (neon mint) | Brand accent, CTAs, active states |
| `--accent-2` | `#00B3FF` (electric cyan) | Gradient middle, links, info |
| `--accent-3` | `#7C5CFF` (violet) | Gradient end, secondary glow |
| `--profit` | `#00D395` | Positive P/L, pass (same in every theme) |
| `--loss` | `#FF4D5E` | Negative P/L, breach (same in every theme) |
| `--warning` | `#F5B942` | Near-limit states, premium badges |

- **Signature gradient:** `linear-gradient(135deg, var(--accent-1), var(--accent-2), var(--accent-3))`. Use it for primary buttons, gradient headline words, progress fills, active nav indicators and animated borders.

### 4.3 Live theme switcher (P0, a demo selling point)

Because every color is a CSS variable, add a **Theme** section to the Demo Controls panel (see §6) with 3 curated palettes. The client can pick their favorite live during the meeting. Only the accents change; the base and the profit/loss colors stay the same.

| Palette | `--accent-1` | `--accent-2` | `--accent-3` | Vibe |
|---|---|---|---|---|
| **Neon Terminal** (default) | `#00E5A0` | `#00B3FF` | `#7C5CFF` | Futuristic, energetic |
| **Electric Blue** | `#3D7BFF` | `#22D3EE` | `#A855F7` | Institutional, trustworthy |
| **Gold Luxe** | `#F2C14E` | `#FF8A3D` | `#FFE7A3` | Premium, exclusive |

Theme changes animate smoothly (transition on color variables, ~400ms) and persist in localStorage.

### 4.4 Typography

- Headlines: bold with tight tracking. The hero headline is 56–80px on desktop, with key words in animated gradient text.
- **All numbers use JetBrains Mono with `tabular-nums`**, so digits never jump.

### 4.5 Components

- **Glass cards:** 16px radius, 1px border, inner top highlight (`inset 0 1px 0 rgba(255,255,255,0.06)`). On hover: lift 2–4px plus a border glow.
- **Primary button:** gradient background, dark text (`#05070D`), soft accent glow shadow, and a shine sweep on hover.
- **Secondary button:** transparent glass with a border.
- **Inputs:** `--surface-solid` background with an accent focus ring that glows.
- **Badges:** pills for Phase 1, Phase 2, Funded, Passed and Breached, each with a tinted background and a matching dot.
- **Progress bars and gauges:** gradient fill with a threshold marker. When a limit is ≥70% used, the fill turns gold; at ≥90% it turns red.
- **"LIVE" indicator:** pulsing accent dot with an expanding ring.

---

## 5. Motion & high-tech animation system

The goal is for the client to say *"wow, this feels like the future of trading."* Every effect must be **purposeful, smooth (60fps) and tasteful**. Aim for one signature moment per section, not chaos.

### 5.1 Motion principles

- **Easing:** `cubic-bezier(0.22, 1, 0.36, 1)` (expo-out) for entrances. Springs for interactive elements.
- **Durations:** 150–250ms for micro-interactions, 400–700ms for reveals, with 60–90ms stagger between children.
- **Performance:** animate only `transform`, `opacity` and `filter`. Pause off-screen animations with `useInView` or IntersectionObserver. Allow at most one heavy canvas/WebGL element per viewport.
- **Accessibility:** respect `prefers-reduced-motion`. When it's on, disable parallax, tilt and marquees, and slow the globe.
- **Mobile:** disable cursor-based effects (spotlight, tilt, magnetic buttons) on touch devices, and reduce particle and beam counts.
- **Content first:** text must always be readable. Never hide important content behind an animation that might not fire.

### 5.2 Signature effects

Implement all of the **P0** effects. Add **P1** effects if time allows.

| # | Effect | Where | Priority |
|---|---|---|---|
| 1 | **Aurora background:** slow-moving blurred gradient blobs in the accent colors, plus a **48px grid** with a radial fade, plus **light beams** that travel along the grid lines | Hero and global background | P0 |
| 2 | **Headline reveal:** words blur-in and rise one by one. A **rotating keyword with a "decrypt/scramble" effect** cycles through Forex → Gold → Indices → Crypto. | Hero | P0 |
| 3 | **Floating 3D dashboard mockup:** a glass card with perspective tilt that follows the mouse. Inside, an **equity line draws itself** on load, and a live P/L number ticks. | Hero (right side) | P0 |
| 4 | **Border beam:** a rotating conic-gradient light travels around the border | "Most popular" plan card and the main CTA | P0 |
| 5 | **Spotlight cards:** a radial glow follows the cursor across glass cards | Feature cards, plan cards, dashboard KPIs | P0 |
| 6 | **Rolling-digit numbers:** odometer-style count-up on first view; prices and P/L roll smoothly when they change | Stats band, prices, dashboard | P0 |
| 7 | **Infinite marquees** with edge fade masks | Ticker tape and payout wall | P0 |
| 8 | **Interactive globe (cobe):** rotating dotted globe with pulsing markers in trader countries. A small live feed pops toasts beside it: "$4,210 reward sent to 🇦🇪 Dubai · just now". | "Global community" section | P0 |
| 9 | **Scroll-linked timeline:** a gradient line fills as the user scrolls, and each step lights up and scales in | "How it works" | P0 |
| 10 | **Challenge selector motion:** the active tab or size pill slides with a shared `layoutId`. Rule values cross-fade. The price rolls to its new value. | Challenge selector | P0 |
| 11 | **Magnetic buttons + shine sweep** | Primary CTAs | P0 |
| 12 | **Page transitions:** fade and slide between routes (using `template.tsx`) | All routes | P0 |
| 13 | **Terminal boot sequence:** ~1.2s the first time the dashboard opens in a session. Monospace lines type out: "Connecting to NovaEdge-Demo server… ✓", "Syncing equity… ✓", "Loading risk engine… ✓". Then it dissolves into the dashboard. | Dashboard entry | P0 |
| 14 | **Radial drawdown gauges:** animated arcs that change color as limits are approached. Numbers flash green or red for 400ms on each tick. | Dashboard objectives | P0 |
| 15 | **Breach effect:** red vignette pulse, a brief glitch/scanline flicker, and a shake on the modal | Breach modal | P0 |
| 16 | **Pass effect:** confetti in the accent colors, a gradient shockwave ring, and a glowing badge reveal | Pass modal, checkout success, payout paid | P0 |
| 17 | **Candlestick chart intro:** candles build up from left to right, then the last candle ticks live | Account detail | P1 |
| 18 | **⌘K command palette:** glass overlay with fuzzy search for pages and actions | Dashboard | P1 |
| 19 | **Smooth scroll (Lenis)** plus subtle parallax on section backgrounds | Marketing pages | P1 |
| 20 | **Noise/grain texture overlay** at very low opacity for depth | Global | P1 |

Build these as **reusable components** in `components/fx/`: `AuroraBackground`, `GridBeams`, `BorderBeam`, `SpotlightCard`, `TiltCard`, `ScrambleText`, `NumberRoll`, `Marquee`, `Globe`, `MagneticButton`, `BootSequence`, `RadialGauge`, `Confetti`. Hand-write them; don't depend on any component-library CLI.

---

## 6. Pages & behavior

Build **all P0 first** and polish it; P0 is the demo. **P1 is a bonus**: add it only once P0 is done and polished. Every button must do *something*: navigate, open a modal, or show a toast. No dead ends.

### Public site

**P0: `/` Home.** Section order may be adjusted based on your research.

1. **Navbar:** logo (gradient icon + wordmark), links (Challenges, How it Works, Payouts, Leaderboard, FAQ), "Demo preview" pill, Login, and a "Start Challenge" magnetic gradient button. Sticky, turning to glass blur on scroll.
2. **Ticker tape** directly under the navbar. Symbols: EURUSD, GBPUSD, XAUUSD, US30, NAS100, BTCUSD, USDJPY, ETHUSD… Prices tick every ~1.5s with green/red % changes and a flash.
3. **Hero** (FX 1, 2, 3, 11):
   - Headline: "Trade up to **$200,000** of our capital", then the scramble-rotating keyword line
   - Subtext and two CTAs: Start Challenge, and View Live Dashboard Demo
   - Trust row: "4.8/5" stars and "Payouts in under 24h"
   - Right side: the floating 3D tilt dashboard mockup with a self-drawing equity curve, a "Phase 1 · 62% to target" bar and live P/L
4. **Animated stats band** (FX 6): Total Rewards Paid **$48.2M+**, Funded Traders **27,400+**, Countries **150+**, Avg Payout Time **7h 42m**.
5. **How it works** (FX 9): 4 steps (Choose Challenge → Pass Evaluation → Get Funded → Get Paid) on a scroll-linked timeline.
6. **Interactive Challenge Selector (the centerpiece)** (FX 4, 5, 10):
   - Model tabs: **2-Step**, **1-Step**, **Instant Funding**
   - Account size pills: **$5K, $10K, $25K, $50K, $100K, $200K**
   - A rules table that updates with animation: Profit Target (Phase 1/Phase 2), Daily Loss Limit, Max Loss (static/trailing), Min Trading Days, Reward Share, Payout Frequency, Leverage
   - A rolling price with a crossed-out original price when a promo applies. The "Most popular" card gets a border beam.
   - A "Start Challenge" button that goes to `/checkout?model=…&size=…`
7. **Global community** (FX 8): the globe plus the live reward feed toasts, and the headline "Traders in 150+ countries".
8. **Payout proof wall** (FX 7): an auto-scrolling grid of payout cards (masked name "Ahmed K. 🇦🇪", amount, date, USDT/Bank badge) and a "Paid in the last 24h" counter.
9. **Supported platforms:** text badges for MetaTrader 5, cTrader, Match-Trader and TradeLocker, in spotlight cards.
10. **Leaderboard preview:** top 5 traders (initials avatar, flag, profit %, gain $) and a "View full leaderboard" link.
11. **Testimonials:** a marquee or carousel of 6 fictional testimonials.
12. **FAQ:** an animated accordion with 8 realistic questions (What happens if I break a rule? When can I request a payout? Is it real money? etc.).
13. **Final CTA:** a gradient-bordered card with a border beam and an aurora glow behind it.
14. **Footer:** columns of links, a legal links row (Terms, Privacy, Risk Disclosure, Refund Policy, Restricted Countries), and a small **risk disclaimer paragraph** ("All accounts are simulated… demo preview…").

**P0: `/challenges` Challenges comparison page** (the client specifically wants this in the demo)
- **Page hero:** "Choose your challenge" with a short subtext, on the aurora background.
- **Model tabs:** 2-Step / 1-Step / Instant Funding, with a sliding active pill (`layoutId`).
- **Full comparison table for all 3 models × all 6 sizes ($5K–$200K):**
  - **Columns** = account sizes. Each column header shows the size, a rolling price (with a crossed-out promo price) and a "Start Challenge" button that goes to `/checkout?model=…&size=…`.
  - **Rows** = Profit Target (Phase 1 / Phase 2), Daily Loss Limit, Max Loss (+ static/trailing), Min Trading Days, Time Limit, Reward Share (+ max with add-on), Payout Frequency, First Payout, Leverage, News Trading, Weekend Holding, EAs Allowed, Fee Refund.
  - Switching the model tab animates the values (cross-fade) and rolls the prices.
- **"Compare models" view toggle:** pick one account size and see all 3 models side by side in the same table style. This way the client sees every model × size combination.
- **Sticky header:** the column header row (size, price, CTA) stays pinned at the top while scrolling through the rule rows. On mobile, the table scrolls horizontally inside its card and the first column (rule names) stays pinned on the left.
- **Interactions:**
  - Row highlight on hover, and column highlight on hover
  - The "Most popular" column ($100K) gets a badge and a border beam
  - An **ⓘ tooltip on every rule name** explains it in plain words (use the blueprint glossary)
  - A **billing toggle for add-ons** (90% Reward Share, Bi-weekly Payouts, No Min Days) recalculates every price in the table live
- **Below the table:** a short "1-Step vs 2-Step vs Instant: which is right for you?" card row, and a mini FAQ accordion (4 questions).
- The navbar "Challenges" link and a "Compare all plans →" link under the homepage Challenge Selector both lead here.

**P0: `/checkout`**
- Reads `model` and `size` from the query string. Left column: account details form (name, email, country select) and a payment method choice (**Card** or **Crypto USDT/USDC**, shown as selectable glass cards).
- Right column: a sticky **order summary** with a rolling total.
- **Add-on toggles** that update the total live: "90% Reward Share" +20%, "Bi-weekly Payouts" +15%, "No Min Trading Days" +10%.
- **Coupon field:** code **`DEMO50`** gives 50% off with a success glow; any other code shows an error shake.
- A terms checkbox is required.
- On **"Pay"**: a fake processing state (~2s, with a step list animating "Confirming payment…" → "Creating your trading account…" → "Applying risk rules…"). Then a **success screen** with the pass effect (FX 16) and **"Your Phase 1 account is ready"**. Show fake credentials (Login `8812345`, Server `NovaEdge-Demo`, Password hidden with show/copy buttons) and a "Go to Dashboard" button.
- Add the new account to the Zustand store so it appears in the dashboard.

**P0: `/login` and `/signup`**
- A split layout: the form on one side, an animated panel on the other (aurora background plus a live mini chart and a rotating testimonial).
- **Any email and password works.** Store a fake session and redirect to `/dashboard`. Include a **"Continue as Demo Trader"** one-click button.
- Signup includes "Sign up with Google" styled buttons (fake), plus an animated password strength meter.

**P1: `/leaderboard`**
- Top 25 traders. Filter tabs for This Month / All Time. An animated podium for the top 3.

### Trader dashboard (app shell)

**Layout:** a left sidebar (logo; nav items Overview, Accounts, Payouts, Certificates, Affiliate, Leaderboard, Settings; an animated active indicator; a "Buy Challenge" button at the bottom) and a top bar (page title, Demo pill, notifications bell with a dropdown of 3 notifications, and a user avatar menu with Logout). On mobile, the sidebar is a drawer. The terminal boot sequence (FX 13) plays on the first entry in each session.

**P0: `/dashboard` Overview**
- **Account switcher cards:** 3 seeded accounts (**$100K 2-Step · Phase 1 · Active**, **$50K 1-Step · Passed**, **$200K · Funded**), plus any account bought in checkout.
- **KPI cards** (spotlight): Balance, Equity (live), Today's P/L (live), Reward Share.
- **Trading Objectives panel** (the key visual, FX 14):
  - Profit Target: progress toward, e.g., $8,000
  - **Daily Loss Limit:** a radial gauge of remaining vs $5,000 that moves live
  - **Max Loss:** a radial gauge of remaining vs $10,000
  - Min Trading Days: e.g. 3/4, shown as day dots that light up
  - Each objective has a status icon (✓ passed, ⏳ in progress, ✕ failed)
- **Equity curve:** a recharts area chart with a gradient fill, plus a dashed line at the max-loss floor and another at the profit target.
- **Recent trades table:** symbol, side (Buy/Sell badge), lots, open/close price, colored P/L with sign and arrow, duration. New trades slide in at the top.
- **Live simulation:** while an Active account is selected, equity drifts every ~1.5s (small random walk from the seeded RNG) and the gauges move accordingly.

**P0: Demo Control Panel.** This is the most important feature for showing *behavior*. Put it in a floating glass button at the bottom-right, labeled "🎮 Demo Controls", that opens a small panel. The buttons are:
- **Simulate Winning Trade:** adds a closed trade of +$1,200 to +$2,500, with a toast and a number flash
- **Simulate Losing Trade:** adds a closed trade of −$800 to −$1,800
- **Push Toward Daily Limit:** a sharp floating loss that makes the daily-loss gauge turn gold, then red
- **Trigger Breach:** the rules engine detects the daily loss breach. The account status becomes **BREACHED**, and the breach modal appears (FX 15): "Daily Loss Limit Exceeded", evidence (equity at breach, limit, timestamp), and CTAs "Reset Account (−20%)" and "Buy New Challenge".
- **Pass Phase:** the profit target is hit and minimum days are met. The pass modal appears (FX 16): "Phase 1 Passed! 🎉 Your Phase 2 account has been created". The account list updates.
- **Theme:** the 3-palette switcher from §4.3
- **Reset Demo:** clears the store back to the seeded data

The Demo Control Panel is available on all dashboard pages. Also add a small launcher for it on the homepage, so themes can be switched there too.

**P0: `/dashboard/accounts/[id]` Account detail**
- Header: account size, model, phase badge, status, platform badge.
- **Candlestick chart** (lightweight-charts) of XAUUSD or EURUSD with ~200 seeded candles and a dark theme. The last candle updates live, and there's a timeframe switcher (M5 / M15 / H1 / H4, which just regenerates data).
- **Credentials card:** login, server, password with show/copy buttons, and a "Reset password" toast.
- **Stats grid:** Win Rate, Profit Factor, Avg Win, Avg Loss, Best Day, Total Lots, Expectancy, Sharpe.
- **Daily P/L calendar:** a month grid with green/red intensity cells and a glass tooltip on hover.
- **Full trade history table:** filters (All/Wins/Losses, symbol select) and pagination.
- The same Objectives panel as the overview.

**P0: `/dashboard/payouts`**
- For the funded account: a large "Available for payout" card (profit × split, e.g. $6,420 × 90% = **$5,778**). Include an **eligibility countdown** ("Next payout window opens in 2d 14h" ticking), or show it as eligible.
- **Request Payout** modal: amount, method (USDT TRC20, USDC, Bank Transfer, Rise) and wallet/IBAN field. On submit, show a **status timeline** that auto-advances every ~2s: Requested → Under Review → Approved → **Paid ✓**. Each step glows as it activates, and the pass effect plays at Paid.
- Payout history table.

**P1: `/dashboard/certificates`**
- 3 certificate cards (Phase 1 Passed, Funded Trader, Payout $5,778). Each has an animated gradient border, a holographic sheen on hover, a brand seal, trader name, date and a certificate ID. Buttons: "Share" and "Download" (toasts are fine).

**P1: `/dashboard/affiliate`**
- A referral link with a copy button, stats (Clicks, Signups, Conversions, Earned), a bar chart of monthly earnings, commission tiers (Bronze 10% → Silver 12% → Gold 15%) with a progress bar to the next tier, and a recent referrals table.

**P1: `/dashboard/settings`**
- Profile form, 2FA toggle (shows a fake QR placeholder), notification toggles, and a KYC status card ("Verified ✓" or "Start verification").

### Admin preview (shows the client the back office)

**P0: `/admin`** (its own layout with a sidebar and a gold "Admin" badge; no auth needed)
- **KPI cards** with rolling numbers: Revenue (30d) **$1.24M**, Orders **4,812**, Pass Rate **11.8%**, Funded Accounts **612**, **Payout Ratio 38.4%**, Pending Payouts **23**.
- **Revenue chart:** area chart for 30 days, plus a donut of sales by model.
- **Risk Console table:** accounts closest to breach, with live color-coded usage bars for daily loss and max loss, fraud flags ("Same IP as #10233", "HFT pattern", "Copy-trading cluster") and a "View" action.
- **Payout Queue:** a table with **Approve** and **Reject** buttons that animate the row's status change and show a toast.
- **P1: Challenge Builder preview.** A form to edit a template (name, profit target %, daily loss %, max loss %, max loss type, min days, split %, price per size). A **live preview card** on the right renders the plan exactly as the public site would show it.

---

## 7. Demo rules engine (small but real)

Create `src/lib/rules.ts` with **pure functions**:

```ts
type Rules = {
  profitTargetPct: number; dailyLossPct: number; maxLossPct: number;
  maxLossType: 'static' | 'trailing'; minTradingDays: number;
};
type AccountState = {
  initialBalance: number; balance: number; equity: number;
  dayStartBalance: number; peakEquity: number; tradingDays: number;
  status: 'active' | 'passed' | 'breached' | 'funded';
};

// Returns updated state + any triggered event: 'DAILY_LOSS_BREACH' | 'MAX_LOSS_BREACH' | 'PASSED' | null
export function evaluate(state: AccountState, rules: Rules): { state: AccountState; event: string | null };
```

- Daily floor = `dayStartBalance − dailyLossPct × initialBalance`. It is breached when `equity ≤` the floor.
- Static max floor = `initialBalance × (1 − maxLossPct)`. Trailing max floor = `min(peakEquity − maxLossPct × initialBalance, initialBalance)`.
- Passed when `balance ≥ initialBalance × (1 + profitTargetPct)` and `tradingDays ≥ minTradingDays`.
- The live simulation and the Demo Controls **must go through `evaluate()`**, so the gauges, breach modal and pass modal are all driven by the same logic. (This mirrors §5 of the blueprint.)

---

## 8. Mock data

Keep all of it in `src/data/`, using a seeded PRNG (e.g. mulberry32):
- `plans.ts`: 3 models × 6 sizes with rules and prices. Suggested 2-Step prices: $49 / $89 / $179 / $299 / $499 / $949. 1-Step is about 15% higher; Instant is about 2.5× higher. 2-Step rules: 8% → 5% target, 5% daily, 10% static, 4 min days, 80% split (up to 90%). 1-Step: 10% target, 3% daily, 6% trailing, 80% split. Instant: no target, 3% daily, 5% trailing, 70% split.
- `accounts.ts`, `trades.ts` (~60 trades per account), `payouts.ts`, `leaderboard.ts` (25 traders with flags), `testimonials.ts`, `faq.ts`, `admin.ts`, `globe.ts` (marker coordinates for about 20 trader cities).
- `src/config/brand.ts`: name, tagline, palettes, support email, social links.
- Format money with `Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' })`.

---

## 9. Suggested structure

```
docs/ DESIGN_RESEARCH.md, PROP_FIRM_BLUEPRINT.md
src/
  app/
    (marketing)/page.tsx, challenges/, leaderboard/, checkout/, login/, signup/
    dashboard/layout.tsx, page.tsx, accounts/[id]/, payouts/, certificates/, affiliate/, settings/
    admin/layout.tsx, page.tsx
    template.tsx, globals.css, layout.tsx
  components/
    fx/ (AuroraBackground, GridBeams, BorderBeam, SpotlightCard, TiltCard, ScrambleText, NumberRoll,
         Marquee, Globe, MagneticButton, BootSequence, RadialGauge, Confetti)
    ui/ (Button, Card, Badge, Progress, Modal, Tabs, Toast, Input, Toggle, Skeleton)
    marketing/ (Navbar, TickerTape, Hero, ChallengeSelector, Stats, HowItWorks, GlobalCommunity, PayoutWall, FAQ, Footer)
    dashboard/ (Sidebar, Topbar, ObjectivesPanel, EquityChart, CandleChart, TradesTable, PnLCalendar, DemoControls, BreachModal, PassModal)
    admin/ (KpiGrid, RiskConsole, PayoutQueue, ChallengeBuilder)
  lib/ rules.ts, rng.ts, format.ts, store.ts (zustand), theme.ts
  data/ …
  config/ brand.ts
```

---

## 10. Build order (run `npm run build` after each milestone)

0. **Research** (§1) → write `docs/DESIGN_RESEARCH.md`.
1. Scaffold the project, CSS-variable design tokens, the theme switcher logic, fonts, and the **`components/fx/` library** (aurora, grid beams, border beam, spotlight, number roll, marquee, magnetic button).
2. Home page with all P0 sections and effects (including the Challenge Selector and the globe), plus the **`/challenges` comparison page**.
3. Checkout flow → success → store.
4. Login/signup → dashboard shell with the boot sequence → Overview with gauges, the live simulation, the **Demo Controls (including Theme), breach modal and pass modal**.
5. Account detail (candlestick chart, stats, calendar) → Payouts with the auto-advancing timeline.
6. Admin preview.
7. P1 pages and P1 effects: only once everything above is done and polished, and only at the same quality.
8. **Polish pass:**
   - Spacing, hover and focus states, empty states
   - Check at 375px, 768px and 1440px
   - Reduced-motion check
   - Scroll through every page looking for jank; fix anything below 60fps
   - Page `<title>`s and a favicon (gradient SVG logo)
9. **Final QA:** run `npm run build`, start the production server (`npm start`), and walk through the full demo script (§12) twice. Fix everything you find. Then tick off every item in the Definition of Done (§11).

---

## 11. Quality bar & gotchas

- It should look like a **top-tier, well-funded fintech product**: consistent spacing (8px scale), aligned grids, no default-looking browser controls, no lorem ipsum.
- Every chart has a dark theme: transparent background, muted gridlines, accent-colored series, custom glass tooltips. Charts pick up the current theme's accent colors.
- lightweight-charts and cobe: client-only, resize with a `ResizeObserver`, and dispose/destroy on unmount. Pause the globe when it's off-screen.
- Recharts: wrap charts in `ResponsiveContainer` inside a parent with an explicit height.
- Components that use state, effects, motion, canvas or charts need `'use client'`. Keep page files light.
- Wrap `useSearchParams` in `<Suspense>` (required for the Next.js build).
- No console errors, no hydration warnings, no layout shift when fonts or numbers load.
- Keep it fast: `next/font`, lazy-load the globe and charts, and no giant assets.

### Definition of Done (every item must be true before you finish)

- [ ] Every **P0** page in §6 is fully built, and so is any P1 page you chose to add. No placeholders, no "coming soon", no lorem ipsum, no `TODO`s.
- [ ] Every link and button works: it navigates, opens a modal, changes state or shows a toast.
- [ ] Full flow works end to end: Home → Challenges → Checkout (with `DEMO50`) → Success → the new account appears in the Dashboard → trades, breach and pass work → Payout timeline → Admin approve/reject.
- [ ] State persists across page changes and refreshes. "Reset Demo" restores the seeded data.
- [ ] All forms validate with inline error messages and show success states.
- [ ] Filters, tabs, sorting and pagination actually change the data shown.
- [ ] Every P0 animation in §5 is implemented and smooth. Reduced-motion is respected.
- [ ] Nothing outside this prompt's scope was built (no backend, no extra features from the blueprint).
- [ ] The theme switcher recolors everything, including charts, gauges and the globe.
- [ ] Looks right at 375px, 768px and 1440px, with no horizontal page scroll.
- [ ] No console errors and no hydration warnings.
- [ ] `npm run build` passes with zero errors or warnings you could fix.

---

## 12. Deliverables

1. The complete project, where `npm install && npm run build` passes, ready to deploy to Vercel with zero configuration.
2. `docs/DESIGN_RESEARCH.md`: research findings plus the final design direction.
3. A `README.md` with:
   - How to run locally, and how to deploy (push to GitHub → import in Vercel → Deploy, or `npx vercel --prod`)
   - Demo credentials ("any email/password" or "Continue as Demo Trader") and coupon **`DEMO50`**
   - How to rebrand (edit `src/config/brand.ts`) and how to switch or add themes
   - **A 3–4 minute demo script:** the exact click path to present to the client: Home (hero animations → Challenge Selector → globe) → **Challenges comparison page** (switch models, compare view, add-on toggle) → Checkout with DEMO50 → Success → Dashboard boot sequence → Demo Controls (win trade, push to limit, breach, reset, pass, **switch theme**) → Account detail → Payout request timeline → Admin preview.
4. When you're done, give me a short summary: what was built, confirmation that every Definition of Done item passes, anything not done (with the reason), and any known limitations.
