export interface Neighborhood {
  code: string;
  name: string;
  slug: string;
  population: number;
  totalCrimes: number;
  crimeRate: number; // per 1000 residents
  safetyScore: number; // 1-10
  threatLevel: "LOW" | "MODERATE" | "HIGH" | "CRITICAL";
  categories: Record<CrimeCategory, number>;
  categoryRates: Record<CrimeCategory, number>;
  trends: YearlyTrend[];
  centroid: [number, number]; // [lng, lat]
  postcode: string; // 4-digit Dutch postcode
  aliases?: string[]; // popular area names (e.g. "Jordaan", "De Pijp")
}

export type CrimeCategory =
  | "PROPERTY"
  | "VIOLENT"
  | "DRUGS"
  | "FRAUD"
  | "VANDALISM"
  | "OTHER";

export interface YearlyTrend {
  year: string;
  total: number;
  rate: number;
}

export interface CityAverages {
  totalRate: number;
  categoryRates: Record<CrimeCategory, number>;
  yearlyRates: Record<string, number>;
}

export interface GeoFeatureProperties {
  buurtcode: string;
  buurtnaam: string;
  aantalInwoners?: number;
}

export interface SearchResult {
  code: string;
  name: string;
  slug: string;
  safetyScore: number;
  threatLevel: string;
}

export interface CityIndex {
  id: string;
  name: string;
  totalSectors: number;
  avgScore: number;
  criticalCount: number;
  avgRate: number;
}

export interface MunicipalityComparison {
  id: string;
  name: string;
  totalSectors: number;
  avgScore: number;
  criticalCount: number;
  avgRate: number;
  totalRate: number;
  centerLat: number;
  centerLng: number;
}

export interface CBSRecord {
  WijkenEnBuurten: string;
  SoortMisdrijf: string;
  Perioden: string;
  GeregistreerdeMisdrijven_1: number | null;
}
