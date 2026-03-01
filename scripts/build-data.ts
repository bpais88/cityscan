import { fetchCBSData } from "./fetch-cbs-data";
import { fetchGeoData } from "./fetch-geodata";
import { processData } from "./process-data";
import { existsSync } from "fs";
import { join } from "path";

async function main() {
  const rawDir = join(process.cwd(), "src/data/raw");
  const hasRawData = existsSync(join(rawDir, "buurt-crimes.json"));
  const hasGeoData = existsSync(
    join(process.cwd(), "src/data/amsterdam.geo.json")
  );

  if (!hasRawData) {
    console.log("=== FETCHING CBS DATA ===");
    await fetchCBSData();
  } else {
    console.log("=== CBS DATA EXISTS, SKIPPING FETCH (delete src/data/raw to refetch) ===");
  }

  if (!hasGeoData) {
    console.log("\n=== FETCHING GEODATA ===");
    await fetchGeoData();
  } else {
    console.log("=== GEODATA EXISTS, SKIPPING FETCH ===");
  }

  console.log("\n=== PROCESSING DATA ===");
  await processData();

  console.log("\n=== BUILD COMPLETE ===");
}

main().catch((err) => {
  console.error("Build failed:", err);
  process.exit(1);
});
