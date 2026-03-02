import { getDb } from "./index";
import { countries, municipalities, neighborhoods } from "./schema";
import { eq, and, sql } from "drizzle-orm";
import type {
  Neighborhood,
  CityAverages,
  CityIndex,
  CrimeCategory,
  MunicipalityComparison,
} from "@/lib/types";

// ── Country queries ─────────────────────────────────────────────

export async function getCountries() {
  return getDb().select().from(countries);
}

export async function getCountry(code: string) {
  const rows = await getDb()
    .select()
    .from(countries)
    .where(eq(countries.code, code))
    .limit(1);
  return rows[0] ?? null;
}

// ── Municipality / City queries ─────────────────────────────────

/** Returns CityIndex[] for the landing/country page (same shape as city-index.json) */
export async function getCityIndex(countryCode: string): Promise<CityIndex[]> {
  const populationSub = getDb()
    .select({
      municipalityId: neighborhoods.municipalityId,
      totalPopulation: sql<number>`coalesce(sum(${neighborhoods.population}), 0)`.as(
        "total_population"
      ),
    })
    .from(neighborhoods)
    .groupBy(neighborhoods.municipalityId)
    .as("pop");

  const rows = await getDb()
    .select({
      id: municipalities.id,
      name: municipalities.name,
      totalSectors: municipalities.totalSectors,
      avgScore: municipalities.avgScore,
      criticalCount: municipalities.criticalCount,
      avgRate: municipalities.avgRate,
      totalPopulation: populationSub.totalPopulation,
    })
    .from(municipalities)
    .leftJoin(populationSub, eq(municipalities.id, populationSub.municipalityId))
    .where(eq(municipalities.countryCode, countryCode));

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    totalSectors: r.totalSectors,
    avgScore: Number(r.avgScore),
    criticalCount: r.criticalCount,
    avgRate: Number(r.avgRate),
    totalPopulation: Number(r.totalPopulation ?? 0),
  }));
}

/** Returns all municipalities with coordinates for the national comparison map */
export async function getAllMunicipalitiesForComparison(
  countryCode: string
): Promise<MunicipalityComparison[]> {
  const rows = await getDb()
    .select({
      id: municipalities.id,
      name: municipalities.name,
      totalSectors: municipalities.totalSectors,
      avgScore: municipalities.avgScore,
      criticalCount: municipalities.criticalCount,
      avgRate: municipalities.avgRate,
      totalRate: municipalities.totalRate,
      centerLat: municipalities.centerLat,
      centerLng: municipalities.centerLng,
    })
    .from(municipalities)
    .where(eq(municipalities.countryCode, countryCode));

  return rows.map((r) => ({
    id: r.id,
    name: r.name,
    totalSectors: r.totalSectors,
    avgScore: Number(r.avgScore),
    criticalCount: r.criticalCount,
    avgRate: Number(r.avgRate),
    totalRate: Number(r.totalRate),
    centerLat: r.centerLat,
    centerLng: r.centerLng,
  }));
}

/** Replaces CITIES.find() — returns municipality config for map rendering */
export async function getMunicipality(id: string) {
  const rows = await getDb()
    .select()
    .from(municipalities)
    .where(eq(municipalities.id, id))
    .limit(1);
  return rows[0] ?? null;
}

// ── Neighborhood queries ────────────────────────────────────────

/** Returns Neighborhood[] for a city (same shape as neighborhoods.json) */
export async function getNeighborhoods(cityId: string): Promise<Neighborhood[]> {
  const rows = await getDb()
    .select()
    .from(neighborhoods)
    .where(eq(neighborhoods.municipalityId, cityId));

  return rows.map(rowToNeighborhood);
}

/** Returns CityAverages for a city (same shape as city-averages.json) */
export async function getCityAverages(cityId: string): Promise<CityAverages> {
  const muni = await getMunicipality(cityId);
  if (!muni) {
    return {
      totalRate: 0,
      categoryRates: { PROPERTY: 0, VIOLENT: 0, DRUGS: 0, FRAUD: 0, VANDALISM: 0, OTHER: 0 },
      yearlyRates: {},
    };
  }
  return {
    totalRate: Number(muni.totalRate),
    categoryRates: muni.categoryRates as Record<CrimeCategory, number>,
    yearlyRates: muni.yearlyRates as Record<string, number>,
  };
}

