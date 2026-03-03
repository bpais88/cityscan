# CityScan Project

## Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Database:** Neon (serverless Postgres) + Drizzle ORM
- **Maps:** Leaflet + react-leaflet
- **Styling:** Tailwind CSS (dark intelligence aesthetic)
- **Deployment:** Vercel

## Project Structure

```
src/
├── app/[country]/              # Country page (municipality grid)
│   ├── [city]/                 # City page (neighborhood map)
│   │   └── [slug]/            # Neighborhood detail
│   └── compare/               # National overview (map + rankings)
├── components/
│   ├── map/                   # SafetyMap, MapLegend, SafetyMapWrapper
│   └── compare/               # CountryMap, RankingSidebar, CompareClient
├── db/
│   ├── schema.ts              # Drizzle schema (countries, municipalities, neighborhoods, crime_records)
│   ├── queries.ts             # All DB query functions
│   └── index.ts               # Neon client init
├── lib/
│   ├── constants.ts           # Colors, tile URLs, scoring functions
│   ├── types.ts               # TypeScript interfaces
│   ├── cities.ts              # Municipality config (CBS codes, coordinates)
│   └── aliases.ts             # Neighborhood name aliases
scripts/
├── pipelines/nl/
│   ├── index.ts               # Pipeline orchestrator
│   ├── fetch-cbs-data.ts      # CBS Open Data API fetcher
│   ├── fetch-geodata.ts       # PDOK WFS boundary fetcher
│   └── process.ts             # Data transformation + scoring
├── seed-database.ts
└── setup-database.ts
```

## Data Hierarchy

Netherlands has 3 levels:
1. **Provinces** (12) — e.g., Limburg, Noord-Holland (not modeled as entities)
2. **Municipalities** (gemeenten) — e.g., Amsterdam, Maastricht — configured in `src/lib/cities.ts`
3. **Neighborhoods** (buurten) — the sectors shown on city maps

## Adding New Municipalities

Use the `/add-municipality` skill for a guided workflow, or follow these manual steps:

### 1. Find the CBS gemeente code
Look up the 4-digit code at [CBS gemeentelijke indelingen](https://www.cbs.nl/nl-nl/onze-diensten/methoden/classificaties/overig/gemeentelijke-indelingen-per-jaar).

### 2. Add entry to `src/lib/cities.ts`
```ts
{ id: "city-slug", name: "City Name", gemeenteCode: "0123", center: [lat, lng], zoom: 13 },
```
- `id`: URL slug (lowercase, hyphenated)
- `gemeenteCode`: 4-digit CBS code (with leading zero)
- `center`: approximate [latitude, longitude] for map centering
- `zoom`: 12 for large cities, 13 for medium, 14 for small

### 3. Run the pipeline
```bash
npm run pipeline:nl
```
This fetches CBS crime data + PDOK geodata for any cities missing cached data, processes it, and writes to the database. Takes ~2-5 min per new city due to API rate limiting.

### 4. Verify locally
```bash
npm run dev
# Visit /nl to see the new municipality tile
# Visit /nl/{city-slug} to see the neighborhood map
```

### 5. Deploy
```bash
git add src/lib/cities.ts
git commit -m "Add {city name} municipality"
git push
```

## Key Conventions

- **Map components** must use `ssr: false` via dynamic imports (Leaflet is client-only)
- **MapController** side effects must be in `useEffect`, not during render
- **Color functions:** Use `getScoreColor()` / `getChoroplethColor()` from constants.ts, not inline
- **Scoring:** Safety score 1-10 where 10 = safest. Threat levels: LOW (8+), MODERATE (6+), HIGH (4+), CRITICAL (<4)
- **ISR caching:** Data pages use `revalidate = 60` for near-realtime updates
- **Pipeline:** Incremental — only fetches data for cities missing from `.pipeline-temp/`

## Data Sources

- **Crime stats:** CBS Open Data API (dataset 47018NED)
- **Geographic boundaries:** PDOK WFS (wijkenbuurten 2024)
- **Population:** Aggregated from neighborhood-level PDOK data
