import { notFound } from "next/navigation";
import SafetyMapWrapper from "@/components/map/SafetyMapWrapper";
import SearchBar from "@/components/search/SearchBar";
import StatusBar from "@/components/ui/StatusBar";
import Panel from "@/components/ui/Panel";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getCountry, getMunicipality, getNeighborhoods, getGeoJSON } from "@/db/queries";

export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string; city: string }>;
}) {
  const { country: countryCode, city: cityId } = await params;
  const country = await getCountry(countryCode);
  if (!country) return { title: "NOT FOUND" };
  const muni = await getMunicipality(cityId);
  if (!muni || muni.countryCode !== countryCode) return { title: "CITY NOT FOUND" };

  return {
    title: `${muni.name.toUpperCase()} — SECTOR INTELLIGENCE`,
    description: `Neighborhood safety analysis for ${muni.name}. Powered by ${country.dataSource}.`,
  };
}

export default async function CityPage({
  params,
}: {
  params: Promise<{ country: string; city: string }>;
}) {
  const { country: countryCode, city: cityId } = await params;

  const country = await getCountry(countryCode);
  if (!country) notFound();

  const muni = await getMunicipality(cityId);
  if (!muni || muni.countryCode !== countryCode) notFound();

  const [neighborhoods, geojson] = await Promise.all([
    getNeighborhoods(cityId),
    getGeoJSON(cityId),
  ]);

  const totalSectors = neighborhoods.length;
  const criticalCount = neighborhoods.filter((n) => n.threatLevel === "CRITICAL").length;
  const highCount = neighborhoods.filter((n) => n.threatLevel === "HIGH").length;
  const avgScore = totalSectors > 0
    ? (neighborhoods.reduce((s, n) => s + n.safetyScore, 0) / totalSectors).toFixed(1)
    : "—";

  return (
    <div className="min-h-screen">
      <StatusBar cityName={muni.name} sectorCount={totalSectors} />

      <div className="pt-10 px-4 py-6 md:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Navigation */}
          <Link
            href={`/${countryCode}`}
            className="inline-flex items-center gap-2 text-[#888899] hover:text-[#00ffcc] text-xs tracking-wider transition-colors mb-4"
          >
            <ArrowLeft size={14} />
            ALL CITIES
          </Link>

          <div className="mb-6">
            <h1 className="text-[10px] tracking-[0.3em] text-[#888899] uppercase mb-1">
              CLASSIFIED // {muni.name.toUpperCase()} MUNICIPAL INTELLIGENCE
            </h1>
            <h2 className="text-2xl md:text-3xl font-bold text-[#e0e0f0] tracking-tight">
              SECTOR <span className="text-[#00ffcc] glow-text-cyan">THREAT ANALYSIS</span>
            </h2>
            <p className="text-xs text-[#666680] mt-2 tracking-wider">
              REAL-TIME NEIGHBORHOOD SAFETY PROFILING // {country.dataSource.toUpperCase()} INTEGRATION
            </p>
          </div>

          {/* Stats strip */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            <Panel>
              <div className="text-[9px] text-[#888899] tracking-[0.2em] mb-1">SECTORS ANALYZED</div>
              <div className="text-xl font-bold text-[#00ffcc]">{totalSectors}</div>
            </Panel>
            <Panel accent="red">
              <div className="text-[9px] text-[#888899] tracking-[0.2em] mb-1">CRITICAL ZONES</div>
              <div className="text-xl font-bold text-[#ff3333]">{criticalCount}</div>
            </Panel>
            <Panel accent="amber">
              <div className="text-[9px] text-[#888899] tracking-[0.2em] mb-1">HIGH THREAT</div>
              <div className="text-xl font-bold text-[#ffaa00]">{highCount}</div>
            </Panel>
            <Panel accent="green">
              <div className="text-[9px] text-[#888899] tracking-[0.2em] mb-1">AVG SCORE</div>
              <div className="text-xl font-bold text-[#00ff88]">{avgScore}</div>
            </Panel>
          </div>

          {/* Search */}
          <div className="mb-6">
            <SearchBar neighborhoods={neighborhoods} countryCode={countryCode} cityId={cityId} />
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="relative">
        <SafetyMapWrapper
          geojson={geojson}
          neighborhoods={neighborhoods}
          countryCode={countryCode}
          cityId={cityId}
          cityCenter={[muni.centerLat, muni.centerLng]}
          cityZoom={muni.zoom}
        />
      </div>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-[#333340]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-[9px] text-[#666680] tracking-wider font-mono">
          <span>DATA: {country.dataSource.toUpperCase()}</span>
          <span>{muni.name.toUpperCase()} SECTOR INTELLIGENCE v2.0</span>
        </div>
      </div>
    </div>
  );
}
