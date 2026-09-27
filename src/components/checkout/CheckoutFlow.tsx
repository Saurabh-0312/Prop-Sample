"use client";

import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  Bitcoin,
  Check,
  CreditCard,
  Loader2,
  Lock,
  ShieldCheck,
  Sparkles,
  Tag,
  Zap,
} from "lucide-react";
import { NumberRoll } from "@/components/fx/NumberRoll";
import { celebrate } from "@/components/fx/Confetti";
import { LegalModal, type LegalDoc } from "@/components/marketing/LegalModal";
import { SizePicker } from "@/components/marketing/SizePicker";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { Container, Eyebrow } from "@/components/ui/Misc";
import { Modal } from "@/components/ui/Modal";
import { Segmented } from "@/components/ui/Segmented";
import { Checkbox, Switch } from "@/components/ui/Toggle";
import { brand } from "@/config/brand";
import { COUNTRIES, flag } from "@/data/countries";
import {
  ADD_ONS,
  MODELS,
  MODEL_IDS,
  getPlanPrice,
  hasPromo,
  isAccountSize,
  isModelId,
  planLabel,
  type AccountSize,
  type AddOnId,
  type ModelId,
} from "@/data/plans";
import { cn } from "@/lib/cn";
import { formatUSD } from "@/lib/format";
import { useDemoStore } from "@/lib/store";
import { toast } from "@/lib/toast";
import { PLATFORMS, type Platform, type TradingAccount } from "@/lib/types";
import { CheckoutSuccess } from "./CheckoutSuccess";

const ADD_ON_IDS = ADD_ONS.map((a) => a.id);
const isAddOnId = (v: string): v is AddOnId => (ADD_ON_IDS as string[]).includes(v);

const PROCESS_STEPS = ["Confirming payment…", "Creating your trading account…", "Applying risk rules…"];
const STEP_MS = 720;

type Fields = "name" | "email" | "country" | "card" | "expiry" | "cvc" | "terms";

function luhn(num: string): boolean {
  let sum = 0;
  let dbl = false;
  for (let i = num.length - 1; i >= 0; i--) {
    let d = Number(num[i]);
    if (dbl) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
    dbl = !dbl;
  }
  return sum % 10 === 0;
}

function Section({ step, title, children, aside }: { step: number; title: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="card rounded-3xl p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-3 text-base font-semibold">
          <span className="num grid size-7 place-items-center rounded-lg bg-gradient-brand text-xs text-ink">{step}</span>
          {title}
        </h2>
        {aside}
      </div>
      {children}
    </section>
  );
}

