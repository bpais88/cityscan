# Add Municipality

Add one or more Dutch municipalities to CityScan.

## Input

The user will provide municipality names (e.g., "Eindhoven", "Utrecht", "all of Gelderland").

## Steps

### 1. Look up CBS gemeente codes

Search the web for the CBS 4-digit gemeente code for each municipality. The official source is:
https://www.cbs.nl/nl-nl/onze-diensten/methoden/classificaties/overig/gemeentelijke-indelingen-per-jaar

For provinces, find ALL municipalities in that province with their codes.

### 2. Check for duplicates

Read `src/lib/cities.ts` and verify none of the municipalities already exist.

### 3. Find coordinates

For each municipality, find approximate center coordinates (latitude, longitude). These are just for map centering — they don't need to be exact.

### 4. Add to cities.ts

Add entries to the `CITIES` array in `src/lib/cities.ts`:
```ts
{ id: "slug-name", name: "Display Name", gemeenteCode: "0123", center: [lat, lng], zoom: 13 },
```

Rules:
- `id`: lowercase, hyphenated URL slug
- `gemeenteCode`: 4-digit CBS code with leading zero
- `center`: [latitude, longitude]
- `zoom`: 12 for large cities (>200K pop), 13 for medium, 14 for small (<20K pop)
- Group by province with a comment

### 5. Run the pipeline

```bash
npm run pipeline:nl
```

This will:
- Fetch CBS crime data for new cities only (incremental)
- Fetch PDOK geodata (boundaries, population) for new cities only
- Process and compute safety scores
- Write everything to the Neon database

Wait for it to complete. It takes ~2-5 minutes per city due to CBS API rate limits.

### 6. Verify

After the pipeline completes, run `npm run build` to verify compilation.

### 7. Commit and push

```bash
git add src/lib/cities.ts
git commit -m "Add {description} municipalities"
git push
```

Report how many municipalities were added and the total count.
