"use client";

import { useRef, type PointerEvent } from "react";
import { Award, Download, Share2 } from "lucide-react";
import { Reveal } from "@/components/fx/Reveal";
import { LogoMark } from "@/components/ui/Logo";
import { Button } from "@/components/ui/Button";
import { brand } from "@/config/brand";
import { planLabel } from "@/data/plans";
import { formatLongDate, formatUSD } from "@/lib/format";
import { hashString } from "@/lib/rng";
import { stageLabel, useDemoStore } from "@/lib/store";
import { toast } from "@/lib/toast";

type Cert = { id: string; kind: string; headline: string; sub: string; date: number; fresh: boolean };

function certId(seed: string) {
  return `NE-${(hashString(seed) % 900000) + 100000}-${String.fromCharCode(65 + (hashString(seed) % 26))}`;
}

function Seal() {
  const text = `${brand.name.toUpperCase()} · VERIFIED · `.repeat(2);
  return (
    <div className="relative grid size-[76px] place-items-center">
      <svg viewBox="0 0 100 100" className="absolute inset-0 size-full animate-[spin_24s_linear_infinite] motion-reduce:animate-none" aria-hidden>
        <defs>
          <path id="seal-path" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
        </defs>
        <text className="fill-muted font-mono text-[7.4px] tracking-[0.18em]">
          <textPath href="#seal-path">{text}</textPath>
        </text>
      </svg>
      <span className="grid size-11 place-items-center rounded-full border border-white/15 bg-[#0a0f19]">
        <LogoMark className="size-7" />
      </span>
    </div>
  );
}

function CertificateCard({ cert, trader }: { cert: Cert; trader: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const move = (e: PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--hx", `${((e.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty("--hy", `${((e.clientY - r.top) / r.height) * 100}%`);
  };
  const id = certId(cert.id);
  return (
    <div className="group">
      <div
        ref={ref}
        onPointerMove={move}
        className="cert relative aspect-[1.42] overflow-hidden rounded-[22px] p-[1.5px] transition-transform duration-500 ease-expo hover:-translate-y-1"
      >
        <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-[21px] bg-[linear-gradient(160deg,#0f1626,#080c15_70%)] p-5 sm:p-6">
          <div aria-hidden className="grid-lines opacity-40" />
          <div aria-hidden className="cert-sheen" />
          <div className="relative flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-accent-1">Certificate of achievement</p>
              <p className="mt-2 text-[22px] font-semibold leading-tight tracking-tight sm:text-2xl">{cert.headline}</p>
              <p className="mt-1 text-xs text-muted">{cert.sub}</p>
            </div>
            <Seal />
          </div>
          <div className="relative flex items-end justify-between gap-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.18em] text-muted">Awarded to</p>
              <p className="mt-1 text-lg font-semibold">{trader}</p>
            </div>
            <div className="text-right">
              <p className="num text-[11px] text-muted">{formatLongDate(cert.date)}</p>
              <p className="num text-[11px] text-muted">ID {id}</p>
            </div>
          </div>
          {cert.fresh && (
            <span className="absolute right-4 top-4 rounded-full bg-gradient-brand px-2 py-0.5 text-[10px] font-bold uppercase text-ink">New</span>
          )}
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-sm text-muted">
          <Award className="size-4 text-accent-2" /> {cert.kind}
        </span>
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="secondary"
            iconLeft={<Share2 className="size-3.5" />}
            onClick={() => {
              const url = `https://${brand.shortName.toLowerCase()}.capital/verify/${id}`;
              void navigator.clipboard?.writeText(url).catch(() => undefined);
              toast.success("Share link copied", url);
            }}
          >
            Share
          </Button>
          <Button size="sm" variant="secondary" iconLeft={<Download className="size-3.5" />} onClick={() => toast.success("Certificate downloaded", `${id}.png · 2400×1690`)}>
            Download
          </Button>
        </div>
      </div>
    </div>
  );
}

export function CertificatesView() {
  const accounts = useDemoStore((s) => s.accounts);
  const payouts = useDemoStore((s) => s.payouts);
  const session = useDemoStore((s) => s.session);
  const seededAt = useDemoStore((s) => s.seededAt);

  const certs: Cert[] = [];
  for (const p of payouts) {
    if (p.stage !== "paid" || !p.paidAt) continue;
    const fresh = p.requestedAt > seededAt;
    if (!fresh && certs.some((c) => c.kind === "Reward certificate")) continue;
    certs.push({ id: p.id, kind: "Reward certificate", headline: `Reward paid · ${formatUSD(p.amount)}`, sub: `${p.accountLabel} · via ${p.method.toUpperCase()}`, date: p.paidAt, fresh });
  }
  for (const a of accounts) {
    if (a.phase === "funded") {
      certs.push({ id: `${a.id}-funded`, kind: "Funded trader", headline: "Funded Trader", sub: `${planLabel(a.model, a.size)} · ${Math.round(a.rewardShare * 100)}% reward share`, date: a.createdAt, fresh: a.createdAt > seededAt });
    }
    if (a.state.status === "passed") {
      certs.push({ id: `${a.id}-passed`, kind: "Challenge passed", headline: `${stageLabel(a)} Passed`, sub: `${planLabel(a.model, a.size)} · #${a.login}`, date: a.passedAt ?? a.createdAt, fresh: (a.passedAt ?? 0) > seededAt });
    }
  }
  certs.sort((x, y) => y.date - x.date);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Certificates</h2>
        <p className="text-sm text-muted">Verifiable proof of every milestone — share them anywhere. New passes and payouts appear here automatically.</p>
      </div>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 2xl:grid-cols-3">
        {certs.map((c, i) => (
          <Reveal key={c.id} delay={i * 0.06}>
            <CertificateCard cert={c} trader={session?.name ?? "Alex Morgan"} />
          </Reveal>
        ))}
      </div>
    </div>
  );
}
