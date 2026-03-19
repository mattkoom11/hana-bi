import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import type { Metadata } from "next";
import { Spectral, Inter, Kalam } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Hana-Bi — Archival Denim",
  description:
    "Hana-Bi is a sustainable denim house documenting each garment like an artifact.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body
        className={`${hanabiSerif.variable} ${hanabiSans.variable} ${hanabiScript.variable} antialiased min-h-screen`}
      >
        <div className="flex min-h-screen flex-col">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
