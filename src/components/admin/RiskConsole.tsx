"use client";

import { useState } from "react";
import { Ban, Eye, Flag, ShieldAlert } from "lucide-react";
import { LiveDot } from "@/components/fx/LiveDot";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Progress } from "@/components/ui/Progress";
import { flag } from "@/data/countries";
import { RISK_ACCOUNTS, type RiskAccount } from "@/data/admin";
import { cn } from "@/lib/cn";
import { formatUSD } from "@/lib/format";
import { useInterval } from "@/lib/hooks";
import { usageTone } from "@/lib/rules";
import { toast } from "@/lib/toast";

type Live = RiskAccount & { disabled?: boolean; flagged?: boolean };

function UsageCell({ value }: { value: number }) {
  const tone = usageTone(value);
  return (
    <div className="w-[130px]">
      <div className="mb-1 flex justify-between text-[11px]">
        <span className={cn("num font-semibold", tone === "danger" ? "text-loss" : tone === "warn" ? "text-warning" : "text-fg")}>
          {Math.round(value * 100)}%
        </span>
      </div>
      <Progress value={value} mode="usage" height="sm" marker={0.9} />
    </div>
  );
}

/** Accounts closest to a breach, with live-updating usage bars and fraud flags. */
export function RiskConsole() {
  const [rows, setRows] = useState<Live[]>(RISK_ACCOUNTS);
  const [view, setView] = useState<Live | null>(null);

  useInterval(() => {
    const draws = rows.map(() => [Math.random(), Math.random()]);
    setRows((rs) =>
      rs
        .map((r, i) => {
          if (r.disabled) return r;
          const [a, b] = draws[i] ?? [0.5, 0.5];
          const dailyUsed = Math.min(0.97, Math.max(0.18, r.dailyUsed + (a - 0.5) * 0.06));
          const maxUsed = Math.min(0.95, Math.max(0.1, r.maxUsed + (b - 0.5) * 0.03));
          return { ...r, dailyUsed, maxUsed, equity: Math.round(r.equity * (1 + (a - 0.5) * 0.002)) };
        })
        .toSorted((x, y) => Math.max(y.dailyUsed, y.maxUsed) - Math.max(x.dailyUsed, x.maxUsed)),
    );
  }, 2000);

  const act = (id: string, patch: Partial<Live>, msg: [string, string]) => {
    setRows((rs) => rs.map((r) => (r.id === id ? { ...r, ...patch } : r)));
    setView((v) => (v && v.id === id ? { ...v, ...patch } : v));
    toast.success(msg[0], msg[1]);
  };

  return (
    <section id="risk" className="card scroll-mt-24 overflow-hidden rounded-2xl" aria-label="Risk console">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 pb-3 pt-5">
        <div>
          <h2 className="flex items-center gap-2 text-base font-semibold">
            <ShieldAlert className="size-4 text-warning" /> Risk console
          </h2>
          <p className="text-xs text-muted">Accounts closest to breach · sorted by highest limit usage</p>
        </div>
        <span className="flex items-center gap-2 text-xs text-muted">
          <LiveDot className="size-1.5" /> Streaming from risk engine
        </span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[980px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs text-muted">
              <th className="px-5 py-3 font-medium">Trader</th>
              <th className="px-3 py-3 font-medium">Account</th>
              <th className="px-3 py-3 font-medium">Equity</th>
              <th className="px-3 py-3 font-medium">Daily loss used</th>
              <th className="px-3 py-3 font-medium">Max loss used</th>
              <th className="px-3 py-3 font-medium">Flags</th>
              <th className="px-5 py-3 text-right font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className={cn("border-b border-line/60 transition-colors last:border-0 hover:bg-white/[0.02]", r.disabled && "opacity-50")}>
                <td className="px-5 py-3">
                  <span className="flex items-center gap-3">
                    <Avatar name={r.trader} size="sm" />
                    <span>
                      <span className="block font-medium">
                        {r.trader} {flag(r.country)}
                      </span>
                      <span className="num block text-xs text-muted">#{r.login}</span>
                    </span>
                  </span>
                </td>
                <td className="px-3 py-3">
                  <span className="block">{r.plan}</span>
                  <span className="text-xs text-muted">{r.phase}</span>
                </td>
                <td className="num px-3 py-3">{formatUSD(r.equity, 0)}</td>
                <td className="px-3 py-3">
                  <UsageCell value={r.dailyUsed} />
                </td>
                <td className="px-3 py-3">
                  <UsageCell value={r.maxUsed} />
                </td>
                <td className="px-3 py-3">
                  <div className="flex max-w-[220px] flex-wrap gap-1.5">
                    {r.disabled && <Badge tone="breached">Trading disabled</Badge>}
                    {r.flagged && <Badge tone="warning">Under review</Badge>}
                    {r.flags.map((f) => (
                      <Badge key={f} tone="warning" dot={false}>
                        {f}
                      </Badge>
                    ))}
                    {!r.flags.length && !r.disabled && !r.flagged && <span className="text-xs text-muted">—</span>}
                  </div>
                </td>
                <td className="px-5 py-3 text-right">
                  <Button size="sm" variant="secondary" iconLeft={<Eye className="size-3.5" />} onClick={() => setView(r)}>
                    View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal open={!!view} onClose={() => setView(null)} title={view ? `${view.trader} · #${view.login}` : undefined} description={view ? `${view.plan} · ${view.phase}` : undefined} size="md">
        {view && (
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-2">
              {[
                ["Equity", formatUSD(view.equity, 0)],
                ["Daily used", `${Math.round(view.dailyUsed * 100)}%`],
                ["Max used", `${Math.round(view.maxUsed * 100)}%`],
              ].map(([k, v]) => (
                <div key={k} className="rounded-xl border border-line bg-[#080c15] px-3 py-2.5">
                  <p className="text-[11px] text-muted">{k}</p>
                  <p className="num text-sm font-semibold">{v}</p>
                </div>
              ))}
            </div>
            <div>
              <p className="mb-2 text-[13px] font-medium">Fraud signals</p>
              {view.flags.length ? (
                <ul className="space-y-2 text-sm text-muted">
                  {view.flags.map((f) => (
                    <li key={f} className="flex items-center gap-2 rounded-xl border border-warning/25 bg-warning/[0.06] px-3 py-2 text-fg/90">
                      <Flag className="size-3.5 text-warning" /> {f}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-muted">No fraud signals — limit usage only.</p>
              )}
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button
                variant="danger"
                className="flex-1"
                disabled={view.disabled}
                iconLeft={<Ban className="size-4" />}
                onClick={() => act(view.id, { disabled: true }, ["Trading disabled", `#${view.login} can no longer open positions. Logged to audit trail.`])}
              >
                {view.disabled ? "Trading disabled" : "Disable trading"}
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                disabled={view.flagged}
                iconLeft={<Flag className="size-4" />}
                onClick={() => act(view.id, { flagged: true }, ["Flagged for review", `#${view.login} was added to the manual review queue.`])}
              >
                {view.flagged ? "Under review" : "Flag for review"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </section>
  );
}
