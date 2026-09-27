import type { Metadata } from "next";
import { OverviewView } from "@/components/dashboard/OverviewView";

export const metadata: Metadata = { title: "Overview" };

export default function DashboardPage() {
  return <OverviewView />;
}
