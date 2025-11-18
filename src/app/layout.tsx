import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import type { Metadata } from "next";
import { Playfair_Display, Space_Grotesk } from "next/font/google";
import "./globals.css";

const hanabiSerif = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-hanabi-serif",
  weight: ["400", "500", "600", "700"],
});

const hanabiSans = Space_Grotesk({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-hanabi-sans",
  weight: ["400", "500", "600", "700"],
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
        className={`${hanabiSerif.variable} ${hanabiSans.variable} antialiased min-h-screen`}
      >
        <div className="flex min-h-screen flex-col bg-[var(--hb-paper)] text-[var(--hb-ink)]">
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
