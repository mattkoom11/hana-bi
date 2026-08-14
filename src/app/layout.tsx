import { VhFix } from "@/components/common/VhFix";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { Spectral, Inter, DM_Mono } from "next/font/google";
import "./globals.css";

// Editorial serif for headers - Spectral (magazine-style, elegant)
// Weight 300 italic is the site's entire display voice — see design/tokens/APPLY.md.
const hanabiSerif = Spectral({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-hanabi-serif",
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

// Clean sans-serif for body text - Inter (readable, modern)
const hanabiSans = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-hanabi-sans",
  weight: ["300", "400", "500", "600"],
});

const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300"],
  variable: "--font-dm-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Hana-Bi — Archival Denim",
  description:
    "Hana-Bi is a sustainable denim house documenting each garment like an artifact.",
  openGraph: {
    title: "Hana-Bi — Archival Denim",
    description:
      "Hana-Bi is a sustainable denim house documenting each garment like an artifact.",
    images: ["/og-default.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${hanabiSerif.variable} ${hanabiSans.variable} ${dmMono.variable} antialiased min-h-screen`}
      >
        <VhFix />
        <Toaster
          position="bottom-right"
          toastOptions={{
            classNames: {
              toast: "bg-[var(--hb-dark-surface)] border border-[var(--hb-dark-border)] text-[#faf8f4]",
              description: "text-[var(--hb-dark-muted)]",
            },
          }}
        />
        {children}
      </body>
    </html>
  );
}
