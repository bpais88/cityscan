"use client";

import { useMemo } from "react";
import Link from "next/link";
import { getScoreColor } from "@/lib/constants";
import type { MunicipalityComparison } from "@/lib/types";

interface RankingSidebarProps {
  municipalities: MunicipalityComparison[];
  countryCode: string;
  hoveredId: string | null;
  onHover: (id: string | null) => void;
  totalSectors: number;
  totalCritical: number;
  overallAvg: string;
}

export default function RankingSidebar({
  municipalities,
  countryCode,
  hoveredId,
  onHover,
  totalSectors,
  totalCritical,
  overallAvg,
}: RankingSidebarProps) {
  const ranked = useMemo(
    () => [...municipalities].sort((a, b) => b.avgScore - a.avgScore),
    [municipalities]
  );

  return (
    <div className="flex flex-col h-full font-mono">
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#333340]">
        <div className="text-[9px] tracking-[0.25em] text-[#888899] uppercase">
          ◇ MUNICIPAL RANKINGS
        </div>
      </div>

      {/* Ranked list */}
      <div className="flex-1 overflow-y-auto">
        {ranked.map((m, i) => {
          const isHovered = m.id === hoveredId;
          const color = getScoreColor(m.avgScore);

          return (
            <Link
              key={m.id}
              href={`/${countryCode}/${m.id}`}
              className={`flex items-center gap-3 px-4 py-2.5 border-b border-[#333340]/50 transition-all cursor-pointer ${
                isHovered
                  ? "bg-[#00ffcc]/10 border-l-2 border-l-[#00ffcc]"
                  : "hover:bg-[#ffffff]/[0.03] border-l-2 border-l-transparent"
              }`}
              onMouseEnter={() => onHover(m.id)}
              onMouseLeave={() => onHover(null)}
            >
              {/* Rank */}
              <span className="text-[10px] text-[#666680] w-5 text-right shrink-0">
                {i + 1}.
              </span>

              {/* Name */}
              <span
                className={`text-xs tracking-wider truncate flex-1 ${
                  isHovered ? "text-[#00ffcc]" : "text-[#e0e0f0]"
                }`}
              >
                {m.name.toUpperCase()}
              </span>

              {/* Score */}
              <span
                className="text-xs font-bold shrink-0"
                style={{ color }}
              >
                {m.avgScore}
              </span>

              {/* Rate */}
              <span className="text-[10px] text-[#666680] w-12 text-right shrink-0">
                {m.avgRate}/1K
              </span>
            </Link>
          );
        })}
      </div>

      {/* Country stats */}
      <div className="border-t border-[#333340] px-4 py-3 space-y-2">
        <div className="text-[9px] tracking-[0.25em] text-[#888899] uppercase mb-2">
          ◇ COUNTRY STATS
        </div>
        <div className="flex justify-between text-[10px] tracking-wider">
          <span className="text-[#888899]">MUNICIPALITIES</span>
          <span className="text-[#00ffcc]">{municipalities.length}</span>
        </div>
        <div className="flex justify-between text-[10px] tracking-wider">
          <span className="text-[#888899]">TOTAL SECTORS</span>
          <span className="text-[#00ffcc]">{totalSectors.toLocaleString()}</span>
        </div>
        <div className="flex justify-between text-[10px] tracking-wider">
          <span className="text-[#888899]">AVG SAFETY</span>
          <span className="text-[#00ffcc]">{overallAvg}/10</span>
        </div>
        <div className="flex justify-between text-[10px] tracking-wider">
          <span className="text-[#888899]">CRITICAL ZONES</span>
          <span className="text-[#ff3333]">{totalCritical}</span>
        </div>
      </div>
    </div>
  );
}
