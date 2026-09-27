import type { Metadata } from "next";
import { AffiliateView } from "@/components/dashboard/AffiliateView";

export const metadata: Metadata = { title: "Affiliate" };

export default function AffiliatePage() {
  return <AffiliateView />;
}
