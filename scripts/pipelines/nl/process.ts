import { readFileSync, existsSync } from "fs";
import { join } from "path";
import centroid from "@turf/centroid";
import type {
  Neighborhood,
  CrimeCategory,
  YearlyTrend,
  CityAverages,
} from "../../../src/lib/types";
import { CRIME_CATEGORY_MAP, ALL_CATEGORIES } from "../../../src/lib/constants";
import {
  calculateSafetyScore,
  calculateCrimeRate,
  slugify,
} from "../../../src/lib/scoring";
import { NEIGHBORHOOD_ALIASES } from "../../../src/lib/aliases";

interface RawCrimeRecord {
  WijkenEnBuurten: string;
  SoortMisdrijf: string;
  Perioden: string;
  GeregistreerdeMisdrijven_1: number | null;
}

interface RawBuurt {
  Key: string;
  Title: string;
}

type CategoryCounts = Record<CrimeCategory, number>;

function emptyCounts(): CategoryCounts {
  return { PROPERTY: 0, VIOLENT: 0, DRUGS: 0, FRAUD: 0, VANDALISM: 0, OTHER: 0 };
}

function loadJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf-8"));
}

function mapCrimeCode(code: string): CrimeCategory | null {
  const trimmed = code.trim();
  if (CRIME_CATEGORY_MAP[trimmed]) return CRIME_CATEGORY_MAP[trimmed];
  for (const [key, cat] of Object.entries(CRIME_CATEGORY_MAP)) {
    if (trimmed.startsWith(key)) return cat;
  }
  return null;
}

function extractYear(period: string): string {
  return period.trim().slice(0, 4);
}

export interface ProcessedCity {
  neighborhoods: Neighborhood[];
  cityAverages: CityAverages;
  geojsonFeatures: Array<{
    code: string;
    geometry: unknown;
  }>;
}

