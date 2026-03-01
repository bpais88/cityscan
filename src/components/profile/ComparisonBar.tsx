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
  });

  const maxAbsDiff = Math.max(...items.map((i) => Math.abs(i.diff)), 1);

  return (
    <div className="space-y-3">
      <div className="flex justify-between text-[9px] text-[#888899] tracking-wider">
        <span>SAFER THAN AVG</span>
        <span>CITY AVG</span>
        <span>ABOVE AVG</span>
      </div>
      {items.map((item) => {
        const pct = (item.diff / maxAbsDiff) * 50;
        const isAbove = item.diff > 0;
        const color = isAbove ? "#ff3333" : "#00ffcc";

        return (
          <div key={item.category}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10px] text-[#888899] tracking-wider">
                {item.label}
              </span>
              <span
                className="text-[10px] font-bold"
                style={{ color }}
              >
                {isAbove ? "+" : ""}
                {item.diff.toFixed(0)}%
              </span>
            </div>
            <div className="h-2 bg-[#1a1a2e] relative flex items-center">
              {/* Center line */}
              <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#666680]" />
              {/* Bar */}
              <div
                className="absolute h-full"
                style={{
                  backgroundColor: color,
                  opacity: 0.6,
                  width: `${Math.abs(pct)}%`,
                  left: isAbove ? "50%" : `${50 - Math.abs(pct)}%`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
