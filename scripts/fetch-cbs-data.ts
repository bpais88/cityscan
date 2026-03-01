import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const API_BASE = "https://dataderden.cbs.nl/ODataApi/OData/47018NED";
const OUT_DIR = join(process.cwd(), "src/data/raw");
const DELAY_MS = 600;
const PAGE_SIZE = 5000;

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchJson(url: string, retries = 3): Promise<unknown> {
  console.log(`  GET ${url.slice(0, 140)}...`);
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url);
      if (res.ok) return res.json();
      if (res.status === 500 && attempt < retries) {
        console.log(`  -> 500 error, retrying in ${attempt * 2}s (attempt ${attempt}/${retries})...`);
        await sleep(attempt * 2000);
        continue;
      }
      throw new Error(`HTTP ${res.status}: ${url}`);
    } catch (err) {
      if (attempt === retries) throw err;
      console.log(`  -> Error, retrying in ${attempt * 2}s...`);
      await sleep(attempt * 2000);
    }
  }
  throw new Error("Unreachable");
}

interface ODataResponse {
  value: Record<string, unknown>[];
  "odata.nextLink"?: string;
}

async function fetchAllPages(url: string): Promise<Record<string, unknown>[]> {
  const all: Record<string, unknown>[] = [];
  let currentUrl: string | undefined = url;

  while (currentUrl) {
    await sleep(DELAY_MS);
    const data = (await fetchJson(currentUrl)) as ODataResponse;
    all.push(...data.value);
    currentUrl = data["odata.nextLink"];
    console.log(`  ... fetched ${all.length} records so far`);
  }

  return all;
}

async function fetchPaginated(
  baseUrl: string,
  filter: string,
): Promise<Record<string, unknown>[]> {
  const all: Record<string, unknown>[] = [];
  let skip = 0;

  while (true) {
    // Only encode spaces — CBS OData needs literal parentheses, commas, quotes
    const encodedFilter = filter.replace(/ /g, "%20");
    const url = `${baseUrl}?$filter=${encodedFilter}&$top=${PAGE_SIZE}&$skip=${skip}`;

    await sleep(DELAY_MS);
    const data = (await fetchJson(url)) as ODataResponse;
    all.push(...data.value);
    console.log(`  ... fetched ${all.length} records (skip=${skip})`);

    if (data.value.length < PAGE_SIZE) break;
    skip += PAGE_SIZE;
  }

  return all;
}

export async function fetchCBSData() {
  mkdirSync(OUT_DIR, { recursive: true });

  // 1. Fetch crime types
  console.log("\n[CBS] Fetching crime types...");
  const crimeTypes = await fetchAllPages(`${API_BASE}/SoortMisdrijf`);
  writeFileSync(join(OUT_DIR, "crime-types.json"), JSON.stringify(crimeTypes, null, 2));
  console.log(`  -> ${crimeTypes.length} crime types`);

  // 2. Fetch periods
  console.log("\n[CBS] Fetching periods...");
  const periods = await fetchAllPages(`${API_BASE}/Perioden`);
  writeFileSync(join(OUT_DIR, "periods.json"), JSON.stringify(periods, null, 2));
  console.log(`  -> ${periods.length} periods`);

  // Get annual period keys (format: "2019JJ00")
  const annualPeriods = (periods as Array<{ Key: string }>)
    .filter((p) => p.Key.trim().endsWith("JJ00"))
    .map((p) => p.Key.trim())
    .sort()
    .slice(-5); // Last 5 years
  console.log(`  Annual periods for fetch: ${annualPeriods.join(", ")}`);

  // 3. Fetch Amsterdam buurten list
  console.log("\n[CBS] Fetching Amsterdam buurten...");
  const buurten = await fetchAllPages(
    `${API_BASE}/WijkenEnBuurten?$filter=startswith(Key,'BU0363')`
  );
  writeFileSync(join(OUT_DIR, "buurten.json"), JSON.stringify(buurten, null, 2));
  console.log(`  -> ${buurten.length} buurten`);

  // 4. Fetch municipality totals
  console.log("\n[CBS] Fetching Amsterdam municipality totals...");
  const municipalityData = await fetchPaginated(
    `${API_BASE}/TypedDataSet`,
    `startswith(WijkenEnBuurten,'GM0363')`,
  );
  writeFileSync(join(OUT_DIR, "municipality-totals.json"), JSON.stringify(municipalityData, null, 2));
  console.log(`  -> ${municipalityData.length} municipality records`);

  // 5. Fetch buurt-level crime data year by year to avoid 500 errors
  console.log("\n[CBS] Fetching buurt-level crime data (year by year)...");
  const allCrimeData: Record<string, unknown>[] = [];

  for (const period of annualPeriods) {
    console.log(`\n  [Year: ${period}]`);
    const filter = `startswith(WijkenEnBuurten,'BU0363') and startswith(Perioden,'${period}')`;
    const yearData = await fetchPaginated(
      `${API_BASE}/TypedDataSet`,
      filter,
    );
    allCrimeData.push(...yearData);
    console.log(`  -> ${yearData.length} records for ${period}`);
  }

  writeFileSync(join(OUT_DIR, "buurt-crimes.json"), JSON.stringify(allCrimeData, null, 2));
  console.log(`\n  -> TOTAL: ${allCrimeData.length} buurt crime records`);

  console.log("\n[CBS] All data fetched successfully!");
}
