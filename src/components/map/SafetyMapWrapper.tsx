"use client";

import dynamic from "next/dynamic";
import type { Neighborhood } from "@/lib/types";

const SafetyMap = dynamic(() => import("./SafetyMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[calc(100vh-120px)] flex items-center justify-center bg-[#0a0a0f]">
      <div className="font-mono text-[#00ffcc] text-sm tracking-wider animate-pulse">
        ◆ LOADING SECTOR DATA...
      </div>
    </div>
  ),
});

interface SafetyMapWrapperProps {
  geojson: GeoJSON.FeatureCollection;
  neighborhoods: Neighborhood[];
  selectedSlug?: string;
  mini?: boolean;
}

export default function SafetyMapWrapper(props: SafetyMapWrapperProps) {
  return <SafetyMap {...props} />;
}
