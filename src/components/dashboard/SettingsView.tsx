"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  BadgeCheck,
  Bell,
  Camera,
  Check,
  FileUp,
  Loader2,
  LogOut,
  Monitor,
  ScanFace,
  ShieldCheck,
  Smartphone,
  UserRound,
  Wallet,
} from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CopyButton } from "@/components/ui/CopyButton";
import { Field, Input, Select } from "@/components/ui/Field";
import { Modal } from "@/components/ui/Modal";
import { Segmented } from "@/components/ui/Segmented";
import { Switch } from "@/components/ui/Toggle";
import { WalletIcon } from "@/components/wallet/ConnectWalletModal";
import { brand } from "@/config/brand";
import { COUNTRIES, flag } from "@/data/countries";
import { cn } from "@/lib/cn";
import { createRng } from "@/lib/rng";
import { useDemoStore } from "@/lib/store";
import { toast } from "@/lib/toast";
import { networkName, useWalletStore } from "@/lib/wallet";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function Card({ title, icon, children, aside, id }: { title: string; icon: ReactNode; children: ReactNode; aside?: ReactNode; id?: string }) {
  return (
    <section id={id} className="card scroll-mt-24 rounded-2xl p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2.5 text-base font-semibold">
          <span className="grid size-8 place-items-center rounded-lg bg-white/[0.05] text-accent-2 [&>svg]:size-4">{icon}</span>
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

/* ───────────── Profile ───────────── */

function ProfileCard() {
  const session = useDemoStore((s) => s.session);
  const [name, setName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [country, setCountry] = useState<string | null>(null);
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  if (!session) return null;
  const v = { name: name ?? session.name, email: email ?? session.email, country: country ?? session.country };
  const dirty = v.name !== session.name || v.email !== session.email || v.country !== session.country;

  const save = (e: FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (v.name.trim().length < 2) errs.name = "Enter your full name.";
    if (!EMAIL.test(v.email.trim())) errs.email = "Enter a valid email address.";
    setErrors(errs);
    if (errs.name || errs.email) return;
    useDemoStore.getState().updateProfile({ name: v.name.trim(), email: v.email.trim(), country: v.country });
    setName(null);
    setEmail(null);
    setCountry(null);
    toast.success("Profile updated", "Your details were saved.");
  };

  return (
    <Card title="Profile" icon={<UserRound />}>
      <div className="mb-5 flex items-center gap-4">
        <Avatar name={v.name || "Trader"} size="lg" />
        <div className="min-w-0">
          <p className="truncate font-semibold">{v.name || "—"}</p>
          <p className="truncate text-sm text-muted">{v.email}</p>
        </div>
      </div>
      <form onSubmit={save} noValidate className="space-y-4">
        <Field label="Full name" htmlFor="st-name" error={errors.name}>
          <Input id="st-name" autoComplete="name" value={v.name} invalid={!!errors.name} onChange={(e) => { setName(e.target.value); setErrors((x) => ({ ...x, name: undefined })); }} />
        </Field>
        <Field label="Email" htmlFor="st-email" error={errors.email}>
          <Input id="st-email" type="email" autoComplete="email" value={v.email} invalid={!!errors.email} onChange={(e) => { setEmail(e.target.value); setErrors((x) => ({ ...x, email: undefined })); }} />
        </Field>
        <Field label="Country of residence" htmlFor="st-country">
          <Select id="st-country" value={v.country} onChange={(e) => setCountry(e.target.value)}>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {flag(c.code)} {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <div className="flex items-center gap-2 pt-1">
          <Button type="submit" disabled={!dirty}>
            Save changes
          </Button>
          {dirty && (
            <Button
              variant="ghost"
              onClick={() => {
                setName(null);
                setEmail(null);
                setCountry(null);
                setErrors({});
              }}
            >
              Cancel
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}

/* ───────────── Notifications ───────────── */

const NOTIFY: { key: "notifyTrades" | "notifyPayouts" | "notifyNews" | "notifyMarketing"; label: string; text: string }[] = [
  { key: "notifyTrades", label: "Trade & rule alerts", text: "Near-limit warnings, breaches and passed objectives." },
  { key: "notifyPayouts", label: "Payout updates", text: "Every status change of your reward requests." },
  { key: "notifyNews", label: "High-impact news", text: "Reminders before restricted news windows." },
  { key: "notifyMarketing", label: "Promotions", text: "Discounts, competitions and product news." },
];

function NotificationsCard() {
  const settings = useDemoStore((s) => s.settings);
  return (
    <Card title="Notifications" icon={<Bell />}>
      <ul className="divide-y divide-line">
        {NOTIFY.map((n) => (
          <li key={n.key} className="flex items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
            <div>
              <p className="text-sm font-medium">{n.label}</p>
              <p className="text-xs text-muted">{n.text}</p>
            </div>
            <Switch
              checked={settings[n.key]}
              label={n.label}
              onChange={(v) => {
                useDemoStore.getState().updateSettings({ [n.key]: v });
                toast.info("Preferences saved", `${n.label} ${v ? "on" : "off"}.`);
              }}
            />
          </li>
        ))}
      </ul>
    </Card>
  );
}

/* ───────────── Security / 2FA ───────────── */

function Finder({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <rect x={x} y={y} width={7} height={7} fill="#05070d" />
      <rect x={x + 1} y={y + 1} width={5} height={5} fill="#fff" />
      <rect x={x + 2} y={y + 2} width={3} height={3} fill="#05070d" />
    </g>
  );
}

const QR_SIZE = 25;

function qrCells(seed: string): [number, number][] {
  const n = QR_SIZE;
  const rng = createRng(`qr-${seed}`);
  const cells: [number, number][] = [];
  const inFinder = (x: number, y: number) => (x < 7 && y < 7) || (x >= n - 7 && y < 7) || (x < 7 && y >= n - 7);
  for (let y = 0; y < n; y++) for (let x = 0; x < n; x++) if (!inFinder(x, y) && rng.chance(0.47)) cells.push([x, y]);
  return cells;
}

/** Decorative authenticator QR (seeded, not scannable). */
function FakeQr({ seed }: { seed: string }) {
  const n = QR_SIZE;
  const cells = qrCells(seed);
  return (
    <svg viewBox={`-2 -2 ${n + 4} ${n + 4}`} className="size-44 rounded-xl bg-white p-1" role="img" aria-label="Authenticator QR code (demo)">
      {cells.map(([x, y]) => (
        <rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} fill="#05070d" />
      ))}
      <Finder x={0} y={0} />
      <Finder x={n - 7} y={0} />
      <Finder x={0} y={n - 7} />
    </svg>
  );
}

function TwoFactorSetup({ email, onDone }: { email: string; onDone: () => void }) {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const secret = "NVED GE4X 7KQM 2PLA";
  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (!/^\d{6}$/.test(code)) {
          setError("Enter the 6-digit code from your authenticator app.");
          return;
        }
        useDemoStore.getState().updateSettings({ twoFactor: true });
        toast.success("Two-factor authentication enabled", "You’ll be asked for a code on every new sign-in.");
        onDone();
      }}
      className="space-y-5"
    >
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <FakeQr seed={email} />
        <div className="space-y-3 text-sm text-muted">
          <p>
            <span className="font-semibold text-fg">1.</span> Scan the code with Google Authenticator, 1Password or Authy.
          </p>
          <p>
            <span className="font-semibold text-fg">2.</span> Or enter this key manually:
          </p>
          <div className="flex items-center gap-1 rounded-xl border border-line bg-[#080c15] py-1 pl-3 pr-1">
            <span className="num flex-1 text-[13px] text-fg">{secret}</span>
            <CopyButton value={secret.replace(/\s/g, "")} label="Copy setup key" toastLabel="Setup key copied" />
          </div>
        </div>
      </div>
      <Field label="6-digit code" htmlFor="tfa-code" error={error} hint="Any 6 digits work in this demo.">
        <Input
          id="tfa-code"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="123 456"
          value={code}
          invalid={!!error}
          className="num text-lg tracking-[0.3em]"
          onChange={(e) => {
            setCode(e.target.value.replace(/\D/g, "").slice(0, 6));
            setError(null);
          }}
        />
      </Field>
      <Button type="submit" fullWidth size="lg" iconLeft={<ShieldCheck className="size-4" />}>
        Enable 2FA
      </Button>
    </form>
  );
}

function SecurityCard() {
  const twoFactor = useDemoStore((s) => s.settings.twoFactor);
  const email = useDemoStore((s) => s.session?.email ?? "trader@example.com");
  const [modal, setModal] = useState({ open: false, key: 0 });
  const [sessions, setSessions] = useState([
    { id: "s1", icon: Monitor, name: "Windows · Edge", where: "London, UK", when: "Active now", current: true },
    { id: "s2", icon: Smartphone, name: "iPhone 16 · Safari", where: "Dubai, AE", when: "2 hours ago", current: false },
    { id: "s3", icon: Monitor, name: "macOS · Chrome", where: "Lisbon, PT", when: "3 days ago", current: false },
  ]);

  return (
    <Card title="Security" icon={<ShieldCheck />} aside={twoFactor ? <Badge tone="passed">2FA on</Badge> : <Badge tone="warning">2FA off</Badge>}>
      <div className="flex items-center justify-between gap-4 rounded-xl border border-line bg-white/[0.02] p-4">
        <div>
          <p className="text-sm font-medium">Two-factor authentication</p>
          <p className="text-xs text-muted">Protect sign-ins and payout requests with an authenticator app.</p>
        </div>
        <Switch
          checked={twoFactor}
          label="Two-factor authentication"
          onChange={(v) => {
            if (v) setModal((m) => ({ open: true, key: m.key + 1 }));
            else {
              useDemoStore.getState().updateSettings({ twoFactor: false });
              toast.warning("Two-factor authentication disabled", "We recommend keeping 2FA on for payouts.");
            }
          }}
        />
      </div>

      <p className="mb-2 mt-6 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Active sessions</p>
      <ul className="space-y-2">
        <AnimatePresence initial={false}>
          {sessions.map((s) => (
            <motion.li
              key={s.id}
              layout
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center justify-between gap-3 rounded-xl border border-line px-3.5 py-3"
            >
              <span className="flex items-center gap-3">
                <s.icon className="size-4 text-muted" />
                <span>
                  <span className="block text-sm font-medium">{s.name}</span>
                  <span className="block text-xs text-muted">
                    {s.where} · {s.when}
                  </span>
                </span>
              </span>
              {s.current ? (
                <Badge tone="active" pulse>
                  This device
                </Badge>
              ) : (
                <Button
                  size="sm"
                  variant="ghost"
                  iconLeft={<LogOut className="size-3.5" />}
                  onClick={() => {
                    setSessions((list) => list.filter((x) => x.id !== s.id));
                    toast.success("Session signed out", `${s.name} in ${s.where} was logged out.`);
                  }}
                >
                  Sign out
                </Button>
              )}
            </motion.li>
          ))}
        </AnimatePresence>
      </ul>

      <Modal
        open={modal.open}
        onClose={() => setModal((m) => ({ ...m, open: false }))}
        title="Set up two-factor authentication"
        description="Add NovaEdge to your authenticator app."
        size="md"
      >
        <TwoFactorSetup key={modal.key} email={email} onDone={() => setModal((m) => ({ ...m, open: false }))} />
      </Modal>
    </Card>
  );
}

/* ───────────── KYC ───────────── */

const KYC_STEPS = [
  { title: "Identity document", icon: FileUp, action: "Upload document", busy: "Uploading…" },
  { title: "Selfie liveness check", icon: Camera, action: "Take selfie", busy: "Scanning face…" },
  { title: "Review", icon: ScanFace, action: "Submit for review", busy: "Verifying with our partner…" },
];

function KycFlow({ onDone }: { onDone: () => void }) {
  const [step, setStep] = useState(0);
  const [busy, setBusy] = useState(false);
  const [doc, setDoc] = useState<"passport" | "id" | "license">("passport");
  const [done, setDone] = useState(false);

  const advance = () => {
    setBusy(true);
    setTimeout(
      () => {
        setBusy(false);
        if (step < KYC_STEPS.length - 1) {
          setStep((s) => s + 1);
          return;
        }
        const before = useDemoStore.getState().accounts.length;
        useDemoStore.getState().completeKyc();
        const created = useDemoStore.getState().accounts.length > before;
        setDone(true);
        toast.success("Identity verified", created ? "Your funded account was created — see Accounts." : "Payouts and funded accounts are unlocked.");
      },
      step === KYC_STEPS.length - 1 ? 1600 : 1100,
    );
  };

  if (done) {
    return (
      <div className="py-4 text-center">
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 16 }}
          className="mx-auto grid size-16 place-items-center rounded-2xl bg-gradient-brand text-ink shadow-[0_0_40px_-6px_var(--accent-2)]"
        >
          <BadgeCheck className="size-8" />
        </motion.div>
        <p className="mt-4 text-lg font-semibold">You’re verified</p>
        <p className="mt-1 text-sm text-muted">Funded accounts and payouts are unlocked for {brand.shortName}.</p>
        <Button className="mt-6" onClick={onDone}>
          Done
        </Button>
      </div>
    );
  }

  const current = KYC_STEPS[step];
  return (
    <div className="space-y-5">
      <ol className="grid grid-cols-3 gap-2">
        {KYC_STEPS.map((s, i) => (
          <li
            key={s.title}
            className={cn(
              "rounded-xl border px-3 py-2.5 text-xs transition-all",
              i < step ? "border-accent-1/30 bg-accent-1/[0.06] text-fg" : i === step ? "border-accent-2/50 bg-accent-2/[0.08] text-fg" : "border-line text-muted",
            )}
          >
            <span className="flex items-center gap-1.5 font-semibold">
              {i < step ? <Check className="size-3.5 text-accent-1" /> : <s.icon className="size-3.5" />}
              Step {i + 1}
            </span>
            <span className="mt-0.5 block">{s.title}</span>
          </li>
        ))}
      </ol>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.25 }}
          className="rounded-2xl border border-line bg-[#080c15] p-5"
        >
          {step === 0 && (
            <div className="space-y-4">
              <Segmented
                size="sm"
                fullWidth
                ariaLabel="Document type"
                options={[
                  { value: "passport" as const, label: "Passport" },
                  { value: "id" as const, label: "ID card" },
                  { value: "license" as const, label: "Driver’s license" },
                ]}
                value={doc}
                onChange={setDoc}
              />
              <div className="grid place-items-center rounded-xl border border-dashed border-line-strong px-4 py-8 text-center">
                <FileUp className="size-6 text-muted" />
                <p className="mt-2 text-sm">Front of your {doc === "passport" ? "passport photo page" : doc === "id" ? "ID card" : "driver’s license"}</p>
                <p className="text-xs text-muted">JPG, PNG or PDF · max 10 MB · processed by our KYC partner</p>
              </div>
            </div>
          )}
          {step === 1 && (
            <div className="grid place-items-center py-4 text-center">
              <div className="relative grid size-28 place-items-center rounded-full border border-line-strong">
                {busy && <span className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-accent-2" />}
                <ScanFace className="size-10 text-muted" />
              </div>
              <p className="mt-3 text-sm">Look straight at the camera in good light.</p>
            </div>
          )}
          {step === 2 && (
            <ul className="space-y-2 text-sm">
              {["Document authenticity", "Face match", "Sanctions & PEP screening", "Restricted-country check"].map((c) => (
                <li key={c} className="flex items-center justify-between">
                  <span className="text-fg/85">{c}</span>
                  {busy ? <Loader2 className="size-4 animate-spin text-accent-2" /> : <span className="text-xs text-muted">Ready</span>}
                </li>
              ))}
            </ul>
          )}
        </motion.div>
      </AnimatePresence>

      <Button fullWidth size="lg" loading={busy} onClick={advance}>
        {busy ? current.busy : current.action}
      </Button>
    </div>
  );
}

