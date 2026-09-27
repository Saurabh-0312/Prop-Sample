# RESUME — NovaEdge Capital prop-firm demo

> **Status: COMPLETE** as of 2026-09-26 21:09 IST. The build was resumed at 20:27 IST and finished in the same session.
> - `npm run build` passes (17 routes).
> - `npx eslint src` is clean (0 errors, 0 warnings).
> - Browser QA passes at 1440, 768 and 375 px, with reduced motion and all three themes.
>
> Code is on GitHub: https://github.com/Saurabh-0312/Prop-Sample (branch `main`). Deploy it by importing the repo in Vercel.

If you come back to this project:
- Read `README.md` for run, deploy, credentials, Demo Controls, the demo script and rebranding.
- `docs/DEMO_BUILD_PROMPT.md` is the original brief and Definition of Done.

## What was finished after the first pause

**New pages**
- `/dashboard/settings`:
  - Profile form.
  - Notification switches.
  - 2FA set-up modal with a seeded QR and 6-digit check.
  - Active sessions.
  - KYC card (`#kyc`) with a 3-step verification that calls `completeKyc()` and creates the funded account for the passed $50K 1-Step.
- **Leaderboard:** shared `src/components/leaderboard/LeaderboardBoard.tsx` (This Month / All Time, model filter, animated podium with crown and border beam, ranks 4–25), used on the public `/leaderboard` and on `/dashboard/leaderboard` (adds "Your position").
- `src/app/not-found.tsx`: glitch 404.

**Command palette (FX 18)**
- `src/components/dashboard/CommandPalette.tsx`, opened with Ctrl/⌘+K or the top-bar "Search…" button.
- Covers pages, demo actions, account switching and themes.
- Actions are shared with Demo Controls through `src/lib/demoActions.ts`.

**QA fixes**
- `cn()` now lets the last base display utility win, so `className="hidden sm:inline-flex"` overrides a component's `inline-flex`. This fixed phone overflow from the navbar and demo pills.
- Every responsive grid has a `grid-cols-1` (minmax 0) base.
- `Segmented` scrolls instead of overflowing.
- The comparison table uses a fixed layout so it fits its card.
- `.word-in` sets `inline-block` on spans only.
- Formatting and copy:
  - Compare-at prices use `formatUSD` ("$1,099").
  - Payout labels are consistent.
  - Single-phase models say "Challenge Passed".
  - The success copy no longer repeats "2-Step".
- Trade history pages instantly; the new-trade animation only runs on the live overview feed.
- The candle chart fills its card.
- Radial gauges show a "Near limit" / "Critical" chip, which stays readable in the Gold palette.
- The navbar is more opaque when scrolled.
- The Demo Controls launcher is icon-only on phones.
- Sharpe ratio was recalibrated.

**Not built, by choice (P1)**
- Lenis smooth scroll and parallax. It hijacks wheel scrolling, which risks breaking nested scroll areas, sticky headers and modals during a live demo. Native smooth scrolling is used instead.

## QA scripts (`docs/qa/`)

They run against a production server with the installed Edge (`channel: "msedge"`):

```powershell
mkdir $env:TEMP\novaedge-qa; cd $env:TEMP\novaedge-qa; npm init -y; npm i playwright-core@1.63.0
copy E:\Prop\docs\qa\*.mjs .
# in E:\Prop:  npm run build ; npx next start -p 3000
node qa-final.mjs out/f               # full demo script + 21 functional assertions
node qa-responsive.mjs out/m 375 812  # every page, overflow + console check
node qa-flow1.mjs out/a ; node qa-flow2.mjs out/b   # screenshot tours
node qa-palette-reduced.mjs out/c     # ⌘K palette + prefers-reduced-motion
node qa-hydration.mjs http://localhost:3001         # against `next dev -p 3001`: React warnings
```

In Git Bash, prefix commands that take `/paths` as arguments with `MSYS_NO_PATHCONV=1`.

## Known notes

- In `next dev` only, React StrictMode's double effect run logs one WebGL warning from the globe. Production is clean.
- The TradingView attribution logo on the candlestick chart is required by lightweight-charts' license.
- All state is in `localStorage`. **Reset Demo** in Demo Controls (two clicks) restores the seeded data.
