import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { VideoBackground } from "@/components/layout/VideoBackground";
import { VhFix } from "@/components/common/VhFix";
import type { Metadata } from "next";
import { Spectral, Inter, Kalam, Cormorant_Garamond, DM_Mono } from "next/font/google";
import "./globals.css";

// Editorial serif for headers - Spectral (magazine-style, elegant)
const hanabiSerif = Spectral({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-hanabi-serif",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

// Clean sans-serif for body text - Inter (readable, modern)
const hanabiSans = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-hanabi-sans",
  weight: ["300", "400", "500", "600"],
});

// Handwritten/script font for captions and delicate notes
const hanabiScript = Kalam({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-hanabi-script",
  weight: ["300", "400"],
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
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
        className={`${hanabiSerif.variable} ${hanabiSans.variable} ${hanabiScript.variable} ${cormorant.variable} ${dmMono.variable} antialiased min-h-screen`}
      >
        <VhFix />
        <VideoBackground />
        {/* Dark ambient overlay — suppresses video to ~20-30% presence */}
        <div className="fixed inset-0 z-0 bg-[#0e0c0b]/60 pointer-events-none" />
        <div className="relative z-10 flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
