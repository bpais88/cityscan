"use client";

import Link from "next/link";

interface StatusBarProps {
  cityName?: string;
  sectorCount?: number;
}

export default function StatusBar({ cityName, sectorCount }: StatusBarProps) {
  return (
    <div className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-1.5 bg-[#0a0a0f]/95 border-b border-[#333340] font-mono text-[10px] tracking-[0.2em] uppercase backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-[#00ffcc] hover:text-[#00ffcc]/80 transition-colors">
          ◆ {cityName ? `${cityName.toUpperCase()} SECTOR INTELLIGENCE` : "CITYSCAN"}
        </Link>
        <span className="text-[#666680]">|</span>
        <Link href="/methodology" className="text-[#888899] hover:text-[#00ffcc] transition-colors">
          SRC: CBS POLITIE
        </Link>
      </div>
      <div className="flex items-center gap-4">
        {sectorCount !== undefined && (
          <>
            <span className="text-[#888899]">SECTORS: {sectorCount}</span>
            <span className="text-[#666680]">|</span>
          </>
        )}
        <span className="text-[#00ffcc] flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#00ffcc] animate-pulse" />
          STATUS: OPERATIONAL
        </span>
      </div>
    </div>
  );
}
