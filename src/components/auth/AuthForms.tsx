"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "motion/react";
import { ArrowRight, Eye, EyeOff, Lock, Mail, User, Zap } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Field, Input, Select } from "@/components/ui/Field";
import { Checkbox } from "@/components/ui/Toggle";
import { COUNTRIES, flag } from "@/data/countries";
import { cn } from "@/lib/cn";
import { useDemoStore } from "@/lib/store";
import { toast } from "@/lib/toast";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function safeNext(next: string | null): string {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/dashboard";
}

function nameFromEmail(email: string): string {
  const local = email.split("@")[0] ?? "Trader";
  const parts = local.split(/[._-]+/).filter(Boolean);
  const name = parts.map((p) => p[0].toUpperCase() + p.slice(1).toLowerCase()).join(" ");
  return name || "Trader";
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="size-4" aria-hidden>
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.2 1.3-1.6 3.9-5.5 3.9-3.3 0-6-2.7-6-6.1s2.7-6.1 6-6.1c1.9 0 3.1.8 3.8 1.5l2.6-2.5C16.8 3.3 14.6 2.4 12 2.4 6.7 2.4 2.4 6.7 2.4 12s4.3 9.6 9.6 9.6c5.5 0 9.2-3.9 9.2-9.4 0-.6-.1-1.1-.2-1.6H12z" />
    </svg>
  );
}

function PasswordInput({ id, value, onChange, invalid, autoComplete }: { id: string; value: string; onChange: (v: string) => void; invalid?: boolean; autoComplete: string }) {
  const [show, setShow] = useState(false);
  return (
    <Input
      id={id}
      type={show ? "text" : "password"}
      autoComplete={autoComplete}
      placeholder="••••••••"
      value={value}
      invalid={invalid}
      icon={<Lock />}
      onChange={(e) => onChange(e.target.value)}
      trailing={
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="grid size-8 place-items-center rounded-lg text-muted hover:bg-white/[0.06] hover:text-fg"
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      }
    />
  );
}

function Divider() {
  return (
    <div className="my-6 flex items-center gap-3 text-xs text-muted">
      <span className="h-px flex-1 bg-line" /> or <span className="h-px flex-1 bg-line" />
    </div>
  );
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = safeNext(params.get("next"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [loading, setLoading] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};
    if (!EMAIL.test(email.trim())) errs.email = "Enter a valid email address.";
    if (password.length < 4) errs.password = "Password must be at least 4 characters.";
    setErrors(errs);
    if (errs.email || errs.password) return;
    setLoading(true);
    setTimeout(() => {
      useDemoStore.getState().login({ name: nameFromEmail(email.trim()), email: email.trim(), country: "GB" });
      toast.success("Welcome back", "Signed in to the demo dashboard.");
      router.push(next);
    }, 850);
  };

  const demo = () => {
    useDemoStore.getState().loginDemo();
    toast.success("Signed in as Demo Trader", "Alex Morgan · 3 accounts loaded.");
    router.push(next);
  };

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-[-0.035em]">Welcome back</h1>
      <p className="mt-2 text-sm text-muted">Log in to track your accounts, objectives and rewards.</p>

      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Button onClick={demo} size="lg" fullWidth className="mt-7" iconLeft={<Zap className="size-4" />}>
          Continue as Demo Trader
        </Button>
        <p className="mt-2 text-center text-xs text-muted">Any email and password also work in this demo.</p>
      </motion.div>

      <Divider />

      <form onSubmit={submit} noValidate className="space-y-4">
        <Field label="Email" htmlFor="login-email" error={errors.email}>
          <Input
            id="login-email"
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            icon={<Mail />}
            value={email}
            invalid={!!errors.email}
            onChange={(e) => {
              setEmail(e.target.value);
              setErrors((x) => ({ ...x, email: undefined }));
            }}
          />
        </Field>
        <Field
          label="Password"
          htmlFor="login-password"
          error={errors.password}
          aside={
            <button
              type="button"
              className="text-xs font-medium text-accent-2 hover:underline"
              onClick={() => {
                if (!EMAIL.test(email.trim())) {
                  setErrors((x) => ({ ...x, email: "Enter your email first to reset your password." }));
                  return;
                }
                toast.info("Reset link sent", `Check ${email.trim()} for a password reset link.`);
              }}
            >
              Forgot password?
            </button>
          }
        >
          <PasswordInput
            id="login-password"
            autoComplete="current-password"
            value={password}
            invalid={!!errors.password}
            onChange={(v) => {
              setPassword(v);
              setErrors((x) => ({ ...x, password: undefined }));
            }}
          />
        </Field>
        <Checkbox id="login-remember" checked={remember} onChange={setRemember}>
          Keep me signed in on this device
        </Checkbox>
        <Button type="submit" variant="secondary" size="lg" fullWidth loading={loading} iconRight={!loading ? <ArrowRight className="size-4" /> : undefined}>
          {loading ? "Signing in…" : "Log in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        New to the platform?{" "}
        <Link href="/signup" className="font-medium text-fg hover:text-accent-1">
          Create an account
        </Link>
      </p>
    </div>
  );
}

