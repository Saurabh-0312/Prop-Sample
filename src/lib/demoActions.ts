import { formatSignedUSD } from "./format";
import { useDemoStore } from "./store";
import { toast } from "./toast";

export type DemoActionKey = "win" | "loss" | "push" | "breach" | "pass";

/**
 * Runs a Demo Controls action against an account through the rules engine and reports
 * the result with a toast. Returns true when the action changed something.
 */
export function runDemoAction(key: DemoActionKey, accountId: string): boolean {
  const store = useDemoStore.getState();
  const acc = store.accounts.find((a) => a.id === accountId);
  if (!acc) {
    toast.info("Pick an account first");
    return false;
  }
  switch (key) {
    case "win":
    case "loss": {
      const r = store.simulateTrade(accountId, key);
      if (!r.ok || !r.trade) {
        toast.info(r.message);
        return false;
      }
      const t = r.trade;
      (t.pnl >= 0 ? toast.profit : toast.loss)(
        `${t.pnl >= 0 ? "Winning" : "Losing"} trade closed · ${formatSignedUSD(t.pnl)}`,
        `${t.side === "buy" ? "Buy" : "Sell"} ${t.lots.toFixed(2)} ${t.symbol} on #${acc.login}`,
      );
      return true;
    }
    case "push": {
      const r = store.pushTowardDailyLimit(accountId);
      if (r.ok) toast.warning("Approaching the daily loss limit", r.message);
      else toast.info(r.message);
      return r.ok;
    }
    case "breach": {
      const r = store.triggerBreach(accountId);
      if (!r.ok) toast.info(r.message);
      return r.ok;
    }
    case "pass": {
      const r = store.passPhase(accountId);
      if (!r.ok) toast.info(r.message);
      return r.ok;
    }
  }
}
