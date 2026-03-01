# CITYSCAN

Neighborhood safety intelligence for Dutch municipalities. Visualizes **real crime data** from official government sources across 11 cities and 892 neighborhoods.

Live at: [cityscan.vercel.app](https://cityscan.vercel.app)

## Data Sources

All data in this project is **real, publicly available government data** — not dummy or synthetic data.

### CBS (Centraal Bureau voor de Statistiek)

Crime statistics come from the **CBS Open Data API**, specifically dataset **47018NED** — "Geregistreerde criminaliteit; soort misdrijf, regio" (Registered crime by type and region).

- **API endpoint**: `https://dataderden.cbs.nl/ODataApi/OData/47018NED`
- **Protocol**: OData v3 with JSON format
- **Coverage**: Annual crime counts per buurt (neighborhood), broken down by 59 crime types
- **Years**: Last 5 available years (currently 2019-2023)
- **Granularity**: Individual buurten (neighborhoods), identified by CBS buurtcode (e.g. `BU0363xxxx` for Amsterdam)
- **Measure**: `GeregistreerdeMisdrijven_1` — number of registered crimes (integer, or null when suppressed for privacy)

CBS suppresses small counts (typically < 5) to protect privacy. These are treated as 0 in our calculations.

### PDOK (Publieke Dienstverlening Op de Kaart)

Geographic boundaries come from the **PDOK WFS service** for Wijken en Buurten 2024.

- **API endpoint**: `https://service.pdok.nl/cbs/wijkenbuurten/2024/wfs/v1_0`
- **Protocol**: WFS 2.0 with GeoJSON output
- **Data**: Buurt (neighborhood) boundary polygons with population counts
- **Join key**: CBS buurtcode links crime data to geographic boundaries

## Cities

| City | Code | Neighborhoods |
|------|------|---------------|
| Amsterdam | GM0363 | ~481 |
| Haarlem | GM0392 | ~64 |
| Bloemendaal | GM0377 | ~16 |
| Edam-Volendam | GM0385 | ~22 |
| Purmerend | GM0439 | ~33 |
| Zaanstad | GM0479 | ~90 |
| Haarlemmermeer | GM0394 | ~83 |
| Amstelveen | GM0362 | ~41 |
| Diemen | GM0384 | ~17 |
| Ouder-Amstel | GM0437 | ~11 |
| Wijdemeren | GM1696 | ~17 |

## How It Works

### Data Pipeline

1. **Fetch** (`npm run fetch:data`) — Downloads raw crime data from CBS and boundary GeoJSON from PDOK for all configured cities. Takes ~15-20 minutes due to API pagination and rate limiting.

2. **Process** — Groups 59 CBS crime types into 6 categories (Property, Violent, Drug-Related, Fraud, Vandalism, Other). Calculates per-capita crime rates, safety scores, and trend data per neighborhood.

3. **Output** — Generates processed JSON files committed to git under `src/data/`. This means Vercel deployments never call external APIs — the site builds from local data in seconds.

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

### Refreshing Data

To fetch the latest data from CBS and PDOK:

```bash
npm run fetch:data   # ~15-20 min, requires internet
```

This updates files under `src/data/`. Commit the updated files after fetching.

### Adding a New City

1. Find the gemeente code on [CBS](https://www.cbs.nl/nl-nl/onze-diensten/methoden/classificaties/overig/gemeentelijke-indelingen-per-jaar) (4-digit, zero-padded)
2. Add an entry to `src/lib/cities.ts` with id, name, gemeenteCode, center coordinates, and zoom level
3. Optionally add popular area name aliases in `src/lib/aliases.ts`
4. Run `npm run fetch:data` to download and process the new city's data
5. Commit the new data files

## Tech Stack

- **Next.js 16** (App Router, static export)
- **TypeScript**, **Tailwind CSS v4**
- **Leaflet** + react-leaflet (dark CartoDB tiles)
- **Recharts** (crime trend charts)
- **Fuse.js** (fuzzy neighborhood search)
- Deployed on **Vercel** as a fully static site

## License

Data sourced from CBS and PDOK is public domain under Dutch open data policy (CC0).
