import type { CrimeCategory } from "./types";

// CBS crime code prefix → category mapping
// Based on CBS 47018NED SoortMisdrijf dimension
export const CRIME_CATEGORY_MAP: Record<string, CrimeCategory> = {
  // Property Crime
  "1.1.1": "PROPERTY",
  "1.1.2": "PROPERTY",
  "1.2.1": "PROPERTY",
  "1.2.2": "PROPERTY",
  "1.2.3": "PROPERTY",
  "1.2.4": "PROPERTY",
  "1.2.5": "PROPERTY",
  "1.5.2": "PROPERTY",
  "1.6.2": "PROPERTY",
  "2.5.1": "PROPERTY",
  "2.5.2": "PROPERTY",
  // Violent Crime
  "1.4.1": "VIOLENT",
  "1.4.2": "VIOLENT",
  "1.4.3": "VIOLENT",
  "1.4.4": "VIOLENT",
  "1.4.5": "VIOLENT",
  "1.4.6": "VIOLENT",
  "1.4.7": "VIOLENT",
  "1.6.3": "VIOLENT",
  "3.1.2": "VIOLENT",
  "3.1.3": "VIOLENT",
  "3.2.1": "VIOLENT",
  "3.2.2": "VIOLENT",
  // Drug-Related
  "2.1.1": "DRUGS",
  "3.1.1": "DRUGS",
  "3.3.2": "DRUGS",
  "3.4.2": "DRUGS",
  "3.5.2": "DRUGS",
  // Fraud & Cybercrime
  "3.9.1": "FRAUD",
  "3.9.2": "FRAUD",
  "3.9.3": "FRAUD",
  "3.7.4": "FRAUD",
  // Vandalism & Nuisance
  "2.2.1": "VANDALISM",
  "1.6.1": "VANDALISM",
  "2.4.1": "VANDALISM",
  "2.4.2": "VANDALISM",
  "3.6.4": "VANDALISM",
  // Other
  "1.3.1": "OTHER",
  "2.6.1": "OTHER",
  "2.6.2": "OTHER",
  "2.6.3": "OTHER",
  "2.6.4": "OTHER",
  "2.6.5": "OTHER",
  "2.6.6": "OTHER",
  "2.6.7": "OTHER",
  "2.6.8": "OTHER",
  "2.6.9": "OTHER",
  "2.6.10": "OTHER",
  "2.6.11": "OTHER",
  "2.6.12": "OTHER",
  "2.6.13": "OTHER",
  "2.6.14": "OTHER",
  "2.7.2": "OTHER",
  "2.7.3": "OTHER",
  "3.3.5": "OTHER",
  "3.5.5": "OTHER",
  "3.7.1": "OTHER",
  "3.7.2": "OTHER",
  "3.7.3": "OTHER",
};

export const CATEGORY_LABELS: Record<CrimeCategory, string> = {
  PROPERTY: "PROPERTY CRIME",
  VIOLENT: "VIOLENT CRIME",
  DRUGS: "DRUG-RELATED",
  FRAUD: "FRAUD & CYBER",
  VANDALISM: "VANDALISM & NUISANCE",
  OTHER: "OTHER",
};

export const ALL_CATEGORIES: CrimeCategory[] = [
  "PROPERTY",
  "VIOLENT",
  "DRUGS",
  "FRAUD",
  "VANDALISM",
  "OTHER",
];

// Intelligence aesthetic color palette
export const COLORS = {
  bg: "#0a0a0f",
  bgPanel: "rgba(10, 10, 15, 0.85)",
  cyan: "#00ffcc",
  cyanDim: "#00997a",
  amber: "#ffaa00",
  red: "#ff3333",
  green: "#00ff88",
  gray: "#333340",
  grayLight: "#666680",
  grayText: "#888899",
  white: "#e0e0f0",
};

export const THREAT_COLORS: Record<string, string> = {
  LOW: COLORS.cyan,
  MODERATE: COLORS.green,
  HIGH: COLORS.amber,
  CRITICAL: COLORS.red,
};

export function getThreatLevel(score: number): "LOW" | "MODERATE" | "HIGH" | "CRITICAL" {
  if (score >= 8) return "LOW";
  if (score >= 6) return "MODERATE";
  if (score >= 4) return "HIGH";
  return "CRITICAL";
}

export function getScoreColor(score: number): string {
  if (score >= 8) return COLORS.cyan;
  if (score >= 6) return COLORS.green;
  if (score >= 4) return COLORS.amber;
  return COLORS.red;
}

export function getChoroplethColor(score: number): string {
  if (score >= 8) return "#00ffcc";
  if (score >= 6) return "#44dd88";
  if (score >= 4) return "#ffaa00";
  if (score >= 2) return "#ff6633";
  return "#ff3333";
}

// Amsterdam center coordinates
export const AMSTERDAM_CENTER: [number, number] = [52.3676, 4.9041];
export const DEFAULT_ZOOM = 12;

// CBS API base
export const CBS_API_BASE = "https://dataderden.cbs.nl/ODataApi/OData/47018NED";

// PDOK WFS base
export const PDOK_WFS_BASE =
  "https://service.pdok.nl/cbs/wijkenbuurten/2024/wfs/v1_0";

// CartoDB dark tiles
export const DARK_TILE_URL =
  "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png";
export const DARK_TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>';
