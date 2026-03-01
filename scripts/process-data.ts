import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import centroid from "@turf/centroid";
import type {
  Neighborhood,
  CrimeCategory,
  YearlyTrend,
  CityAverages,
} from "../src/lib/types";
import { CRIME_CATEGORY_MAP, ALL_CATEGORIES } from "../src/lib/constants";
import {
  calculateSafetyScore,
  calculateCrimeRate,
  slugify,
} from "../src/lib/scoring";

const DATA_DIR = join(process.cwd(), "src/data");
const RAW_DIR = join(DATA_DIR, "raw");

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

function loadJson<T>(filename: string): T {
  return JSON.parse(readFileSync(join(RAW_DIR, filename), "utf-8"));
}

function mapCrimeCode(code: string): CrimeCategory | null {
  const trimmed = code.trim();
  // Try exact match first
  if (CRIME_CATEGORY_MAP[trimmed]) return CRIME_CATEGORY_MAP[trimmed];
  // Try matching by prefix (CBS codes have trailing whitespace sometimes)
  for (const [key, cat] of Object.entries(CRIME_CATEGORY_MAP)) {
    if (trimmed.startsWith(key)) return cat;
  }
  return null;
}

function extractYear(period: string): string {
  // CBS period format: "2023JJ00" for annual
  return period.trim().slice(0, 4);
}

