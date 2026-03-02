"use client";

import { useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  CircleMarker,
  Tooltip,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useRouter } from "next/navigation";
import { getScoreColor, DARK_TILE_URL, DARK_TILE_ATTRIBUTION } from "@/lib/constants";
import type { MunicipalityComparison } from "@/lib/types";
import MapLegend from "../map/MapLegend";

// Fix leaflet default icon issue
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;

interface CountryMapProps {
  municipalities: MunicipalityComparison[];
  countryCode: string;
  center: [number, number];
  zoom: number;
  hoveredId: string | null;
  onHover: (id: string | null) => void;
}

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  map.setView(center, zoom);
  return null;
}

function getRadius(totalSectors: number): number {
  return Math.max(8, Math.min(25, Math.sqrt(totalSectors) * 2.5));
}

export default function CountryMap({
  municipalities,
  countryCode,
  center,
  zoom,
  hoveredId,
  onHover,
}: CountryMapProps) {
  const router = useRouter();

  const handleClick = useCallback(
    (cityId: string) => {
      router.push(`/${countryCode}/${cityId}`);
    },
    [router, countryCode]
  );

  return (
    <div className="relative h-full">
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full"
        zoomControl={true}
        scrollWheelZoom={true}
      >
        <MapController center={center} zoom={zoom} />
        <TileLayer url={DARK_TILE_URL} attribution={DARK_TILE_ATTRIBUTION} />

        {municipalities.map((m) => {
          const isHovered = m.id === hoveredId;
          const color = getScoreColor(m.avgScore);
          const baseRadius = getRadius(m.totalSectors);

          return (
            <CircleMarker
              key={m.id}
              center={[m.centerLat, m.centerLng]}
              radius={isHovered ? baseRadius * 1.4 : baseRadius}
              pathOptions={{
                color: isHovered ? "#e0e0f0" : color,
                fillColor: color,
                fillOpacity: isHovered ? 0.85 : 0.55,
                weight: isHovered ? 2.5 : 1.5,
              }}
              eventHandlers={{
                mouseover: () => onHover(m.id),
                mouseout: () => onHover(null),
                click: () => handleClick(m.id),
              }}
            >
              <Tooltip
                direction="top"
                offset={[0, -baseRadius]}
                opacity={0.95}
                className="dark-tooltip"
              >
                <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: "10px", letterSpacing: "0.1em" }}>
                  <span style={{ color: "#e0e0f0", fontWeight: 600 }}>{m.name}</span>
                  <span style={{ color, marginLeft: "6px" }}>{m.avgScore}/10</span>
                  <span style={{ color: "#888899", marginLeft: "6px" }}>{m.avgRate}/1K</span>
                </div>
              </Tooltip>
            </CircleMarker>
          );
        })}
      </MapContainer>

      <div className="absolute bottom-4 right-4 z-[1000] w-48">
        <MapLegend />
      </div>
    </div>
  );
}