export function CheckoutFlow() {
  const params = useSearchParams();
  const router = useRouter();
  const rawModel = params.get("model");
  const rawSize = Number(params.get("size"));
  const model: ModelId = isModelId(rawModel) ? rawModel : "two-step";
  const size: AccountSize = isAccountSize(rawSize) ? rawSize : 100000;
  const m = MODELS[model];

  const session = useDemoStore((s) => s.session);

  const [addOns, setAddOns] = useState<AddOnId[]>(() =>
    (params.get("addons") ?? "").split(",").filter(isAddOnId),
  );
  const [platform, setPlatform] = useState<Platform>("MetaTrader 5");
  const [name, setName] = useState<string | null>(null);
  const [email, setEmail] = useState<string | null>(null);
  const [country, setCountry] = useState<string | null>(null);
  const [method, setMethod] = useState<"card" | "crypto">("card");
  const [card, setCard] = useState({ number: "", expiry: "", cvc: "" });
  const [network, setNetwork] = useState("USDT · TRC20");
  const [terms, setTerms] = useState(false);
  const [couponInput, setCouponInput] = useState("");
  const [coupon, setCoupon] = useState<string | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [shake, setShake] = useState(0);
  const [errors, setErrors] = useState<Partial<Record<Fields, string>>>({});
  const [stage, setStage] = useState<"form" | "processing" | "success">("form");
  const [procStep, setProcStep] = useState(0);
  const [account, setAccount] = useState<TradingAccount | null>(null);
  const [paid, setPaid] = useState(0);
  const [legal, setLegal] = useState<LegalDoc | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  // Untouched fields fall back to the logged-in trader's profile.
  const vName = name ?? session?.name ?? "";
  const vEmail = email ?? session?.email ?? "";
  const vCountry = country ?? session?.country ?? "";

  const price = getPlanPrice(model, size, addOns);
  const couponPct = coupon ? brand.coupon.pct / 100 : 0;
  const couponSavings = Math.round(price.price * couponPct * 100) / 100;
  const total = Math.round((price.price - couponSavings) * 100) / 100;

  const setPlan = (nextModel: ModelId, nextSize: AccountSize) => {
    const q = new URLSearchParams({ model: nextModel, size: String(nextSize) });
    if (addOns.length) q.set("addons", addOns.join(","));
    router.replace(`/checkout?${q.toString()}`, { scroll: false });
  };

  const validate = (): Partial<Record<Fields, string>> => {
    const e: Partial<Record<Fields, string>> = {};
    if (vName.trim().length < 2 || !/[a-zA-Z]/.test(vName)) e.name = "Enter your full name.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(vEmail.trim())) e.email = "Enter a valid email address.";
    if (!vCountry) e.country = "Select your country of residence.";
    if (method === "card") {
      const digits = card.number.replace(/\s/g, "");
      if (digits.length < 15 || !luhn(digits)) e.card = "Enter a valid card number.";
      const [mm, yy] = card.expiry.split("/").map(Number);
      const now = new Date();
      const expired = !mm || !yy || mm < 1 || mm > 12 || 2000 + yy < now.getFullYear() || (2000 + yy === now.getFullYear() && mm < now.getMonth() + 1);
      if (expired) e.expiry = "Enter a valid expiry (MM/YY).";
      if (!/^\d{3,4}$/.test(card.cvc)) e.cvc = "3–4 digits.";
    }
    if (!terms) e.terms = "Please accept the terms to continue.";
    return e;
  };

  const clearError = (f: Fields) => setErrors((e) => (e[f] ? { ...e, [f]: undefined } : e));

  const applyCoupon = () => {
    const code = couponInput.trim().toUpperCase();
    if (!code) {
      setCouponError("Enter a coupon code.");
      setShake((n) => n + 1);
      return;
    }
    if (code === brand.coupon.code) {
      setCoupon(code);
      setCouponError(null);
      toast.success(`${code} applied`, `${brand.coupon.pct}% off your order.`);
    } else {
      setCoupon(null);
      setCouponError(`“${code}” isn’t a valid code. Try ${brand.coupon.code}.`);
      setShake((n) => n + 1);
    }
  };

  const onPay = (ev?: FormEvent) => {
    ev?.preventDefault();
    const e = validate();
    setErrors(e);
    const first = (Object.keys(e) as Fields[]).find((k) => e[k]);
    if (first) {
      toast.error("Please check the highlighted fields");
      const el = document.getElementById(`co-${first}`);
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      if (el instanceof HTMLInputElement || el instanceof HTMLSelectElement) setTimeout(() => el.focus({ preventScroll: true }), 350);
      return;
    }
    setStage("processing");
    setProcStep(0);
    PROCESS_STEPS.forEach((_, i) => {
      timers.current.push(setTimeout(() => setProcStep(i + 1), STEP_MS * (i + 1)));
    });
    timers.current.push(
      setTimeout(() => {
        const acc = useDemoStore.getState().purchaseAccount({
          model,
          size,
          platform,
          addOns,
          amount: total,
          method,
          coupon: coupon ?? undefined,
          session: { name: vName.trim(), email: vEmail.trim(), country: vCountry },
        });
        setPaid(total);
        setAccount(acc);
        setStage("success");
        window.scrollTo({ top: 0, behavior: "smooth" });
        setTimeout(() => celebrate(), 250);
      }, STEP_MS * PROCESS_STEPS.length + 380),
    );
  };

  if (stage === "success" && account) {
    return <CheckoutSuccess account={account} paid={paid} email={vEmail} />;
  }

  return (
    <Container className="py-8 sm:py-12">
      <div className="mb-8">
        <Eyebrow>Checkout</Eyebrow>
        <h1 className="mt-4 text-3xl font-semibold tracking-[-0.035em] sm:text-4xl">Complete your order</h1>
        <p className="mt-2 text-muted">Your trading account is created the moment payment is confirmed.</p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.4fr_1fr] lg:items-start">
        <form id="checkout-form" onSubmit={onPay} noValidate className="space-y-5">
          <Section step={1} title="Your challenge" aside={<span className="text-xs text-muted">Change anytime</span>}>
            <Segmented
              pill="gradient"
              fullWidth
              ariaLabel="Challenge model"
              options={MODEL_IDS.map((id) => ({ value: id, label: MODELS[id].shortName }))}
              value={model}
              onChange={(v) => setPlan(v, size)}
            />
            <SizePicker value={size} onChange={(s) => setPlan(model, s)} compact className="mt-3" />
            <p className="mb-2 mt-5 text-[13px] font-medium text-fg/90">Trading platform</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {PLATFORMS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlatform(p)}
                  aria-pressed={platform === p}
                  className={cn(
                    "rounded-xl border px-3 py-2.5 text-[13px] font-medium transition-all",
                    platform === p
                      ? "border-accent-2/50 bg-accent-2/10 text-fg shadow-[0_0_20px_-8px_var(--accent-2)]"
                      : "border-line bg-white/[0.02] text-muted hover:border-white/15 hover:text-fg",
                  )}
                >
                  {p}
                </button>
              ))}
            </div>
          </Section>

          <Section step={2} title="Account details">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field label="Full name" htmlFor="co-name" error={errors.name} className="sm:col-span-2">
                <Input
                  id="co-name"
                  autoComplete="name"
                  placeholder="Alex Morgan"
                  value={vName}
                  invalid={!!errors.name}
                  onChange={(e) => {
                    setName(e.target.value);
                    clearError("name");
                  }}
                />
              </Field>
              <Field label="Email" htmlFor="co-email" error={errors.email} hint="Your credentials are sent here.">
                <Input
                  id="co-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={vEmail}
                  invalid={!!errors.email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    clearError("email");
                  }}
                />
              </Field>
              <Field label="Country of residence" htmlFor="co-country" error={errors.country}>
                <Select
                  id="co-country"
                  value={vCountry}
                  invalid={!!errors.country}
                  onChange={(e) => {
                    setCountry(e.target.value);
                    clearError("country");
                  }}
                >
                  <option value="">Select country</option>
                  {COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>
                      {flag(c.code)} {c.name}
                    </option>
                  ))}
                </Select>
              </Field>
            </div>
          </Section>

          <Section step={3} title="Payment method" aside={<Lock className="size-4 text-muted" />}>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {(
                [
                  { id: "card", title: "Card", sub: "Visa · Mastercard · Amex", icon: CreditCard },
                  { id: "crypto", title: "Crypto", sub: "USDT · USDC", icon: Bitcoin },
                ] as const
              ).map((o) => {
                const active = method === o.id;
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => setMethod(o.id)}
                    aria-pressed={active}
                    className={cn(
                      "relative flex items-center gap-3 rounded-2xl border p-4 text-left transition-all duration-300",
                      active
                        ? "border-accent-2/50 bg-accent-2/[0.08] shadow-[0_0_30px_-12px_var(--accent-2)]"
                        : "border-line bg-white/[0.02] hover:border-white/15",
                    )}
                  >
                    <span className={cn("grid size-10 place-items-center rounded-xl", active ? "bg-gradient-brand text-ink" : "bg-white/[0.05] text-muted")}>
                      <o.icon className="size-5" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">{o.title}</span>
                      <span className="block text-xs text-muted">{o.sub}</span>
                    </span>
                    <span
                      className={cn(
                        "absolute right-4 top-4 grid size-5 place-items-center rounded-full border transition-all",
                        active ? "border-transparent bg-accent-2 text-ink" : "border-line-strong",
                      )}
                    >
                      {active && <Check className="size-3" strokeWidth={3} />}
                    </span>
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait" initial={false}>
              {method === "card" ? (
                <motion.div
                  key="card"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22 }}
                  className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-[1fr_120px_100px]"
                >
                  <Field
                    label="Card number"
                    htmlFor="co-card"
                    error={errors.card}
                    aside={
                      <button
                        type="button"
                        className="text-xs font-medium text-accent-2 hover:underline"
                        onClick={() => {
                          setCard({ number: "4242 4242 4242 4242", expiry: "12/29", cvc: "123" });
                          setErrors((e) => ({ ...e, card: undefined, expiry: undefined, cvc: undefined }));
                        }}
                      >
                        Use test card
                      </button>
                    }
                  >
                    <Input
                      id="co-card"
                      inputMode="numeric"
                      autoComplete="cc-number"
                      placeholder="1234 5678 9012 3456"
                      value={card.number}
                      invalid={!!errors.card}
                      icon={<CreditCard />}
                      onChange={(e) => {
                        const digits = e.target.value.replace(/\D/g, "").slice(0, 16);
                        setCard((c) => ({ ...c, number: digits.replace(/(\d{4})(?=\d)/g, "$1 ") }));
                        clearError("card");
                      }}
                    />
                  </Field>
                  <Field label="Expiry" htmlFor="co-expiry" error={errors.expiry}>
                    <Input
                      id="co-expiry"
                      inputMode="numeric"
                      autoComplete="cc-exp"
                      placeholder="MM/YY"
                      value={card.expiry}
                      invalid={!!errors.expiry}
                      onChange={(e) => {
                        const d = e.target.value.replace(/\D/g, "").slice(0, 4);
                        setCard((c) => ({ ...c, expiry: d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d }));
                        clearError("expiry");
                      }}
                    />
                  </Field>
                  <Field label="CVC" htmlFor="co-cvc" error={errors.cvc}>
                    <Input
                      id="co-cvc"
                      inputMode="numeric"
                      autoComplete="cc-csc"
                      placeholder="123"
                      value={card.cvc}
                      invalid={!!errors.cvc}
                      onChange={(e) => {
                        setCard((c) => ({ ...c, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) }));
                        clearError("cvc");
                      }}
                    />
                  </Field>
                </motion.div>
              ) : (
                <motion.div
                  key="crypto"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22 }}
                  className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2"
                >
                  <Field label="Coin & network" htmlFor="co-network">
                    <Select id="co-network" value={network} onChange={(e) => setNetwork(e.target.value)}>
                      <option>USDT · TRC20</option>
                      <option>USDT · ERC20</option>
                      <option>USDC · ERC20</option>
                      <option>USDC · Solana</option>
                    </Select>
                  </Field>
                  <div className="flex items-start gap-3 rounded-2xl border border-line bg-white/[0.02] p-3.5 text-xs leading-relaxed text-muted">
                    <Zap className="mt-0.5 size-4 shrink-0 text-accent-1" />
                    A one-time payment address is generated when you click Pay. Crypto payments confirm in about a minute
                    and can’t be charged back.
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Section>
        </form>

        {/* Order summary */}
        <aside className="lg:sticky lg:top-6">
          <div className="card rounded-3xl p-5 sm:p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs text-muted">Order summary</p>
                <p className="mt-1 text-lg font-semibold">{planLabel(model, size)} Challenge</p>
                <p className="text-xs text-muted">
                  {m.name} · {platform}
                </p>
              </div>
              {hasPromo(model) && (
                <span className="rounded-full border border-accent-1/30 bg-accent-1/10 px-2 py-0.5 text-[11px] font-semibold text-accent-1">
                  −{brand.promo.pct}%
                </span>
              )}
            </div>

            <div className="mt-5 space-y-3 border-t border-line pt-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">Add-ons</p>
              {ADD_ONS.map((a) => {
                const included = m.included.includes(a.id);
                const on = included || addOns.includes(a.id);
                const cost = Math.round(m.prices[size] * a.pct);
                return (
                  <div key={a.id} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-[13px] font-medium">{a.label}</p>
                      <p className="text-[11px] text-muted">{included ? "Included with Instant Funding" : `+${Math.round(a.pct * 100)}% · +$${cost}`}</p>
                    </div>
                    <Switch
                      checked={on}
                      disabled={included}
                      label={a.label}
                      onChange={(v) => setAddOns((list) => (v ? [...list, a.id] : list.filter((x) => x !== a.id)))}
                    />
                  </div>
                );
              })}
            </div>

            <div className="mt-5 border-t border-line pt-5">
              <label htmlFor="co-coupon" className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted">
                Coupon
              </label>
              <div key={shake} className={cn("mt-2 flex gap-2", shake > 0 && couponError && "shake")}>
                <Input
                  id="co-coupon"
                  placeholder={`Try ${brand.coupon.code}`}
                  value={couponInput}
                  icon={<Tag />}
                  invalid={!!couponError}
                  className={cn("uppercase", coupon && "field-success")}
                  onChange={(e) => {
                    setCouponInput(e.target.value);
                    setCouponError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      applyCoupon();
                    }
                  }}
                />
                {coupon ? (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setCoupon(null);
                      setCouponInput("");
                    }}
                  >
                    Remove
                  </Button>
                ) : (
                  <Button variant="secondary" onClick={applyCoupon}>
                    Apply
                  </Button>
                )}
              </div>
              <AnimatePresence initial={false}>
                {couponError && (
                  <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} role="alert" className="mt-2 text-xs text-loss">
                    {couponError}
                  </motion.p>
                )}
                {coupon && (
                  <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="mt-2 flex items-center gap-1.5 text-xs text-accent-1">
                    <Sparkles className="size-3.5" /> {coupon} applied — {brand.coupon.pct}% off
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            <dl className="mt-5 space-y-2.5 border-t border-line pt-5 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Challenge fee</dt>
                <dd className="num">{formatUSD(m.prices[size])}</dd>
              </div>
              {price.addOnTotal > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted">Add-ons</dt>
                  <dd className="num">+{formatUSD(price.addOnTotal)}</dd>
                </div>
              )}
              {price.promoSavings > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted">{brand.promo.label} −{brand.promo.pct}%</dt>
                  <dd className="num text-accent-1">−{formatUSD(price.promoSavings)}</dd>
                </div>
              )}
              {couponSavings > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted">Coupon {coupon}</dt>
                  <dd className="num text-accent-1">−{formatUSD(couponSavings)}</dd>
                </div>
              )}
              <div className="flex items-end justify-between border-t border-line pt-4">
                <dt className="font-medium">Total due today</dt>
                <dd>
                  <NumberRoll value={total} format="usd" className="text-3xl font-semibold tracking-tight" />
                </dd>
              </div>
            </dl>

            <Checkbox
              id="co-terms"
              checked={terms}
              invalid={!!errors.terms}
              onChange={(v) => {
                setTerms(v);
                clearError("terms");
              }}
              className="mt-5"
            >
              I agree to the{" "}
              <button type="button" className="text-fg underline decoration-line-strong underline-offset-2 hover:decoration-fg" onClick={() => setLegal("terms")}>
                Terms
              </button>
              ,{" "}
              <button type="button" className="text-fg underline decoration-line-strong underline-offset-2 hover:decoration-fg" onClick={() => setLegal("risk")}>
                Risk Disclosure
              </button>{" "}
              and{" "}
              <button type="button" className="text-fg underline decoration-line-strong underline-offset-2 hover:decoration-fg" onClick={() => setLegal("refund")}>
                Refund Policy
              </button>
              , and understand all accounts are simulated.
            </Checkbox>
            {errors.terms && (
              <p id="co-terms-error" role="alert" className="mt-2 text-xs text-loss">
                {errors.terms}
              </p>
            )}

            <Button type="submit" form="checkout-form" size="lg" fullWidth className="mt-5" iconLeft={<Lock className="size-4" />}>
              Pay {formatUSD(total)}
            </Button>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center text-[11px] text-muted">
              <span className="flex flex-col items-center gap-1">
                <ShieldCheck className="size-4 text-accent-2" />
                256-bit TLS
              </span>
              <span className="flex flex-col items-center gap-1">
                <Zap className="size-4 text-accent-2" />
                Instant delivery
              </span>
              <span className="flex flex-col items-center gap-1">
                <Sparkles className="size-4 text-accent-2" />
                {m.feeRefund === "Not refundable" ? "No hidden fees" : "Fee refunded"}
              </span>
            </div>
          </div>
        </aside>
      </div>

      <Modal open={stage === "processing"} onClose={() => {}} locked size="sm">
        <div className="py-2 text-center">
          <div className="relative mx-auto grid size-16 place-items-center">
            <span className="absolute inset-0 animate-spin rounded-full border-2 border-white/10 border-t-accent-2" />
            <Lock className="size-6 text-accent-2" />
          </div>
          <h2 className="mt-5 text-lg font-semibold">Processing your order</h2>
          <p className="mt-1 text-sm text-muted">
            {formatUSD(total)} · {method === "card" ? "Card" : network}
          </p>
          <ul className="mt-6 space-y-3 text-left">
            {PROCESS_STEPS.map((s, i) => {
              const done = procStep > i;
              const active = procStep === i;
              return (
                <li
                  key={s}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-3.5 py-3 text-sm transition-all duration-300",
                    done ? "border-accent-1/30 bg-accent-1/[0.06] text-fg" : active ? "border-line-strong bg-white/[0.04] text-fg" : "border-line text-muted",
                  )}
                >
                  <span className="grid size-6 place-items-center">
                    {done ? (
                      <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} className="grid size-6 place-items-center rounded-full bg-accent-1 text-ink">
                        <Check className="size-3.5" strokeWidth={3} />
                      </motion.span>
                    ) : active ? (
                      <Loader2 className="size-4 animate-spin text-accent-2" />
                    ) : (
                      <span className="size-2 rounded-full bg-white/20" />
                    )}
                  </span>
                  {s}
                </li>
              );
            })}
          </ul>
        </div>
      </Modal>

      <LegalModal doc={legal} onClose={() => setLegal(null)} />
    </Container>
  );
}
