import type { Metadata } from "next";
import { AccountsListView } from "@/components/dashboard/AccountsListView";

export const metadata: Metadata = { title: "Accounts" };

export default function AccountsPage() {
  return <AccountsListView />;
}
