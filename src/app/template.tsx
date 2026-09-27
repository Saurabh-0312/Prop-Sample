/**
 * Route transition between top-level sections (site ↔ dashboard ↔ admin ↔ checkout).
 * Opacity only: a transform here would re-anchor fixed sidebars mid-animation.
 * Nested templates add the slide for page content.
 */
export default function RootTemplate({ children }: { children: React.ReactNode }) {
  return <div className="page-fade">{children}</div>;
}
