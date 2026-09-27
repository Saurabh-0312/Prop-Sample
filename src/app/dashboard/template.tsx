/** Fade + slide the page content; the sidebar and top bar stay put. */
export default function DashboardTemplate({ children }: { children: React.ReactNode }) {
  return <div className="page-in">{children}</div>;
}
