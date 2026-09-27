import type { Metadata } from "next";
import { AccountDetailView } from "@/components/dashboard/AccountDetailView";

export const metadata: Metadata = { title: "Account details" };

export default function AccountDetailPage() {
  return <AccountDetailView />;
}
