import type { Metadata, Viewport } from "next";
import { Geist, JetBrains_Mono } from "next/font/google";
import { Providers } from "@/components/Providers";
import { brand, buildPaletteCss, buildPaletteScript } from "@/config/brand";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `${brand.name} — Trade up to $200,000 of our capital`,
    template: `%s · ${brand.name}`,
  },
  description: brand.description,
  applicationName: brand.name,
  openGraph: {
    title: `${brand.name} — ${brand.tagline}`,
    description: brand.description,
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#05070D",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-palette={brand.defaultPalette}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${geist.variable} ${jetbrains.variable}`}
    >
      <head>
        <style dangerouslySetInnerHTML={{ __html: buildPaletteCss() }} />
        <script dangerouslySetInnerHTML={{ __html: buildPaletteScript() }} />
      </head>
      <body className="grain">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
