import { Award, LayoutDashboard, Layers, Settings, Trophy, Users, Wallet } from "lucide-react";

export const DASH_NAV = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/accounts", label: "Accounts", icon: Layers },
  { href: "/dashboard/payouts", label: "Payouts", icon: Wallet },
  { href: "/dashboard/certificates", label: "Certificates", icon: Award },
  { href: "/dashboard/affiliate", label: "Affiliate", icon: Users },
  { href: "/dashboard/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
] as const;

export function isNavActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function pageTitle(pathname: string): string {
  if (pathname.startsWith("/dashboard/accounts/")) return "Account details";
  const hit = DASH_NAV.find((n) => isNavActive(pathname, n.href));
  return hit?.label ?? "Dashboard";
}