export async function processData() {
  console.log("\n[PROCESS] Loading raw data...");

  const crimeRecords = loadJson<RawCrimeRecord[]>("buurt-crimes.json");
  const municipalityRecords = loadJson<RawCrimeRecord[]>("municipality-totals.json");
  const buurtenList = loadJson<RawBuurt[]>("buurten.json");
  const crimeTypes = loadJson<Array<{ Key: string; Title: string }>>(
    "crime-types.json"
  );

  // Load GeoJSON for centroids
  const geoPath = join(DATA_DIR, "amsterdam.geo.json");
  const geojson = existsSync(geoPath)
    ? JSON.parse(readFileSync(geoPath, "utf-8"))
    : null;

  // Build centroid lookup from GeoJSON
  const centroidMap = new Map<string, [number, number]>();
  if (geojson?.features) {
    for (const feature of geojson.features) {
      const code = feature.properties?.buurtcode;
      if (code) {
        try {
          const c = centroid(feature);
          centroidMap.set(
            code,
            c.geometry.coordinates as [number, number]
          );
        } catch {
          // skip features with invalid geometry
        }
      }
    }
  }

  // Build buurt name lookup
  const buurtNames = new Map<string, string>();
  for (const b of buurtenList) {
    buurtNames.set(b.Key.trim(), b.Title.trim());
  }

  // Build crime type code → readable code mapping
  const crimeCodeMap = new Map<string, string>();
  for (const ct of crimeTypes) {
    crimeCodeMap.set(ct.Key.trim(), ct.Title.trim());
  }

  // Get population from GeoJSON
  const populationMap = new Map<string, number>();
  if (geojson?.features) {
    for (const feature of geojson.features) {
      const code = feature.properties?.buurtcode;
      const pop = feature.properties?.aantalInwoners;
      if (code && typeof pop === "number") {
        populationMap.set(code, pop);
      }
    }
  }

  // Get all unique years
  const allYears = new Set<string>();
  for (const r of crimeRecords) {
    allYears.add(extractYear(r.Perioden));
  }
  const years = Array.from(allYears).sort();
  const latestYear = years[years.length - 1];
  // Use last 5 years for trends
  const trendYears = years.slice(-5);

  console.log(`  Years available: ${years.join(", ")}`);
  console.log(`  Latest year: ${latestYear}`);
  console.log(`  Trend years: ${trendYears.join(", ")}`);

  // Group crime data by buurt
  console.log("[PROCESS] Grouping crime data by buurt...");
  type CategoryCounts = Record<CrimeCategory, number>;
  const buurtCrimes = new Map<string, Map<string, CategoryCounts>>();

  function emptyCounts(): CategoryCounts {
    return { PROPERTY: 0, VIOLENT: 0, DRUGS: 0, FRAUD: 0, VANDALISM: 0, OTHER: 0 };
  }

  for (const r of crimeRecords) {
    const buurtCode = r.WijkenEnBuurten.trim();
    const year = extractYear(r.Perioden);
    const category = mapCrimeCode(r.SoortMisdrijf);
    const count = r.GeregistreerdeMisdrijven_1 ?? 0;

    if (!category) continue;
    if (!buurtCode.startsWith("BU0363")) continue;

    if (!buurtCrimes.has(buurtCode)) {
      buurtCrimes.set(buurtCode, new Map());
    }
    const yearMap = buurtCrimes.get(buurtCode)!;
    if (!yearMap.has(year)) {
      yearMap.set(year, emptyCounts());
    }
    const catMap = yearMap.get(year)!;
    catMap[category] += count;
  }

  // Calculate city-wide totals
  console.log("[PROCESS] Computing city averages...");
  const cityTotalsByYear = new Map<string, number>();
  const cityCategoryTotals: Record<CrimeCategory, number> = {
    PROPERTY: 0,
    VIOLENT: 0,
    DRUGS: 0,
    FRAUD: 0,
    VANDALISM: 0,
    OTHER: 0,
  };

  // Sum up all buurt crimes for city totals
  let totalPopulation = 0;
  const buurtPopulations = new Map<string, number>();

  for (const [code] of buurtCrimes) {
    const pop = populationMap.get(code) ?? 0;
    buurtPopulations.set(code, pop);
    totalPopulation += pop;
  }

  // Calculate city totals from municipality records if available, else sum buurten
  for (const r of municipalityRecords) {
    const year = extractYear(r.Perioden);
    const category = mapCrimeCode(r.SoortMisdrijf);
    const count = r.GeregistreerdeMisdrijven_1 ?? 0;
    if (!category) continue;

    if (year === latestYear) {
      cityCategoryTotals[category] += count;
    }

    const prev = cityTotalsByYear.get(year) ?? 0;
    cityTotalsByYear.set(year, prev + count);
  }

  // If municipality records are empty, aggregate from buurten
  if (municipalityRecords.length === 0) {
    for (const [, yearMap] of buurtCrimes) {
      for (const [year, catMap] of yearMap) {
        let yearTotal = 0;
        for (const cat of ALL_CATEGORIES) {
          const v = catMap[cat];
          yearTotal += v;
          if (year === latestYear) {
            cityCategoryTotals[cat] += v;
          }
        }
        const prev = cityTotalsByYear.get(year) ?? 0;
        cityTotalsByYear.set(year, prev + yearTotal);
      }
    }
  }

  const cityTotalCrimesLatest = Object.values(cityCategoryTotals).reduce(
    (a, b) => a + b,
    0
  );
  const cityRate = calculateCrimeRate(cityTotalCrimesLatest, totalPopulation);

  const cityCategoryRates: Record<CrimeCategory, number> = {} as Record<
    CrimeCategory,
    number
  >;
  for (const cat of ALL_CATEGORIES) {
    cityCategoryRates[cat] = calculateCrimeRate(
      cityCategoryTotals[cat],
      totalPopulation
    );
  }

  const cityYearlyRates: Record<string, number> = {};
  for (const year of trendYears) {
    const total = cityTotalsByYear.get(year) ?? 0;
    cityYearlyRates[year] = calculateCrimeRate(total, totalPopulation);
  }

  const cityAverages: CityAverages = {
    totalRate: cityRate,
    categoryRates: cityCategoryRates,
    yearlyRates: cityYearlyRates,
  };

  // Build neighborhood profiles
  console.log("[PROCESS] Building neighborhood profiles...");
  const neighborhoods: Neighborhood[] = [];

  for (const [code, yearMap] of buurtCrimes) {
    const population = buurtPopulations.get(code) ?? 0;
    if (population < 50) continue; // Exclude tiny buurten

    const name = buurtNames.get(code) ?? code;
    const slug = slugify(name);

    // Latest year categories
    const latestCats: CategoryCounts = yearMap.get(latestYear) ?? emptyCounts();

    const totalCrimes = Object.values(latestCats).reduce((a, b) => a + b, 0);
    const crimeRate = calculateCrimeRate(totalCrimes, population);
    const safetyScore = calculateSafetyScore(crimeRate, cityRate);

    const categoryRates: Record<CrimeCategory, number> = {} as Record<
      CrimeCategory,
      number
    >;
    for (const cat of ALL_CATEGORIES) {
      categoryRates[cat] = calculateCrimeRate(latestCats[cat], population);
    }

    // Yearly trends
    const trends: YearlyTrend[] = [];
    for (const year of trendYears) {
      const yCats = yearMap.get(year);
      if (yCats) {
        const total = Object.values(yCats).reduce((a, b) => a + b, 0);
        trends.push({
          year,
          total,
          rate: calculateCrimeRate(total, population),
        });
      }
    }

    const threatLevel =
      safetyScore >= 8
        ? "LOW"
        : safetyScore >= 6
          ? "MODERATE"
          : safetyScore >= 4
            ? "HIGH"
            : "CRITICAL";

    const coord = centroidMap.get(code) ?? [4.9041, 52.3676];

    neighborhoods.push({
      code,
      name,
      slug,
      population,
      totalCrimes,
      crimeRate,
      safetyScore,
      threatLevel,
      categories: latestCats,
      categoryRates,
      trends,
      centroid: coord,
    });
  }

  // Sort by safety score ascending (most dangerous first)
  neighborhoods.sort((a, b) => a.safetyScore - b.safetyScore);

  console.log(`  -> ${neighborhoods.length} neighborhoods profiled`);

  // Write outputs
  writeFileSync(
    join(DATA_DIR, "neighborhoods.json"),
    JSON.stringify(neighborhoods, null, 2)
  );
  writeFileSync(
    join(DATA_DIR, "city-averages.json"),
    JSON.stringify(cityAverages, null, 2)
  );

  // Crime trends by neighborhood (for profile pages)
  const crimeTrends: Record<string, YearlyTrend[]> = {};
  for (const n of neighborhoods) {
    crimeTrends[n.slug] = n.trends;
  }
  writeFileSync(
    join(DATA_DIR, "crime-trends.json"),
    JSON.stringify(crimeTrends, null, 2)
  );

  console.log("[PROCESS] All data processed successfully!");
  console.log(`  Neighborhoods: ${neighborhoods.length}`);
  console.log(`  City avg crime rate: ${cityRate.toFixed(1)} per 1000`);
  console.log(`  Score range: ${neighborhoods[0]?.safetyScore} - ${neighborhoods[neighborhoods.length - 1]?.safetyScore}`);
}