/** Reconstructs GeoJSON FeatureCollection from geometry column */
export async function getGeoJSON(cityId: string): Promise<GeoJSON.FeatureCollection> {
  const rows = await getDb()
    .select({
      code: neighborhoods.code,
      name: neighborhoods.name,
      population: neighborhoods.population,
      postcode: neighborhoods.postcode,
      geometry: neighborhoods.geometry,
    })
    .from(neighborhoods)
    .where(eq(neighborhoods.municipalityId, cityId));

  const features: GeoJSON.Feature[] = rows
    .filter((r) => r.geometry != null)
    .map((r) => ({
      type: "Feature" as const,
      properties: {
        buurtcode: r.code,
        buurtnaam: r.name,
        aantalInwoners: r.population,
        postcode: r.postcode,
      },
      geometry: r.geometry as GeoJSON.Geometry,
    }));

  return { type: "FeatureCollection", features };
}

/** Efficient single-row lookup by slug */
export async function getNeighborhoodBySlug(
  cityId: string,
  slug: string
): Promise<Neighborhood | null> {
  const rows = await getDb()
    .select()
    .from(neighborhoods)
    .where(
      and(eq(neighborhoods.municipalityId, cityId), eq(neighborhoods.slug, slug))
    )
    .limit(1);

  return rows[0] ? rowToNeighborhood(rows[0]) : null;
}

// ── Search ──────────────────────────────────────────────────────

export interface GlobalSearchResult {
  type: "municipality" | "neighborhood";
  id: string;
  name: string;
  slug: string;
  municipalityId?: string;
  municipalityName?: string;
  countryCode: string;
  safetyScore?: number;
  threatLevel?: string;
}

/** Postgres trigram search across municipalities and neighborhoods */
export async function searchGlobal(
  query: string,
  countryCode?: string
): Promise<GlobalSearchResult[]> {
  const results: GlobalSearchResult[] = [];

  // Search municipalities
  const muniQuery = countryCode
    ? getDb()
        .select()
        .from(municipalities)
        .where(
          and(
            eq(municipalities.countryCode, countryCode),
            sql`${municipalities.name} % ${query} OR ${municipalities.name} ILIKE ${"%" + query + "%"}`
          )
        )
        .limit(5)
    : getDb()
        .select()
        .from(municipalities)
        .where(
          sql`${municipalities.name} % ${query} OR ${municipalities.name} ILIKE ${"%" + query + "%"}`
        )
        .limit(5);

  const munis = await muniQuery;
  for (const m of munis) {
    results.push({
      type: "municipality",
      id: m.id,
      name: m.name,
      slug: m.id,
      countryCode: m.countryCode,
    });
  }

  // Search neighborhoods
  const nhoodQuery = countryCode
    ? sql`
        SELECT n.*, m.name as municipality_name, m.country_code
        FROM neighborhoods n
        JOIN municipalities m ON n.municipality_id = m.id
        WHERE m.country_code = ${countryCode}
          AND (n.name % ${query} OR n.name ILIKE ${"%" + query + "%"} OR n.postcode ILIKE ${"%" + query + "%"})
        LIMIT 10
      `
    : sql`
        SELECT n.*, m.name as municipality_name, m.country_code
        FROM neighborhoods n
        JOIN municipalities m ON n.municipality_id = m.id
        WHERE (n.name % ${query} OR n.name ILIKE ${"%" + query + "%"} OR n.postcode ILIKE ${"%" + query + "%"})
        LIMIT 10
      `;

  const nhoods = await getDb().execute(nhoodQuery);
  for (const r of nhoods.rows) {
    results.push({
      type: "neighborhood",
      id: r.code as string,
      name: r.name as string,
      slug: r.slug as string,
      municipalityId: r.municipality_id as string,
      municipalityName: r.municipality_name as string,
      countryCode: r.country_code as string,
      safetyScore: r.safety_score as number,
      threatLevel: r.threat_level as string,
    });
  }

  return results;
}

// ── Helpers ─────────────────────────────────────────────────────

function rowToNeighborhood(r: typeof neighborhoods.$inferSelect): Neighborhood {
  return {
    code: r.code,
    name: r.name,
    slug: r.slug,
    population: r.population,
    totalCrimes: r.totalCrimes,
    crimeRate: Number(r.crimeRate),
    safetyScore: r.safetyScore,
    threatLevel: r.threatLevel as Neighborhood["threatLevel"],
    categories: r.categories as Record<CrimeCategory, number>,
    categoryRates: r.categoryRates as Record<CrimeCategory, number>,
    trends: r.trends as Neighborhood["trends"],
    centroid: [r.centroidLng, r.centroidLat],
    postcode: r.postcode,
    ...(r.aliases.length > 0 ? { aliases: r.aliases } : {}),
  };
}
