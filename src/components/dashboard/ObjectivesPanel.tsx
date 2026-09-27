"use client";

import type { ReactNode } from "react";
import { CircleCheck, CircleX, Hourglass } from "lucide-react";
import { NumberRoll } from "@/components/fx/NumberRoll";
import { RadialGauge } from "@/components/fx/RadialGauge";
import { Progress } from "@/components/ui/Progress";
import { InfoTip } from "@/components/ui/Tooltip";
import { cn } from "@/lib/cn";
import { formatPct, formatUSD } from "@/lib/format";
import { getObjectives, usageTone } from "@/lib/rules";
import { phaseLabel } from "@/lib/store";
import type { TradingAccount } from "@/lib/types";

type Status = "passed" | "progress" | "failed" | "warn";

function StatusIcon({ status }: { status: Status }) {
  if (status === "passed")
    return <CircleCheck className="size-[18px] text-profit" aria-label="Passed" />;
  if (status === "failed") return <CircleX className="size-[18px] text-loss" aria-label="Failed" />;
  if (status === "warn") return <Hourglass className="size-[18px] text-warning" aria-label="Near limit" />;
  return <Hourglass className="size-[18px] text-muted" aria-label="In progress" />;
}

function Row({ title, status, tip, children, right }: { title: string; status: Status; tip: string; children?: ReactNode; right?: ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm font-medium">
          <StatusIcon status={status} />
          {title}
          <InfoTip content={tip} label={`About ${title}`} />
        </span>
        {right}
      </div>
      {children}
    </div>
  );
}

export function ObjectivesPanel({ account, className }: { account: TradingAccount; className?: string }) {
  const o = getObjectives(account.state, account.rules);
  const r = account.rules;
  const status = account.state.status;
  const breach = account.breach;
  const passedAll = status === "passed";

  const targetStatus: Status = o.profitTarget === null ? "passed" : passedAll || o.profitProgress >= 1 ? "passed" : "progress";
  const dailyStatus: Status = breach?.rule === "DAILY_LOSS" ? "failed" : usageTone(o.dailyUsedPct) !== "ok" ? "warn" : "passed";
  const maxStatus: Status = breach?.rule === "MAX_LOSS" ? "failed" : usageTone(o.maxUsedPct) !== "ok" ? "warn" : "passed";
  const daysStatus: Status = o.tradingDays >= o.minTradingDays ? "passed" : "progress";

  return (
    <section className={cn("card rounded-2xl p-5 sm:p-6", className)} aria-label="Trading objectives">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">Trading objectives</h2>
          <p className="text-xs text-muted">
            {phaseLabel(account)} · rules snapshotted at purchase
          </p>
        </div>
        {status === "breached" ? (
          <span className="rounded-full border border-loss/30 bg-loss/10 px-2.5 py-1 text-xs font-medium text-loss">Breached</span>
        ) : passedAll ? (
          <span className="rounded-full border border-profit/30 bg-profit/10 px-2.5 py-1 text-xs font-medium text-profit">All objectives met</span>
        ) : (
          <span className="rounded-full border border-line bg-white/[0.03] px-2.5 py-1 text-xs text-muted">Monitoring live</span>
        )}
      </div>

      <div className="space-y-6">
        <Row
          title="Profit target"
          status={targetStatus}
          tip="Closed profit you need, measured against the starting balance."
          right={
            o.profitTarget !== null ? (
              <span className="num text-xs text-muted">{formatPct(r.profitTargetPct, 0)} · {formatUSD(o.profitTarget, 0)}</span>
            ) : (
              <span className="text-xs text-muted">No target on funded accounts</span>
            )
          }
        >
          {o.profitTarget !== null && (
            <div className="mt-3">
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <span className="num text-lg font-semibold">
                  <NumberRoll value={Math.max(0, o.profit)} format="usd" />
                  <span className="text-sm font-normal text-muted"> / {formatUSD(o.profitTarget, 0)}</span>
                </span>
                <span className="num text-sm font-semibold text-accent-1">
                  <NumberRoll value={o.profitProgress} format="pct1" />
                </span>
              </div>
              <Progress value={o.profitProgress} height="md" label="Profit target progress" />
            </div>
          )}
        </Row>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col items-center rounded-2xl border border-line bg-white/[0.015] p-4">
            <Row
              title="Daily loss"
              status={dailyStatus}
              tip="Equity may not fall below the day's starting balance minus this % of the initial balance. Floating losses count."
            />
            <RadialGauge
              className="mt-2"
              label="Left today"
              remaining={o.dailyBuffer}
              limit={o.dailyLimit}
              usedPct={o.dailyUsedPct}
              caption={`floor ${formatUSD(o.dailyFloor, 0)}`}
            />
            <p className="num -mt-1 text-xs text-muted">
              {formatPct(r.dailyLossPct, 0)} · {formatUSD(o.dailyLimit, 0)} limit
            </p>
          </div>
          <div className="flex flex-col items-center rounded-2xl border border-line bg-white/[0.015] p-4">
            <Row
              title="Max loss"
              status={maxStatus}
              tip={
                r.maxLossType === "static"
                  ? "Static: equity may never fall below initial balance × (1 − limit)."
                  : "Trailing: the floor follows your highest equity and locks at the starting balance."
              }
            />
            <RadialGauge
              className="mt-2"
              label="Left overall"
              remaining={o.maxBuffer}
              limit={o.maxLimit}
              usedPct={o.maxUsedPct}
              caption={`floor ${formatUSD(o.maxFloor, 0)}`}
            />
            <p className="num -mt-1 text-xs text-muted">
              {formatPct(r.maxLossPct, 0)} {r.maxLossType} · {formatUSD(o.maxLimit, 0)}
            </p>
          </div>
        </div>

        <Row
          title="Min trading days"
          status={daysStatus}
          tip="Distinct days with at least one trade before you can pass."
          right={
            <span className="num text-xs text-muted">
              {o.minTradingDays ? `${Math.min(o.tradingDays, o.minTradingDays)} / ${o.minTradingDays}` : `${o.tradingDays} traded · no minimum`}
            </span>
          }
        >
          {o.minTradingDays > 0 && (
            <div className="mt-3 flex gap-2">
              {Array.from({ length: o.minTradingDays }, (_, i) => {
                const lit = i < o.tradingDays;
                return (
                  <span
                    key={i}
                    className={cn(
                      "h-2.5 flex-1 rounded-full transition-all duration-700",
                      lit ? "bg-gradient-brand shadow-[0_0_12px_-2px_var(--accent-2)]" : "bg-white/[0.08]",
                    )}
                  />
                );
              })}
            </div>
          )}
        </Row>
      </div>
    </section>
  );
}
