"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { MunicipalityComparison } from "@/lib/types";
import RankingSidebar from "./RankingSidebar";

const CountryMap = dynamic(() => import("./CountryMap"), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center bg-[#0a0a0f]">
      <div className="font-mono text-[#00ffcc] text-sm tracking-wider animate-pulse">
        ◆ LOADING NATIONAL MAP...
      </div>
    </div>
  ),
});

interface CompareClientProps {
  municipalities: MunicipalityComparison[];
  countryCode: string;
  countryCenter: [number, number];
  countryZoom: number;
  totalSectors: number;
  totalCritical: number;
  overallAvg: string;
}

export default function CompareClient({
  municipalities,
  countryCode,
  countryCenter,
  countryZoom,
  totalSectors,
  totalCritical,
  overallAvg,
}: CompareClientProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-40px)]">
      {/* Map — fills remaining space */}
      <div className="flex-1 min-h-[50vh] md:min-h-0">
        <CountryMap
          municipalities={municipalities}
          countryCode={countryCode}
          center={countryCenter}
          zoom={countryZoom}
          hoveredId={hoveredId}
          onHover={setHoveredId}
        />
      </div>

      {/* Sidebar */}
      <div className="w-full md:w-80 border-t md:border-t-0 md:border-l border-[#333340] overflow-y-auto bg-[#0a0a0f]">
        <RankingSidebar
          municipalities={municipalities}
          countryCode={countryCode}
          hoveredId={hoveredId}
          onHover={setHoveredId}
          totalSectors={totalSectors}
          totalCritical={totalCritical}
          overallAvg={overallAvg}
        />
      </div>
    </div>
  );
}
