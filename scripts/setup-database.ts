import { config } from "dotenv";
config({ path: ".env.local" });
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL!);

async function setup() {
  console.log("=== Setting up Neon database ===\n");

  // Enable pg_trgm extension for fuzzy search
  console.log("[1/6] Enabling pg_trgm extension...");
  await sql`CREATE EXTENSION IF NOT EXISTS pg_trgm`;

  // Create countries table
  console.log("[2/6] Creating countries table...");
  await sql`
    CREATE TABLE IF NOT EXISTS countries (
      code TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      center_lat DOUBLE PRECISION NOT NULL,
      center_lng DOUBLE PRECISION NOT NULL,
      zoom INT NOT NULL DEFAULT 7,
      data_source TEXT NOT NULL DEFAULT ''
    )
  `;

  // Create municipalities table
  console.log("[3/6] Creating municipalities table...");
  await sql`
    CREATE TABLE IF NOT EXISTS municipalities (
      id TEXT PRIMARY KEY,
      country_code TEXT NOT NULL REFERENCES countries(code),
      name TEXT NOT NULL,
      source_code TEXT NOT NULL,
      center_lat DOUBLE PRECISION NOT NULL,
      center_lng DOUBLE PRECISION NOT NULL,
      zoom INT NOT NULL DEFAULT 12,
      total_sectors INT NOT NULL DEFAULT 0,
      avg_score NUMERIC NOT NULL DEFAULT 0,
      critical_count INT NOT NULL DEFAULT 0,
      avg_rate NUMERIC NOT NULL DEFAULT 0,
      total_rate NUMERIC NOT NULL DEFAULT 0,
      category_rates JSONB NOT NULL DEFAULT '{}',
      yearly_rates JSONB NOT NULL DEFAULT '{}',
      UNIQUE (country_code, source_code)
    )
  `;

  // Create neighborhoods table
  console.log("[4/6] Creating neighborhoods table...");
  await sql`
    CREATE TABLE IF NOT EXISTS neighborhoods (
      code TEXT PRIMARY KEY,
      municipality_id TEXT NOT NULL REFERENCES municipalities(id),
      name TEXT NOT NULL,
      slug TEXT NOT NULL,
      population INT NOT NULL DEFAULT 0,
      total_crimes INT NOT NULL DEFAULT 0,
      crime_rate NUMERIC NOT NULL DEFAULT 0,
      safety_score INT NOT NULL DEFAULT 5,
      threat_level TEXT NOT NULL DEFAULT 'MODERATE',
      categories JSONB NOT NULL DEFAULT '{}',
      category_rates JSONB NOT NULL DEFAULT '{}',
      trends JSONB NOT NULL DEFAULT '[]',
      centroid_lng DOUBLE PRECISION NOT NULL DEFAULT 0,
      centroid_lat DOUBLE PRECISION NOT NULL DEFAULT 0,
      postcode TEXT NOT NULL DEFAULT '',
      aliases TEXT[] NOT NULL DEFAULT '{}',
      geometry JSONB
    )
  `;

  // Create crime_records table
  console.log("[5/6] Creating crime_records table...");
  await sql`
    CREATE TABLE IF NOT EXISTS crime_records (
      id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
      neighborhood_code TEXT NOT NULL REFERENCES neighborhoods(code),
      year TEXT NOT NULL,
      category TEXT NOT NULL,
      count INT NOT NULL DEFAULT 0,
      UNIQUE (neighborhood_code, year, category)
    )
  `;

  // Create indexes
  console.log("[6/6] Creating indexes...");
  await sql`CREATE INDEX IF NOT EXISTS idx_municipalities_country ON municipalities(country_code)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_neighborhoods_municipality ON neighborhoods(municipality_id)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_neighborhoods_slug ON neighborhoods(municipality_id, slug)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_crime_records_neighborhood ON crime_records(neighborhood_code)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_municipalities_name_trgm ON municipalities USING gin (name gin_trgm_ops)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_neighborhoods_name_trgm ON neighborhoods USING gin (name gin_trgm_ops)`;
  await sql`CREATE INDEX IF NOT EXISTS idx_neighborhoods_postcode_trgm ON neighborhoods USING gin (postcode gin_trgm_ops)`;

  console.log("\n=== Database setup complete! ===");
}

setup().catch((err) => {
  console.error("Setup failed:", err);
  process.exit(1);
});
