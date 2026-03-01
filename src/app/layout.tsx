import type { Metadata } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import ScanlineOverlay from "@/components/ui/ScanlineOverlay";

const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700"],
});

export const metadata: Metadata = {
  title: "CITYSCAN — Neighborhood Safety Intelligence",
  description:
    "Intelligence-grade neighborhood safety analysis for Dutch cities. Powered by CBS police crime data.",
  openGraph: {
    title: "CITYSCAN — Neighborhood Safety Intelligence",
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
        <main>{children}</main>
      </body>
    </html>
  );
}
