import {
  pgTable,
  text,
  integer,
  doublePrecision,
  numeric,
  jsonb,
  bigint,
  unique,
  index,
} from "drizzle-orm/pg-core";

export const countries = pgTable("countries", {
  code: text("code").primaryKey(),
  name: text("name").notNull(),
  centerLat: doublePrecision("center_lat").notNull(),
  centerLng: doublePrecision("center_lng").notNull(),
  zoom: integer("zoom").notNull().default(7),
  dataSource: text("data_source").notNull().default(""),
});

export const municipalities = pgTable(
  "municipalities",
  {
    id: text("id").primaryKey(),
    countryCode: text("country_code")
      .notNull()
      .references(() => countries.code),
    name: text("name").notNull(),
    sourceCode: text("source_code").notNull(),
    centerLat: doublePrecision("center_lat").notNull(),
    centerLng: doublePrecision("center_lng").notNull(),
    zoom: integer("zoom").notNull().default(12),
    totalSectors: integer("total_sectors").notNull().default(0),
    avgScore: numeric("avg_score").notNull().default("0"),
    criticalCount: integer("critical_count").notNull().default(0),
    avgRate: numeric("avg_rate").notNull().default("0"),
    totalRate: numeric("total_rate").notNull().default("0"),
    categoryRates: jsonb("category_rates").notNull().default({}),
    yearlyRates: jsonb("yearly_rates").notNull().default({}),
  },
  (t) => [
    unique().on(t.countryCode, t.sourceCode),
    index("idx_municipalities_country").on(t.countryCode),
  ]
);

export const neighborhoods = pgTable(
  "neighborhoods",
  {
    code: text("code").primaryKey(),
    municipalityId: text("municipality_id")
      .notNull()
      .references(() => municipalities.id),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    population: integer("population").notNull().default(0),
    totalCrimes: integer("total_crimes").notNull().default(0),
    crimeRate: numeric("crime_rate").notNull().default("0"),
    safetyScore: integer("safety_score").notNull().default(5),
    threatLevel: text("threat_level").notNull().default("MODERATE"),
    categories: jsonb("categories").notNull().default({}),
    categoryRates: jsonb("category_rates").notNull().default({}),
    trends: jsonb("trends").notNull().default([]),
    centroidLng: doublePrecision("centroid_lng").notNull().default(0),
    centroidLat: doublePrecision("centroid_lat").notNull().default(0),
    postcode: text("postcode").notNull().default(""),
    aliases: text("aliases").array().notNull().default([]),
    geometry: jsonb("geometry"),
  },
  (t) => [
    index("idx_neighborhoods_municipality").on(t.municipalityId),
    index("idx_neighborhoods_slug").on(t.municipalityId, t.slug),
  ]
);

export const crimeRecords = pgTable(
  "crime_records",
  {
    id: bigint("id", { mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    neighborhoodCode: text("neighborhood_code")
      .notNull()
      .references(() => neighborhoods.code),
    year: text("year").notNull(),
    category: text("category").notNull(),
    count: integer("count").notNull().default(0),
  },
  (t) => [
    unique().on(t.neighborhoodCode, t.year, t.category),
    index("idx_crime_records_neighborhood").on(t.neighborhoodCode),
  ]
);
