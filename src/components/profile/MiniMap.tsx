"use client";

import dynamic from "next/dynamic";
import type { Neighborhood } from "@/lib/types";

const SafetyMap = dynamic(() => import("@/components/map/SafetyMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[250px] flex items-center justify-center bg-[#0a0a0f] border border-[#333340]">
      <span className="font-mono text-[#00ffcc] text-xs animate-pulse">LOADING MAP...</span>
    </div>
  ),
});

interface MiniMapProps {
  geojson: GeoJSON.FeatureCollection;
  neighborhoods: Neighborhood[];
  selectedSlug: string;
}

export default function MiniMap({ geojson, neighborhoods, selectedSlug }: MiniMapProps) {
  return (
    <div className="border border-[#333340]">
      <SafetyMap
        geojson={geojson}
        neighborhoods={neighborhoods}
        selectedSlug={selectedSlug}
        mini
      />
    </div>
  );
}
