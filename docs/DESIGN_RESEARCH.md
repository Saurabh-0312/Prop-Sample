# NovaEdge Capital — Design Research & Direction

> Time-boxed research (≈18 page fetches, Sep 2026) of 8 prop firm sites plus fintech and UI-effect references. It feeds the sales demo only. No competitor branding, copy or assets are reused.

## 1. Competitor scan

| Competitor | What they do well | What's weak |
|---|---|---|
| **FTMO** | Heavyweight trust signals (years in business, total rewards, Trustpilot, audit badges). Clean 2-Step/1-Step toggle. Shows the **average reward per account size**. | Hedged hero copy. Dated Poppins/Roboto look and 3D sale badges. A very long page. |
| **FundedNext** | The best plan selector: **ⓘ tooltip on every rule**, a **%/$ toggle**, payout-structure toggle and a bold "rewards in 24h" guarantee. | Promo overload (coupon bar, countdown, several codes). Too many product lines. Cluttered badges. |
| **The5ers** | Clear two-column rules table (Evaluation vs Funded). A strong growth story ("manage up to $4M"). | Stat counters render **"0" until JavaScript runs**. Award badges repeated about 10 times. |
| **FundingPips** | A stage table, plus a payout-speed vs split trade-off. A strip of payouts by country. | Generic, template-like copy. Heavy on video. |
| **Topstep** | Radical honesty: it publishes pass and payout rates, and has a single memorable rule. | Plans are buried on a subpage. The hero is brand and media, not the product. |
| **E8 Markets** | The most modern: **the product is in the hero** (floating metric widgets, live ticker). The configurator reprices live. | Busy (70+ animations). Invented jargon. The closest palette to ours (teal on near-black). |
| **FXIFY** | Visible add-ons, masked payout proofs, and a dashboard showcase section. | A marquee of 20+ feature chips. Stock illustrations. |
| **Apex** | Very simple rule list. | ALL-CAPS "NO…" lists, a defensive tone and a dated WordPress feel. |

**Patterns everyone shares:** model tabs → size pills → rules → price with a strike-through; "How it works" in 4 steps; trust numbers; FAQ; the words "simulated capital" and "rewards". **Nobody** combines a live, working product preview with a genuinely calm, premium visual system. That is our gap.

## 2. Our design direction — "Futuristic trading terminal, premium fintech"

### 2.1 Palette (validated)

The base stays dark with a blue tint. Accents come from three switchable palettes. Profit and loss colours are reserved for P/L, pass and breach.

| Token | Value | Contrast on `--bg` | Notes |
|---|---|---|---|
| `--bg` | `#05070D` | — | Page background (never pure black) |
| `--bg-elevated` | `#0A0E17` | — | Sidebar, sections |
| `--surface` | `rgba(17,24,39,.6)` + blur | — | Glass cards |
| `--surface-solid` | `#0F1420` | — | Inputs, tables |
| `--text` | `#E6EDF7` | **17.1 : 1** | Body text |
| `--muted` | `#8A94A6` | **6.8 : 1** | Secondary text (passes AA) |
| `--accent-1/2/3` | `#00E5A0` / `#00B3FF` / `#7C5CFF` | 12.2 : 1 (mint) | Signature gradient at 135° |
| `--profit` | `#00D395` | 10.3 : 1 | Always shown with a **+ sign and ▲ arrow** |
| `--loss` | `#FF4D5E` | 6.1 : 1 | Always shown with a **− sign and ▼ arrow** |
| `--warning` | `#F5B942` | 11.4 : 1 | ≥70% of a limit used |

- **Live palettes** (only the accents change): **Neon Terminal** (default) · **Electric Blue** `#3D7BFF / #22D3EE / #A855F7` · **Gold Luxe** `#F2C14E / #FF8A3D / #FFE7A3`.
- **Dark text on the gradient buttons** always stays ≥ 4.6 : 1. The weakest stop is violet `#7C5CFF` at 4.6 : 1; Electric Blue is 5.3 : 1.
- **60-30-10 rule:** accents appear as glows, hairline borders, progress fills and one gradient word per headline, never as big flat blocks.

### 2.2 Typography

- **Geist** for the UI and headlines: tight tracking (−0.035em) and weights 600–700. The hero is `clamp(44px, 6.4vw, 80px)`. It reads more "engineered" than Inter and matches the Vercel/Linear reference.
- **JetBrains Mono** with `tabular-nums` for every price, P/L, balance, percentage and timer, so digits never jump.
- A self-hosted **Twemoji country-flag font**, limited by `unicode-range`, so flags such as 🇦🇪 render on Windows too.

### 2.3 Homepage section order

Navbar + ticker tape → **Hero** (product mockup + a live "latest reward" chip above the fold) → Stats band → How it works (scroll timeline) → **Challenge selector** → Global community (globe + live reward feed) → Payout proof wall → Platforms → Leaderboard preview → Testimonials → FAQ → Final CTA → Footer with a risk disclaimer.

### 2.4 Signature animations (one moment per section)

1. **Aurora + 48px grid:** radial fade with light beams travelling along the grid lines (hero and global background).
2. **Headline blur-in:** a decrypt/scramble keyword cycles Forex → Gold → Indices → Crypto.
3. **3D tilt dashboard mockup:** a self-drawing equity line and live ticking P/L.
4. **Border beam:** a conic light orbits the "Most popular" plan card and the final CTA.
5. **Spotlight cards:** a cursor-following radial glow on feature, plan and KPI cards.
6. **Rolling digits (NumberFlow):** count-up on first view, and prices/P/L roll when they change. The final value is server-rendered, so the counters never show "0".
7. **Edge-faded marquees:** ticker tape, payout wall, testimonials.
8. **cobe WebGL globe:** trader-city markers and payout arcs, plus a live reward-toast feed.
9. **Scroll-linked "How it works" timeline** and **`layoutId` sliding pills** in the selector.
10. **Dashboard theatre:** terminal boot sequence, radial drawdown gauges that turn gold then red, a breach glitch/vignette and a pass confetti shockwave.

## 3. UX decisions taken from the research

1. **Rules live on the plan card.** Every rule has an ⓘ plain-English tooltip, there is a **%/$ toggle** (from FundedNext), and the "Avg. reward on this tier" is shown (from FTMO).
2. **Payout proof above the fold.** The hero trust row carries a live "latest reward" chip, and the full proof wall comes two sections later.
3. **Show the product, not illustrations.** The hero is a live dashboard mockup (only E8 does this). "View Live Dashboard Demo" is the secondary CTA.
4. **Draw the rules.** The equity chart shows the profit-target line and the max-loss floor, and the gauges state whether the limit is **static or trailing**.
5. **Quiet promos.** One promo chip and a strike-through price. No countdown bars or coupon walls; `DEMO50` lives in checkout.
6. **Honest, calm density.** Restraint over noise, the opposite of E8/FXIFY clutter. Gradient text only on key words; glows act as light sources.