export function processCity(
  cityId: string,
  gemeenteCode: string,
  rawDir: string,
  geoDir: string,
): ProcessedCity {
  const cityRawDir = join(rawDir, cityId);
  const buurtPrefix = `BU${gemeenteCode}`;

  console.log(`\n[${cityId}] Loading raw data...`);

  const crimeRecords = loadJson<RawCrimeRecord[]>(join(cityRawDir, "buurt-crimes.json"));
  const municipalityRecords = loadJson<RawCrimeRecord[]>(join(cityRawDir, "municipality-totals.json"));
  const buurtenList = loadJson<RawBuurt[]>(join(cityRawDir, "buurten.json"));

  // Load GeoJSON
  const geoPath = join(geoDir, `${cityId}.geo.json`);
  const geojson = existsSync(geoPath) ? JSON.parse(readFileSync(geoPath, "utf-8")) : null;

  // Build lookups from GeoJSON
  const centroidMap = new Map<string, [number, number]>();
  const postcodeMap = new Map<string, string>();
  const populationMap = new Map<string, number>();
  const geometryMap = new Map<string, unknown>();

  if (geojson?.features) {
    for (const feature of geojson.features) {
      const code = feature.properties?.buurtcode;
      if (!code) continue;
      try {
        const c = centroid(feature);
        centroidMap.set(code, c.geometry.coordinates as [number, number]);
      } catch { /* skip invalid geometry */ }
      const pc = String(feature.properties?.postcode ?? "").trim();
      if (pc && pc !== "-99997") postcodeMap.set(code, pc);
      const pop = feature.properties?.aantalInwoners;
      if (typeof pop === "number") populationMap.set(code, pop);
      geometryMap.set(code, feature.geometry);
    }
  }

  // Buurt name lookup
  const buurtNames = new Map<string, string>();
  for (const b of buurtenList) buurtNames.set(b.Key.trim(), b.Title.trim());

  // Get years
  const allYears = new Set<string>();
  for (const r of crimeRecords) allYears.add(extractYear(r.Perioden));
  const years = Array.from(allYears).sort();
  const latestYear = years[years.length - 1];
  const trendYears = years.slice(-5);
  console.log(`  Years: ${years.join(", ")} | Latest: ${latestYear}`);

  // Group crime data by buurt
  const buurtCrimes = new Map<string, Map<string, CategoryCounts>>();
  for (const r of crimeRecords) {
    const buurtCode = r.WijkenEnBuurten.trim();
    const year = extractYear(r.Perioden);
    const category = mapCrimeCode(r.SoortMisdrijf);
    const count = r.GeregistreerdeMisdrijven_1 ?? 0;
    if (!category || !buurtCode.startsWith(buurtPrefix)) continue;
    if (!buurtCrimes.has(buurtCode)) buurtCrimes.set(buurtCode, new Map());
    const yearMap = buurtCrimes.get(buurtCode)!;
    if (!yearMap.has(year)) yearMap.set(year, emptyCounts());
    yearMap.get(year)![category] += count;
  }

  // City-wide totals
  const cityTotalsByYear = new Map<string, number>();
  const cityCategoryTotals = emptyCounts();
  let totalPopulation = 0;
  const buurtPopulations = new Map<string, number>();

  for (const [code] of buurtCrimes) {
    const pop = populationMap.get(code) ?? 0;
    buurtPopulations.set(code, pop);
    totalPopulation += pop;
  }

  for (const r of municipalityRecords) {
    const year = extractYear(r.Perioden);
    const category = mapCrimeCode(r.SoortMisdrijf);
    const count = r.GeregistreerdeMisdrijven_1 ?? 0;
    if (!category) continue;
    if (year === latestYear) cityCategoryTotals[category] += count;
    cityTotalsByYear.set(year, (cityTotalsByYear.get(year) ?? 0) + count);
  }

  if (municipalityRecords.length === 0) {
    for (const [, yearMap] of buurtCrimes) {
      for (const [year, catMap] of yearMap) {
        let yearTotal = 0;
        for (const cat of ALL_CATEGORIES) {
          yearTotal += catMap[cat];
          if (year === latestYear) cityCategoryTotals[cat] += catMap[cat];
        }
        cityTotalsByYear.set(year, (cityTotalsByYear.get(year) ?? 0) + yearTotal);
      }
    }
  }

  const cityTotalCrimesLatest = Object.values(cityCategoryTotals).reduce((a, b) => a + b, 0);
  const cityRate = calculateCrimeRate(cityTotalCrimesLatest, totalPopulation);

  const cityCategoryRates = {} as Record<CrimeCategory, number>;
  for (const cat of ALL_CATEGORIES) {
    cityCategoryRates[cat] = calculateCrimeRate(cityCategoryTotals[cat], totalPopulation);
  }

  const cityYearlyRates: Record<string, number> = {};
  for (const year of trendYears) {
    cityYearlyRates[year] = calculateCrimeRate(cityTotalsByYear.get(year) ?? 0, totalPopulation);
  }

  const cityAverages: CityAverages = {
    totalRate: cityRate,
    categoryRates: cityCategoryRates,
    yearlyRates: cityYearlyRates,
  };

  // Build neighborhood profiles
  const neighborhoods: Neighborhood[] = [];
  const geojsonFeatures: Array<{ code: string; geometry: unknown }> = [];
  const usedSlugs = new Set<string>();

  for (const [code, yearMap] of buurtCrimes) {
    const population = buurtPopulations.get(code) ?? 0;
    if (population < 50) continue;

    const name = buurtNames.get(code) ?? code;
    let slug = slugify(name);
    if (usedSlugs.has(slug)) slug = `${slug}-${code.slice(-4).toLowerCase()}`;
    usedSlugs.add(slug);

    const latestCats = yearMap.get(latestYear) ?? emptyCounts();
    const totalCrimes = Object.values(latestCats).reduce((a, b) => a + b, 0);
    const crimeRate = calculateCrimeRate(totalCrimes, population);
    const safetyScore = calculateSafetyScore(crimeRate, cityRate);

    const categoryRates = {} as Record<CrimeCategory, number>;
    for (const cat of ALL_CATEGORIES) {
      categoryRates[cat] = calculateCrimeRate(latestCats[cat], population);
    }

    const trends: YearlyTrend[] = [];
    for (const year of trendYears) {
      const yCats = yearMap.get(year);
      if (yCats) {
        const total = Object.values(yCats).reduce((a, b) => a + b, 0);
        trends.push({ year, total, rate: calculateCrimeRate(total, population) });
      }
    }

    const threatLevel =
      safetyScore >= 8 ? "LOW" : safetyScore >= 6 ? "MODERATE" : safetyScore >= 4 ? "HIGH" : "CRITICAL";

    const postcode = postcodeMap.get(code) ?? "";

    const cityAliases = NEIGHBORHOOD_ALIASES[cityId] ?? [];
    const aliases = cityAliases
      .filter((a) => postcode && a.postcodes.includes(postcode))
      .map((a) => a.name);

    neighborhoods.push({
      code, name, slug, population, totalCrimes, crimeRate, safetyScore, threatLevel,
      categories: latestCats, categoryRates, trends,
      centroid: centroidMap.get(code) ?? [4.9041, 52.3676],
      postcode,
      ...(aliases.length > 0 ? { aliases } : {}),
    });

    // Store geometry for DB insertion
    const geom = geometryMap.get(code);
    if (geom) {
      geojsonFeatures.push({ code, geometry: geom });
    }
  }

  neighborhoods.sort((a, b) => a.safetyScore - b.safetyScore);
  const aliasCount = neighborhoods.filter((n) => n.aliases && n.aliases.length > 0).length;
  console.log(`  -> ${neighborhoods.length} neighborhoods | City rate: ${cityRate.toFixed(1)}/1K | ${aliasCount} with aliases`);

  return { neighborhoods, cityAverages, geojsonFeatures };
}
