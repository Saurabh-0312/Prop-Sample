import type { Metadata } from "next";
import { Suspense } from "react";
import { CheckoutFlow } from "@/components/checkout/CheckoutFlow";
import { Container, Skeleton } from "@/components/ui/Misc";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your challenge purchase — card or crypto.",
};

function CheckoutFallback() {
  return (
    <Container className="grid grid-cols-1 gap-6 py-10 lg:grid-cols-[1.35fr_1fr]">
      <div className="space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-64 w-full rounded-3xl" />
        <Skeleton className="h-72 w-full rounded-3xl" />
      </div>
      <Skeleton className="h-[520px] w-full rounded-3xl" />
    </Container>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<CheckoutFallback />}>
      <CheckoutFlow />
    </Suspense>
  );
}