function KycCard() {
  const kyc = useDemoStore((s) => s.kycStatus);
  const [modal, setModal] = useState({ open: false, key: 0 });
  const verified = kyc === "verified";
  return (
    <Card id="kyc" title="Identity verification (KYC)" icon={<BadgeCheck />} aside={verified ? <Badge tone="passed">Verified ✓</Badge> : <Badge tone="warning" pulse>Action needed</Badge>}>
      {verified ? (
        <div className="space-y-3 text-sm">
          <p className="text-muted">Your identity is verified. Payouts and funded accounts are unlocked.</p>
          <ul className="space-y-2">
            {["Passport · verified", "Selfie liveness · passed", "Sanctions screening · clear"].map((d) => (
              <li key={d} className="flex items-center gap-2 text-fg/85">
                <Check className="size-4 text-profit" /> {d}
              </li>
            ))}
          </ul>
        </div>
      ) : (
        <div>
          <p className="text-sm text-muted">
            Verify once to unlock funded accounts and payouts. Your passed <span className="text-fg">$50K 1-Step</span> is waiting for this step.
          </p>
          <ul className="mt-4 space-y-2 text-sm">
            {KYC_STEPS.map((s) => (
              <li key={s.title} className="flex items-center gap-2 text-fg/85">
                <s.icon className="size-4 text-muted" /> {s.title}
              </li>
            ))}
          </ul>
          <Button className="mt-5" onClick={() => setModal((m) => ({ open: true, key: m.key + 1 }))} iconLeft={<ShieldCheck className="size-4" />}>
            Start verification
          </Button>
          <p className="mt-2 text-xs text-muted">Takes about 2 minutes · powered by our KYC partner</p>
        </div>
      )}
      <Modal
        open={modal.open}
        onClose={() => setModal((m) => ({ ...m, open: false }))}
        title="Verify your identity"
        description="Three quick steps — this demo simulates each check."
        size="md"
      >
        <KycFlow key={modal.key} onDone={() => setModal((m) => ({ ...m, open: false }))} />
      </Modal>
    </Card>
  );
}

