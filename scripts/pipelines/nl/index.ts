import { config } from "dotenv";
config({ path: ".env.local" });

import { existsSync, mkdirSync } from "fs";
import { join } from "path";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import * as schema from "../../../src/db/schema";
import { CITIES } from "../../../src/lib/cities";
import { fetchCBSData } from "./fetch-cbs-data";
import { fetchGeoData } from "./fetch-geodata";
import { processCity } from "./process";

const sql = neon(process.env.DATABASE_URL!);
const db = drizzle(sql, { schema });

const TEMP_DIR = join(process.cwd(), ".pipeline-temp");
const RAW_DIR = join(TEMP_DIR, "raw");
const GEO_DIR = join(TEMP_DIR, "geo");

async function run() {
  console.log("=== Netherlands Pipeline: CBS → Neon ===\n");

  mkdirSync(RAW_DIR, { recursive: true });
  mkdirSync(GEO_DIR, { recursive: true });

  const cities = CITIES.map((c) => ({
    id: c.id,
    name: c.name,
    gemeenteCode: c.gemeenteCode,
  }));

  // 1. Fetch CBS data (only for cities missing raw data)
  const citiesMissingRaw = cities.filter(
    (c) => !existsSync(join(RAW_DIR, c.id, "buurt-crimes.json"))
  );
  if (citiesMissingRaw.length > 0) {
    console.log(`[1] Fetching CBS data for ${citiesMissingRaw.length} cities...`);
    await fetchCBSData(citiesMissingRaw, RAW_DIR);
  } else {
    console.log("[1] CBS data exists for all cities, skipping fetch");
  }

  // 2. Fetch geodata (only for cities missing geo data)
  const citiesMissingGeo = cities.filter(
    (c) => !existsSync(join(GEO_DIR, `${c.id}.geo.json`))
  );
  if (citiesMissingGeo.length > 0) {
    console.log(`\n[2] Fetching geodata for ${citiesMissingGeo.length} cities...`);
    await fetchGeoData(citiesMissingGeo, GEO_DIR);
  } else {
    console.log("[2] Geodata exists for all cities, skipping fetch");
  }

  // 3. Ensure NL country record
  console.log("\n[3] Upserting NL country...");
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

  // 4. Process each city and write to DB
  console.log("\n[4] Processing cities and writing to DB...");

  for (const city of CITIES) {
    const rawDir = join(RAW_DIR, city.id);
    if (!existsSync(join(rawDir, "buurt-crimes.json"))) {
      console.log(`  Skipping ${city.id} — no raw data`);
      continue;
    }

    const result = processCity(city.id, city.gemeenteCode, RAW_DIR, GEO_DIR);

    // Upsert municipality
    const idx = {
      totalSectors: result.neighborhoods.length,
      avgScore: result.neighborhoods.length > 0
        ? Number((result.neighborhoods.reduce((s, n) => s + n.safetyScore, 0) / result.neighborhoods.length).toFixed(1))
        : 0,
      criticalCount: result.neighborhoods.filter((n) => n.threatLevel === "CRITICAL").length,
      avgRate: Number(result.cityAverages.totalRate.toFixed(1)),
    };

    // Delete existing data for this city (for full refresh)
    await db.delete(schema.crimeRecords).where(
      eq(schema.crimeRecords.neighborhoodCode, "PLACEHOLDER") // We handle this below
    );

    // Delete existing neighborhoods for this municipality
    const existingNhoods = await db
      .select({ code: schema.neighborhoods.code })
      .from(schema.neighborhoods)
      .where(eq(schema.neighborhoods.municipalityId, city.id));

    for (const n of existingNhoods) {
      await db.delete(schema.crimeRecords).where(eq(schema.crimeRecords.neighborhoodCode, n.code));
    }
    await db.delete(schema.neighborhoods).where(eq(schema.neighborhoods.municipalityId, city.id));
    await db.delete(schema.municipalities).where(eq(schema.municipalities.id, city.id));

    // Insert municipality
    await db.insert(schema.municipalities).values({
      id: city.id,
      countryCode: "nl",
      name: city.name,
      sourceCode: city.gemeenteCode,
      centerLat: city.center[0],
      centerLng: city.center[1],
      zoom: city.zoom,
      totalSectors: idx.totalSectors,
      avgScore: String(idx.avgScore),
      criticalCount: idx.criticalCount,
      avgRate: String(idx.avgRate),
      totalRate: String(result.cityAverages.totalRate),
      categoryRates: result.cityAverages.categoryRates,
      yearlyRates: result.cityAverages.yearlyRates,
    });

    // Build geometry lookup
    const geoMap = new Map(result.geojsonFeatures.map((f) => [f.code, f.geometry]));

    // Insert neighborhoods in chunks
    const CHUNK_SIZE = 50;
    for (let i = 0; i < result.neighborhoods.length; i += CHUNK_SIZE) {
      const chunk = result.neighborhoods.slice(i, i + CHUNK_SIZE);
      await db.insert(schema.neighborhoods).values(
        chunk.map((n) => ({
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
          geometry: geoMap.get(n.code) ?? null,
        }))
      );
    }

    // Insert crime records from latest year
    for (const n of result.neighborhoods) {
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
        await db.insert(schema.crimeRecords).values(crimeValues);
      }
    }

    console.log(`  ✓ ${city.name}: ${result.neighborhoods.length} neighborhoods written to DB`);
  }

  console.log("\n=== Netherlands pipeline complete! ===");
}

run().catch((err) => {
  console.error("Pipeline failed:", err);
  process.exit(1);
});
