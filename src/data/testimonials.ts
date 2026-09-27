export type Testimonial = {
  name: string;
  country: string;
  badge: string;
  quote: string;
  rating: number;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Ahmed K.",
    country: "AE",
    badge: "Funded · $200K 2-Step",
    quote:
      "The dashboard shows my daily loss buffer in real time, so I never have to guess. My first reward landed in USDT the same afternoon I requested it.",
    rating: 5,
  },
  {
    name: "Sofia R.",
    country: "ES",
    badge: "Funded · $100K 1-Step",
    quote:
      "Clear rules and no hidden conditions. The trailing drawdown is explained right on the plan card — I knew exactly what I was signing up for.",
    rating: 5,
  },
  {
    name: "Amara O.",
    country: "NG",
    badge: "Phase 2 · $50K 2-Step",
    quote:
      "Passed Phase 1 in eight trading days. The objectives panel with the gauges is the best I have used at any firm.",
    rating: 5,
  },
  {
    name: "Kenji T.",
    country: "JP",
    badge: "Funded · $200K 2-Step",
    quote:
      "Execution on Match-Trader is clean and the payout timeline is fully transparent — requested, reviewed, approved, paid.",
    rating: 5,
  },
  {
    name: "Daniel W.",
    country: "GB",
    badge: "Instant · $50K",
    quote:
      "I wanted to skip the evaluation and Instant Funding let me trade on day one. Support answered my KYC question in minutes.",
    rating: 4,
  },
  {
    name: "Priya S.",
    country: "IN",
    badge: "Funded · $100K 2-Step",
    quote:
      "The fee refund with my first reward was a nice surprise. Ninety percent reward share after the add-on makes a real difference.",
    rating: 5,
  },
];
