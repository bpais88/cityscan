import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import StatusBar from "@/components/ui/StatusBar";
import ScanlineOverlay from "@/components/ui/ScanlineOverlay";

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "AMSTERDAM SECTOR INTELLIGENCE — Neighborhood Safety Profiler",
  description:
    "Intelligence-grade neighborhood safety analysis for Amsterdam. Powered by CBS police crime data.",
  openGraph: {
    title: "AMSTERDAM SECTOR INTELLIGENCE",
    description: "Neighborhood safety analysis powered by CBS police data",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${jetbrains.variable} antialiased bg-[#0a0a0f] text-[#e0e0f0] font-mono`}>
        <ScanlineOverlay />
        <StatusBar />
        <main className="pt-8">{children}</main>
      </body>
    </html>
  );
}
