"use client";

import type { CrimeCategory } from "@/lib/types";
import { CATEGORY_LABELS, ALL_CATEGORIES } from "@/lib/constants";

interface ComparisonBarProps {
  categoryRates: Record<CrimeCategory, number>;
  cityRates: Record<CrimeCategory, number>;
}

export default function ComparisonBar({ categoryRates, cityRates }: ComparisonBarProps) {
  const items = ALL_CATEGORIES.map((cat) => {
    const sectorRate = categoryRates[cat];
    const cityRate = cityRates[cat];
    const diff = cityRate > 0 ? ((sectorRate - cityRate) / cityRate) * 100 : 0;
    return { category: cat, label: CATEGORY_LABELS[cat], sectorRate, cityRate, diff };
  }).sort((a, b) => b.diff - a.diff);

  const maxRate = Math.max(
    ...items.map((i) => Math.max(i.sectorRate, i.cityRate)),
    1
  );

  return (
    <div className="space-y-5">
      {/* Legend */}
      <div className="flex items-center gap-6 text-[10px] tracking-wider">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[#00ffcc]/70" />
          <span className="text-[#888899]">SECTOR</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 border border-[#666680] border-dashed" />
          <span className="text-[#888899]">CITY AVG</span>
        </div>
        <div className="ml-auto text-[#666680]">PER 1K RESIDENTS</div>
      </div>

      {items.map((item) => {
        const sectorWidth = (item.sectorRate / maxRate) * 100;
        const cityWidth = (item.cityRate / maxRate) * 100;
        const isAbove = item.diff > 0;
        const diffColor = isAbove ? "#ff3333" : "#00ffcc";
        const barColor = isAbove
          ? "rgba(255, 51, 51, 0.55)"
          : "rgba(0, 255, 204, 0.55)";

        return (
          <div key={item.category}>
            {/* Label row */}
            <div className="flex justify-between items-baseline mb-1.5">
              <span className="text-[11px] text-[#e0e0f0] tracking-wider font-medium">
                {item.label}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-[11px] text-[#e0e0f0] font-bold tabular-nums">
                  {item.sectorRate.toFixed(1)}
                </span>
                <span className="text-[9px] text-[#666680]">vs</span>
                <span className="text-[11px] text-[#888899] tabular-nums">
                  {item.cityRate.toFixed(1)}
                </span>
                <span
                  className="text-[10px] font-bold tracking-wider min-w-[52px] text-right tabular-nums"
                  style={{ color: diffColor }}
                >
                  {isAbove ? "▲" : "▼"} {Math.abs(item.diff).toFixed(0)}%
                </span>
              </div>
            </div>

            {/* Bars */}
            <div className="space-y-1">
              {/* Sector bar */}
              <div className="h-3 bg-[#0f0f1a] relative">
                <div
                  className="absolute inset-y-0 left-0"
                  style={{
                    width: `${sectorWidth}%`,
                    backgroundColor: barColor,
                  }}
                />
              </div>
              {/* City average bar (outline only) */}
              <div className="h-1.5 relative">
                <div
                  className="absolute inset-y-0 left-0 border border-dashed border-[#666680]/60"
                  style={{ width: `${cityWidth}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
