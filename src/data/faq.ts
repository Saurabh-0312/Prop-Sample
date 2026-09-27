export type Faq = { q: string; a: string };

export const HOME_FAQ: Faq[] = [
  {
    q: "How does the NovaEdge Challenge work?",
    a: "You pick a model and account size, pay a one-time fee and trade a simulated account. Hit the profit target without breaking the daily or max loss limit, trade the minimum number of days, and you move to the next phase. Pass every phase and you receive a funded account with a reward share of up to 90%.",
  },
  {
    q: "What happens if I break a rule?",
    a: "Our risk engine checks your equity on every price change. If your equity touches the daily loss or max loss floor, the account is marked as breached and trading is disabled. You receive the full evidence — equity, limit and timestamp — and can restart with a discounted reset.",
  },
  {
    q: "Is this real money?",
    a: "No. All evaluation and funded accounts use simulated capital. Rewards are paid by NovaEdge from its own revenue based on the performance of your simulated account. This is how the leading firms in the industry operate.",
  },
  {
    q: "When can I request a payout?",
    a: "On the 2-Step and 1-Step models your first reward is available 30 days after funding, then monthly — or every 14 days with the Bi-weekly Payouts add-on. Instant Funding accounts can request rewards every 14 days from the start.",
  },
  {
    q: "How is the daily loss limit calculated?",
    a: "It is a percentage of your initial balance, measured from the balance at the start of the server day (00:00 server time). Floating losses count, so an open position can breach the limit even before it is closed.",
  },
  {
    q: "Is the max loss static or trailing?",
    a: "The 2-Step uses a static max loss: a fixed floor at 90% of the initial balance. 1-Step and Instant use a trailing max loss that rises with your highest equity and stops rising once it reaches the starting balance.",
  },
  {
    q: "Which platforms and instruments can I trade?",
    a: "MetaTrader 5, cTrader, Match-Trader and TradeLocker. You can trade forex, gold and other metals, indices, energies and major cryptocurrencies with leverage of up to 1:100.",
  },
  {
    q: "Is the challenge fee refundable?",
    a: "Yes, on the 2-Step and 1-Step models your full challenge fee is refunded together with your first reward. Instant Funding fees are not refundable.",
  },
];

export const CHALLENGE_FAQ: Faq[] = [
  {
    q: "Can I switch models after I buy?",
    a: "Each account keeps the rules it was sold with. You can buy a different model at any time, and all accounts appear side by side in your dashboard.",
  },
  {
    q: "Are there recurring or hidden fees?",
    a: "No. The challenge fee is a one-time payment. Add-ons are optional and priced upfront in the table above.",
  },
  {
    q: "Can I hold trades over the weekend or during news?",
    a: "2-Step allows both. 1-Step restricts trades two minutes around high-impact news. Instant Funding does not allow weekend holding and restricts news trading by five minutes.",
  },
  {
    q: "Can I use Expert Advisors or copy trading?",
    a: "EAs are allowed on every model as long as they do not use HFT, latency arbitrage or tick scalping. Copying trades from other traders or across accounts is not permitted.",
  },
];
