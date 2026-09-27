import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/AuthForms";
import { Skeleton } from "@/components/ui/Misc";

export const metadata: Metadata = { title: "Log in" };

export default function LoginPage() {
  return (
    <Suspense fallback={<Skeleton className="h-[520px] w-full rounded-3xl" />}>
      <LoginForm />
    </Suspense>
  );
}
