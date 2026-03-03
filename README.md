# CITYSCAN

Neighborhood safety intelligence for Dutch municipalities. Visualizes **real crime data** from official government sources across 45 municipalities and 1,900+ neighborhoods.

Live at: [cityscan.vercel.app](https://cityscan.vercel.app)

## Data Sources

All data in this project is **real, publicly available government data** — not dummy or synthetic data.

### CBS (Centraal Bureau voor de Statistiek)

Crime statistics come from the **CBS Open Data API**, specifically dataset **47018NED** — "Geregistreerde criminaliteit; soort misdrijf, regio" (Registered crime by type and region).

- **API endpoint**: `https://dataderden.cbs.nl/ODataApi/OData/47018NED`
- **Protocol**: OData v3 with JSON format
- **Coverage**: Annual crime counts per buurt (neighborhood), broken down by 59 crime types
- **Years**: Last 5 available years (currently 2021-2025)
- **Granularity**: Individual buurten (neighborhoods), identified by CBS buurtcode (e.g. `BU0363xxxx` for Amsterdam)
- **Measure**: `GeregistreerdeMisdrijven_1` — number of registered crimes (integer, or null when suppressed for privacy)

CBS suppresses small counts (typically < 5) to protect privacy. These are treated as 0 in our calculations.

### PDOK (Publieke Dienstverlening Op de Kaart)

Geographic boundaries come from the **PDOK WFS service** for Wijken en Buurten 2024.

- **API endpoint**: `https://service.pdok.nl/cbs/wijkenbuurten/2024/wfs/v1_0`
- **Protocol**: WFS 2.0 with GeoJSON output
- **Data**: Buurt (neighborhood) boundary polygons with population counts
- **Join key**: CBS buurtcode links crime data to geographic boundaries

## Municipalities

Currently covers 45 municipalities across 4 provinces:

- **Noord-Holland** (12): Amsterdam, Haarlem, Zaanstad, Haarlemmermeer, Amstelveen, Purmerend, Edam-Volendam, Bloemendaal, Diemen, Ouder-Amstel, Wijdemeren, De Ronde Venen
- **Zuid-Holland** (2): Rotterdam, Den Haag
- **Noord-Brabant** (1): Tilburg
- **Limburg** (30): Maastricht, Venlo, Sittard-Geleen, Heerlen, Weert, Roermond, Venray, Kerkrade, and 22 more

## How It Works

### Data Pipeline

1. **Fetch** (`npm run pipeline:nl`) — Downloads raw crime data from CBS and boundary GeoJSON from PDOK. Incremental: only fetches data for cities missing from the local cache. Takes ~2-5 min per new city.

2. **Process** — Groups 59 CBS crime types into 6 categories (Property, Violent, Drug-Related, Fraud, Vandalism, Other). Calculates per-capita crime rates, safety scores, and trend data per neighborhood.

3. **Write** — Inserts processed data directly into the Neon Postgres database. No static JSON files needed.

### Safety Score

Each neighborhood gets a safety score from 1-10 based on its crime rate relative to the city average:

```
buurtRate = totalCrimes / population * 1000
cityRate  = totalCitywide / totalPopulation * 1000
relative  = ((cityRate - buurtRate) / cityRate) * 100
score     = clamp(round(((relative + 100) / 200) * 9) + 1, 1, 10)
```

| Score | Threat Level |
|-------|-------------|
| 8-10 | LOW |
| 6-7 | MODERATE |
| 4-5 | HIGH |
| 1-3 | CRITICAL |

Neighborhoods with fewer than 50 residents are excluded (insufficient data).

### Crime Categories

| Category | Description |
|----------|-------------|
| Property | Burglary, theft, bike theft, pickpocketing, shoplifting |
| Violent | Assault, threats, robbery, murder, sexual offenses |
| Drug-Related | Drug trade, nuisance, DUI |
| Fraud & Cyber | Financial fraud, cybercrime |
| Vandalism | Property damage, arson, domestic disputes |
| Other | Traffic, environmental, administrative |

## Development

```bash
npm install
npm run dev          # Start dev server at localhost:3000
```

### Adding New Municipalities

#### With Claude Code (recommended)

Use the `/add-municipality` skill for a fully guided workflow:

```
/add-municipality Eindhoven and Utrecht
/add-municipality all of Gelderland
/add-municipality Groningen
```

This handles CBS code lookup, coordinate finding, `cities.ts` updates, pipeline execution, and deployment automatically.

#### Manual steps

1. Find the gemeente code on [CBS](https://www.cbs.nl/nl-nl/onze-diensten/methoden/classificaties/overig/gemeentelijke-indelingen-per-jaar) (4-digit, zero-padded)
2. Add an entry to `src/lib/cities.ts` with id, name, gemeenteCode, center coordinates, and zoom level
3. Optionally add popular area name aliases in `src/lib/aliases.ts`
4. Run `npm run pipeline:nl` to fetch, process, and write to the database
5. Commit and push `src/lib/cities.ts`

### Refreshing Data

To re-fetch all data from CBS and PDOK:

```bash
rm -rf .pipeline-temp    # Clear cache to force full re-fetch
npm run pipeline:nl      # ~2-5 min per city
```

## Tech Stack

- **Next.js 16** (App Router, Turbopack)
- **TypeScript**, **Tailwind CSS v4**
- **Neon** (serverless Postgres) + **Drizzle ORM**
- **Leaflet** + react-leaflet (dark CartoDB tiles)
- **Recharts** (crime trend charts)
- Deployed on **Vercel** with ISR

## License

Data sourced from CBS and PDOK is public domain under Dutch open data policy (CC0).
