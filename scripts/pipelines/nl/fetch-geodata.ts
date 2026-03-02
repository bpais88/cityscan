import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";
import simplify from "@turf/simplify";

const PDOK_WFS =
  "https://service.pdok.nl/cbs/wijkenbuurten/2024/wfs/v1_0";

interface CityConfig {
  id: string;
  gemeenteCode: string;
  name: string;
}

export async function fetchGeoData(cities: CityConfig[], outDir: string) {
  mkdirSync(outDir, { recursive: true });

  for (const city of cities) {
    console.log(`\n[PDOK] Fetching ${city.name} buurt boundaries...`);

    const ogcFilter = encodeURIComponent(
      `<Filter><PropertyIsEqualTo><PropertyName>gemeentecode</PropertyName><Literal>GM${city.gemeenteCode}</Literal></PropertyIsEqualTo></Filter>`
    );
    const url = `${PDOK_WFS}?service=WFS&version=2.0.0&request=GetFeature&typeName=wijkenbuurten:buurten&outputFormat=json&srsName=EPSG:4326&count=1000&FILTER=${ogcFilter}`;
    console.log(`  GET ${url.slice(0, 120)}...`);

    const res = await fetch(url);
    if (!res.ok) {
      console.error(`  PDOK error for ${city.name}: ${res.status} — skipping`);
      continue;
    }

    const geojson = await res.json();
    console.log(`  -> ${geojson.features?.length ?? 0} buurten`);

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

    console.log("  Simplifying geometries...");
    const simplified = simplify(stripped as GeoJSON.FeatureCollection, {
      tolerance: 0.0001,
      highQuality: true,
    });

    const output = JSON.stringify(simplified);
    const sizeMB = (output.length / 1024 / 1024).toFixed(2);
    console.log(`  -> Output size: ${sizeMB} MB`);

    writeFileSync(join(outDir, `${city.id}.geo.json`), output);
  }

  console.log("\n[PDOK] All city GeoJSON saved!");
}
