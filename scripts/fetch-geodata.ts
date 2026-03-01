import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import simplify from "@turf/simplify";

const PDOK_WFS =
  "https://service.pdok.nl/cbs/wijkenbuurten/2024/wfs/v1_0";
const OUT_DIR = join(process.cwd(), "src/data");

export async function fetchGeoData() {
  mkdirSync(OUT_DIR, { recursive: true });

  console.log("\n[PDOK] Fetching Amsterdam buurt boundaries...");

  // Use OGC XML filter for Amsterdam municipality
  const ogcFilter = encodeURIComponent(
    '<Filter><PropertyIsEqualTo><PropertyName>gemeentecode</PropertyName><Literal>GM0363</Literal></PropertyIsEqualTo></Filter>'
  );
  const url = `${PDOK_WFS}?service=WFS&version=2.0.0&request=GetFeature&typeName=wijkenbuurten:buurten&outputFormat=json&srsName=EPSG:4326&count=1000&FILTER=${ogcFilter}`;
  console.log(`  GET ${url.slice(0, 120)}...`);

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`PDOK WFS error: ${res.status} ${res.statusText}`);
  }

  const geojson = await res.json();
  console.log(`  -> ${geojson.features?.length ?? 0} Amsterdam buurten`);

  // Strip unnecessary properties
  const stripped = {
    type: "FeatureCollection" as const,
    features: geojson.features.map(
      (f: {
        type: string;
        geometry: unknown;
        properties: Record<string, unknown>;
      }) => ({
        type: "Feature",
        geometry: f.geometry,
        properties: {
          buurtcode: f.properties.buurtcode,
          buurtnaam: f.properties.buurtnaam,
          aantalInwoners: Math.max(0, Number(f.properties.aantalInwoners) || 0),
          postcode: String(f.properties.meestVoorkomendePostcode ?? "").trim(),
        },
      })
    ),
  };

  // Simplify geometries to reduce file size
  console.log("  Simplifying geometries...");
  const simplified = simplify(stripped as GeoJSON.FeatureCollection, {
    tolerance: 0.0001,
    highQuality: true,
  });

  const output = JSON.stringify(simplified);
  const sizeMB = (output.length / 1024 / 1024).toFixed(2);
  console.log(`  -> Output size: ${sizeMB} MB`);

  writeFileSync(join(OUT_DIR, "amsterdam.geo.json"), output);
  console.log("[PDOK] GeoJSON saved successfully!");
}