function strength(pw: string): { score: 0 | 1 | 2 | 3 | 4; label: string } {
  if (!pw) return { score: 0, label: "Use 8+ characters with a mix of letters, numbers and symbols" };
  let s = 0;
  if (pw.length >= 8) s++;
  if (pw.length >= 12) s++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^A-Za-z0-9]/.test(pw)) s++;
  const score = Math.max(1, Math.min(4, s - (pw.length < 8 ? 1 : 0))) as 1 | 2 | 3 | 4;
  return { score, label: ["", "Weak", "Fair", "Good", "Strong"][score] };
}

const BAR = ["", "bg-loss", "bg-warning", "bg-accent-2", "bg-gradient-brand"];
const TXT = ["text-muted", "text-loss", "text-warning", "text-accent-2", "text-accent-1"];

export function SignupForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [country, setCountry] = useState("");
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string | undefined>>({});
  const [loading, setLoading] = useState<"form" | "google" | null>(null);
  const st = strength(password);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string | undefined> = {};
    if (name.trim().length < 2) errs.name = "Enter your full name.";
    if (!EMAIL.test(email.trim())) errs.email = "Enter a valid email address.";
    if (password.length < 8) errs.password = "Use at least 8 characters.";
    if (!country) errs.country = "Select your country.";
    if (!terms) errs.terms = "Please accept the terms to continue.";
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;
    setLoading("form");
    setTimeout(() => {
      useDemoStore.getState().login({ name: name.trim(), email: email.trim(), country });
      toast.success("Account created", "Welcome to NovaEdge — pick your first challenge any time.");
      router.push("/dashboard");
    }, 900);
  };

  const google = () => {
    setLoading("google");
    setTimeout(() => {
      useDemoStore.getState().loginDemo();
      toast.success("Signed up with Google", "Demo account connected.");
      router.push("/dashboard");
    }, 900);
  };

  return (
    <div>
      <h1 className="text-3xl font-semibold tracking-[-0.035em]">Create your account</h1>
      <p className="mt-2 text-sm text-muted">Start your first challenge in under two minutes.</p>

      <Button onClick={google} variant="secondary" size="lg" fullWidth className="mt-7" loading={loading === "google"} iconLeft={loading === "google" ? undefined : <GoogleMark />}>
        Sign up with Google
      </Button>

      <Divider />

      <form onSubmit={submit} noValidate className="space-y-4">
        <Field label="Full name" htmlFor="su-name" error={errors.name}>
          <Input id="su-name" autoComplete="name" placeholder="Alex Morgan" icon={<User />} value={name} invalid={!!errors.name} onChange={(e) => { setName(e.target.value); setErrors((x) => ({ ...x, name: undefined })); }} />
        </Field>
        <Field label="Email" htmlFor="su-email" error={errors.email}>
          <Input id="su-email" type="email" autoComplete="email" placeholder="you@example.com" icon={<Mail />} value={email} invalid={!!errors.email} onChange={(e) => { setEmail(e.target.value); setErrors((x) => ({ ...x, email: undefined })); }} />
        </Field>
        <Field label="Password" htmlFor="su-password" error={errors.password}>
          <PasswordInput id="su-password" autoComplete="new-password" value={password} invalid={!!errors.password} onChange={(v) => { setPassword(v); setErrors((x) => ({ ...x, password: undefined })); }} />
          <div className="mt-2 flex gap-1.5" aria-hidden>
            {[1, 2, 3, 4].map((i) => (
              <span key={i} className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.07]">
                <motion.span
                  className={cn("block h-full rounded-full", BAR[st.score])}
                  initial={false}
                  animate={{ width: st.score >= i ? "100%" : "0%" }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                />
              </span>
            ))}
          </div>
          <p className={cn("mt-1.5 text-xs transition-colors", TXT[st.score])} aria-live="polite">
            {st.score ? `Password strength: ${st.label}` : st.label}
          </p>
        </Field>
        <Field label="Country of residence" htmlFor="su-country" error={errors.country}>
          <Select id="su-country" value={country} invalid={!!errors.country} onChange={(e) => { setCountry(e.target.value); setErrors((x) => ({ ...x, country: undefined })); }}>
            <option value="">Select country</option>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {flag(c.code)} {c.name}
              </option>
            ))}
          </Select>
        </Field>
        <div>
          <Checkbox id="su-terms" checked={terms} invalid={!!errors.terms} onChange={(v) => { setTerms(v); setErrors((x) => ({ ...x, terms: undefined })); }}>
            I agree to the Terms &amp; Conditions and confirm I understand all accounts are simulated.
          </Checkbox>
          {errors.terms && <p role="alert" className="mt-1.5 text-xs text-loss">{errors.terms}</p>}
        </div>
        <Button type="submit" size="lg" fullWidth loading={loading === "form"} iconRight={loading ? undefined : <ArrowRight className="size-4" />}>
          {loading === "form" ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Already trading with us?{" "}
        <Link href="/login" className="font-medium text-fg hover:text-accent-1">
          Log in
        </Link>
      </p>
    </div>
  );
}
