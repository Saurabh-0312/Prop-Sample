import type { Metadata } from "next";
import { PayoutsView } from "@/components/dashboard/PayoutsView";

export const metadata: Metadata = { title: "Payouts" };

export default function PayoutsPage() {
  return <PayoutsView />;
}
