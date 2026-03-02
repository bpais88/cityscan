"use client";

import { useEffect, useState, useCallback } from "react";
import {
  MapContainer,
  TileLayer,
  GeoJSON,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useRouter } from "next/navigation";
import { getChoroplethColor, DEFAULT_CENTER, DEFAULT_ZOOM, DARK_TILE_URL, DARK_TILE_ATTRIBUTION } from "@/lib/constants";
import type { Neighborhood } from "@/lib/types";
import MapLegend from "./MapLegend";

// Fix leaflet default icon issue
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface SafetyMapProps {
  geojson: GeoJSON.FeatureCollection;
  neighborhoods: Neighborhood[];
  selectedSlug?: string;
  mini?: boolean;
  countryCode?: string;
  cityId?: string;
  cityCenter?: [number, number];
  cityZoom?: number;
}

function MapController({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [map, center, zoom]);
  return null;
}

export default function SafetyMap({
  geojson,
  neighborhoods,
  selectedSlug,
  mini = false,
  countryCode,
  cityId,
  cityCenter,
  cityZoom,
}: SafetyMapProps) {
  const router = useRouter();
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);

  // Build lookup for neighborhood data by buurt code
  const neighborhoodMap = new Map<string, Neighborhood>();
  for (const n of neighborhoods) {
    neighborhoodMap.set(n.code, n);
  }

  const getStyle = useCallback(
    (feature: GeoJSON.Feature | undefined) => {
      const code = feature?.properties?.buurtcode;
      const n = code ? neighborhoodMap.get(code) : undefined;
      const isSelected = n?.slug === selectedSlug;
      const isHovered = code === hoveredCode;

      return {
        fillColor: n ? getChoroplethColor(n.safetyScore) : "#333340",
        fillOpacity: isSelected ? 0.6 : isHovered ? 0.5 : 0.35,
        color: isSelected
          ? "#00ffcc"
          : isHovered
            ? "#e0e0f0"
            : "#333340",
        weight: isSelected ? 2 : isHovered ? 1.5 : 0.5,
        opacity: 1,
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [hoveredCode, selectedSlug]
  );

  const onEachFeature = useCallback(
    (feature: GeoJSON.Feature, layer: L.Layer) => {
      const code = feature.properties?.buurtcode;
      const n = code ? neighborhoodMap.get(code) : undefined;

      if (n) {
        const threatColor =
          n.threatLevel === "LOW"
            ? "#00ffcc"
            : n.threatLevel === "MODERATE"
              ? "#00ff88"
              : n.threatLevel === "HIGH"
                ? "#ffaa00"
                : "#ff3333";

        layer.bindPopup(
          `<div style="font-family: monospace; font-size: 11px;">
            <div style="color: #888899; font-size: 9px; letter-spacing: 0.2em; margin-bottom: 4px;">SECTOR ${code}</div>
            <div style="color: #e0e0f0; font-weight: 700; margin-bottom: 6px;">${n.name}</div>
            <div style="color: ${threatColor}; font-size: 13px; font-weight: 700;">
              THREAT: ${n.threatLevel} [${n.safetyScore}/10]
            </div>
            <div style="color: #888899; font-size: 10px; margin-top: 4px;">
              ${n.crimeRate.toFixed(1)} incidents / 1K residents
            </div>
          </div>`,
          { className: "dark-popup" }
        );

        // Hover tooltip showing neighborhood name + threat level + population
        layer.bindTooltip(
          `<div style="font-family: 'JetBrains Mono', monospace; font-size: 10px; letter-spacing: 0.1em;">
            <span style="color: #e0e0f0; font-weight: 600;">${n.name}</span>
            <span style="color: ${threatColor}; margin-left: 6px;">${n.safetyScore}/10</span>
            <span style="color: #888899; margin-left: 6px;">${n.population.toLocaleString()} res.</span>
          </div>`,
          {
            sticky: true,
            direction: "top",
            offset: [0, -10],
            opacity: 0.95,
            className: "dark-tooltip",
          }
        );
      }

      (layer as L.Path).on({
        mouseover: () => setHoveredCode(code ?? null),
        mouseout: () => setHoveredCode(null),
        click: () => {
          if (n && !mini && cityId) {
            const base = countryCode ? `/${countryCode}/${cityId}` : `/${cityId}`;
            router.push(`${base}/${n.slug}`);
          }
        },
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // For mini map, find the selected neighborhood's centroid
  const selected = selectedSlug
    ? neighborhoods.find((n) => n.slug === selectedSlug)
    : undefined;
  const center: [number, number] = selected
    ? [selected.centroid[1], selected.centroid[0]]
    : cityCenter ?? DEFAULT_CENTER;
  const zoom = mini ? 14 : (cityZoom ?? DEFAULT_ZOOM);

  return (
    <div className={`relative ${mini ? "h-[250px]" : "h-[calc(100vh-120px)]"}`}>
      <MapContainer
        center={center}
        zoom={zoom}
        className="h-full w-full"
        zoomControl={!mini}
        dragging={!mini}
        scrollWheelZoom={!mini}
        attributionControl={!mini}
      >
        <MapController center={center} zoom={zoom} />
        <TileLayer
          url={DARK_TILE_URL}
          attribution={DARK_TILE_ATTRIBUTION}
        />
        <GeoJSON
          key={hoveredCode ?? "default"}
          data={geojson}
          style={getStyle}
          onEachFeature={onEachFeature}
        />
      </MapContainer>

      {!mini && (
        <div className="absolute bottom-4 right-4 z-[1000] w-48">
          <MapLegend />
        </div>
      )}
    </div>
  );
}