/* ───────────── Wallet ───────────── */

function WalletCard() {
  const connection = useWalletStore((s) => s.connection);
  const { openModal, disconnect } = useWalletStore.getState();
  return (
    <Card
      title="Connected wallet"
      icon={<Wallet />}
      aside={connection ? <Badge tone="passed">Connected</Badge> : <Badge tone="neutral">Not connected</Badge>}
    >
      {connection ? (
        <div className="space-y-4">
          <div className="flex items-center gap-3 rounded-xl border border-line bg-white/[0.02] p-3">
            <WalletIcon id={connection.walletId} icon={connection.icon} className="size-10" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">
                {connection.name} <span className="font-normal text-muted">· {networkName(connection)}</span>
              </p>
              <p className="num truncate text-xs text-muted" title={connection.address}>
                {connection.address}
              </p>
            </div>
            <CopyButton value={connection.address} label="Copy address" toastLabel="Address copied" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" size="sm" onClick={openModal}>
              Switch wallet
            </Button>
            <Button variant="danger" size="sm" onClick={() => void disconnect()}>
              Disconnect
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-muted">
            Connect MetaMask, Phantom or another browser wallet to pay for challenges in crypto and receive payouts on-chain.
          </p>
          <Button size="sm" iconLeft={<Wallet className="size-4" />} onClick={openModal}>
            Connect wallet
          </Button>
        </div>
      )}
    </Card>
  );
}

export function SettingsView() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Settings</h2>
        <p className="text-sm text-muted">Profile, security, wallet, notifications and identity verification.</p>
      </div>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="space-y-4">
          <ProfileCard />
          <NotificationsCard />
        </div>
        <div className="space-y-4">
          <KycCard />
          <WalletCard />
          <SecurityCard />
        </div>
      </div>
    </div>
  );
}
