import { config } from "dotenv";
config({ path: ".env.local" });

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { readFileSync, existsSync } from "fs";
import { join } from "path";
import * as schema from "../src/db/schema";
import { CITIES } from "../src/lib/cities";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const DATA_DIR = join(process.cwd(), "src/data");

function loadJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf-8"));
}

interface NeighborhoodJson {
  code: string;
  name: string;
  slug: string;
  population: number;
  totalCrimes: number;
  crimeRate: number;
  safetyScore: number;
  threatLevel: string;
  categories: Record<string, number>;
  categoryRates: Record<string, number>;
  trends: Array<{ year: string; total: number; rate: number }>;
  centroid: [number, number];
  postcode: string;
  aliases?: string[];
}

interface CityAveragesJson {
  totalRate: number;
  categoryRates: Record<string, number>;
  yearlyRates: Record<string, number>;
}

interface CityIndexEntry {
  id: string;
  name: string;
  totalSectors: number;
  avgScore: number;
  criticalCount: number;
  avgRate: number;
}

async function seed() {
  console.log("=== Seeding Neon database from existing JSON data ===\n");

  // 1. Insert Netherlands country
  console.log("[1] Inserting 'nl' country...");
  await db
    .insert(schema.countries)
    .values({
      code: "nl",
      name: "Netherlands",
      centerLat: 52.1326,
      centerLng: 5.2913,
      zoom: 7,
      dataSource: "CBS Open Data (47018NED) + PDOK WFS",
    })
    .onConflictDoNothing();

  // 2. Load city index for summary stats
  const cityIndex = loadJson<CityIndexEntry[]>(join(DATA_DIR, "city-index.json"));
  const cityIndexMap = new Map(cityIndex.map((c) => [c.id, c]));

  // 3. Insert municipalities
  console.log("[2] Inserting municipalities...");
  let muniCount = 0;
  for (const city of CITIES) {
    const averagesPath = join(DATA_DIR, "cities", city.id, "city-averages.json");
    if (!existsSync(averagesPath)) {
      console.log(`  Skipping ${city.id} — no city-averages.json`);
      continue;
    }

    const averages = loadJson<CityAveragesJson>(averagesPath);
    const idx = cityIndexMap.get(city.id);

    await db
      .insert(schema.municipalities)
      .values({
        id: city.id,
        countryCode: "nl",
        name: city.name,
        sourceCode: city.gemeenteCode,
        centerLat: city.center[0],
        centerLng: city.center[1],
        zoom: city.zoom,
        totalSectors: idx?.totalSectors ?? 0,
        avgScore: String(idx?.avgScore ?? 0),
        criticalCount: idx?.criticalCount ?? 0,
        avgRate: String(idx?.avgRate ?? 0),
        totalRate: String(averages.totalRate),
        categoryRates: averages.categoryRates,
        yearlyRates: averages.yearlyRates,
      })
      .onConflictDoNothing();

    muniCount++;
    console.log(`  ✓ ${city.name}`);
  }
  console.log(`  → ${muniCount} municipalities inserted\n`);

  // 4. Insert neighborhoods + crime records
  console.log("[3] Inserting neighborhoods...");
  let totalNeighborhoods = 0;
  let totalCrimeRecords = 0;

  for (const city of CITIES) {
    const nhoodPath = join(DATA_DIR, "cities", city.id, "neighborhoods.json");
    if (!existsSync(nhoodPath)) {
      console.log(`  Skipping ${city.id} — no neighborhoods.json`);
      continue;
    }

    const nhoods = loadJson<NeighborhoodJson[]>(nhoodPath);

    // Load GeoJSON for geometry data
    const geoPath = join(DATA_DIR, `${city.id}.geo.json`);
    const geometryMap = new Map<string, unknown>();
    if (existsSync(geoPath)) {
      const geojson = loadJson<{ features: Array<{ properties: { buurtcode: string }; geometry: unknown }> }>(geoPath);
      for (const f of geojson.features) {
        geometryMap.set(f.properties.buurtcode, f.geometry);
      }
    }

    // Batch insert neighborhoods (chunks of 50 to avoid query size limits)
    const CHUNK_SIZE = 50;
    for (let i = 0; i < nhoods.length; i += CHUNK_SIZE) {
      const chunk = nhoods.slice(i, i + CHUNK_SIZE);
      const values = chunk.map((n) => ({
        code: n.code,
        municipalityId: city.id,
        name: n.name,
        slug: n.slug,
        population: n.population,
        totalCrimes: n.totalCrimes,
        crimeRate: String(n.crimeRate),
        safetyScore: n.safetyScore,
        threatLevel: n.threatLevel,
        categories: n.categories,
        categoryRates: n.categoryRates,
        trends: n.trends,
        centroidLng: n.centroid[0],
        centroidLat: n.centroid[1],
        postcode: n.postcode,
        aliases: n.aliases ?? [],
        geometry: geometryMap.get(n.code) ?? null,
      }));

      await db.insert(schema.neighborhoods).values(values).onConflictDoNothing();
    }

    totalNeighborhoods += nhoods.length;
    console.log(`  ✓ ${city.name}: ${nhoods.length} neighborhoods`);

    // Insert crime records from trends data
    for (const n of nhoods) {
      if (n.trends.length === 0) continue;

      // We reconstruct per-year per-category from the categories (latest year)
      // and trends (yearly totals). For a full breakdown we'd need raw data,
      // but for the seed we insert the latest year's category breakdown.
      const latestYear = n.trends[n.trends.length - 1]?.year;
      if (!latestYear) continue;

      const crimeValues = Object.entries(n.categories)
        .filter(([, count]) => count > 0)
        .map(([category, count]) => ({
          neighborhoodCode: n.code,
          year: latestYear,
          category,
          count: count as number,
        }));

      if (crimeValues.length > 0) {
        await db.insert(schema.crimeRecords).values(crimeValues).onConflictDoNothing();
        totalCrimeRecords += crimeValues.length;
      }
    }
  }

  console.log(`\n  → ${totalNeighborhoods} total neighborhoods inserted`);
  console.log(`  → ${totalCrimeRecords} crime records inserted`);

  // 5. Verify counts
  console.log("\n[4] Verifying...");
  const countryCount = await db.select({ count: schema.countries.code }).from(schema.countries);
  const muniResult = await db.select({ count: schema.municipalities.id }).from(schema.municipalities);
  const nhoodResult = await db.select({ count: schema.neighborhoods.code }).from(schema.neighborhoods);

  console.log(`  Countries: ${countryCount.length}`);
  console.log(`  Municipalities: ${muniResult.length}`);
  console.log(`  Neighborhoods: ${nhoodResult.length}`);

  console.log("\n=== Seed complete! ===");
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
