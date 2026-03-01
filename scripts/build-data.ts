import { fetchCBSData } from "./fetch-cbs-data";
import { fetchGeoData } from "./fetch-geodata";
import { processData } from "./process-data";
import { existsSync } from "fs";
import { join } from "path";
import { CITIES } from "../src/lib/cities";

async function main() {
  const rawDir = join(process.cwd(), "src/data/raw");
  const dataDir = join(process.cwd(), "src/data");

  // Check if any city has raw data
  const hasAnyRawData = CITIES.some((city) =>
    existsSync(join(rawDir, city.id, "buurt-crimes.json"))
  );

  // Check if any city has geo data
  const hasAnyGeoData = CITIES.some((city) =>
    existsSync(join(dataDir, `${city.id}.geo.json`))
  );

  if (!hasAnyRawData) {
    console.log("=== FETCHING CBS DATA ===");
    await fetchCBSData();
  } else {
    console.log("=== CBS DATA EXISTS, SKIPPING FETCH (delete src/data/raw to refetch) ===");
    // Check which cities are missing
    const missing = CITIES.filter(
      (city) => !existsSync(join(rawDir, city.id, "buurt-crimes.json"))
    );
    if (missing.length > 0) {
      console.log(`  Missing cities: ${missing.map((c) => c.id).join(", ")}`);
      console.log("  Fetching missing city data...");
      await fetchCBSData();
    }
  }

  if (!hasAnyGeoData) {
    console.log("\n=== FETCHING GEODATA ===");
    await fetchGeoData();
  } else {
    console.log("=== GEODATA EXISTS, SKIPPING FETCH ===");
    const missingGeo = CITIES.filter(
      (city) => !existsSync(join(dataDir, `${city.id}.geo.json`))
    );
    if (missingGeo.length > 0) {
      console.log(`  Missing geo: ${missingGeo.map((c) => c.id).join(", ")}`);
      console.log("  Fetching missing geodata...");
      await fetchGeoData();
    }
  }

  console.log("\n=== PROCESSING DATA ===");
  await processData();

  console.log("\n=== BUILD COMPLETE ===");
}

main().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
