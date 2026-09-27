/** Slide the form side between login ↔ signup while the animated panel stays mounted. */
export default function AuthTemplate({ children }: { children: React.ReactNode }) {
  return <div className="page-in">{children}</div>;
}
