import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import StatusBar from "@/components/ui/StatusBar";
import Panel from "@/components/ui/Panel";
import ThreatLevel from "@/components/profile/ThreatLevel";
import MiniMap from "@/components/profile/MiniMap";
import CrimeBreakdown from "@/components/profile/CrimeBreakdown";
import TrendChart from "@/components/profile/TrendChart";
import ComparisonBar from "@/components/profile/ComparisonBar";
import {
  getCountry,
  getMunicipality,
  getNeighborhoods,
  getNeighborhoodBySlug,
  getGeoJSON,
  getCityAverages,
} from "@/db/queries";

export const revalidate = 86400;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string; city: string; slug: string }>;
}) {
  const { country: countryCode, city: cityId, slug } = await params;
  const country = await getCountry(countryCode);
  if (!country) return { title: "NOT FOUND" };
  const muni = await getMunicipality(cityId);
  if (!muni || muni.countryCode !== countryCode) return { title: "CITY NOT FOUND" };

  const neighborhood = await getNeighborhoodBySlug(cityId, slug);
  if (!neighborhood) return { title: "SECTOR NOT FOUND" };

  return {
    title: `${neighborhood.name} — ${muni.name} — THREAT: ${neighborhood.threatLevel}`,
    description: `Safety analysis for ${neighborhood.name}, ${muni.name}. Score: ${neighborhood.safetyScore}/10. Crime rate: ${neighborhood.crimeRate.toFixed(1)} per 1000 residents.`,
  };
}

export default async function NeighborhoodPage({
  params,
}: {
  params: Promise<{ country: string; city: string; slug: string }>;
}) {
  const { country: countryCode, city: cityId, slug } = await params;

  const country = await getCountry(countryCode);
  if (!country) notFound();

  const muni = await getMunicipality(cityId);
  if (!muni || muni.countryCode !== countryCode) notFound();

  const [neighborhood, neighborhoods, geojson, cityAverages] = await Promise.all([
    getNeighborhoodBySlug(cityId, slug),
    getNeighborhoods(cityId),
    getGeoJSON(cityId),
    getCityAverages(cityId),
  ]);

  if (!neighborhood) notFound();

  const sorted = [...neighborhoods].sort((a, b) => a.safetyScore - b.safetyScore);
  const rank = sorted.findIndex((n) => n.code === neighborhood.code) + 1;

  return (
    <div className="min-h-screen">
      <StatusBar cityName={muni.name} sectorCount={neighborhoods.length} />

      <div className="pt-10 px-4 py-6 md:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Navigation */}
          <Link
            href={`/${countryCode}/${cityId}`}
            className="inline-flex items-center gap-2 text-[#888899] hover:text-[#00ffcc] text-xs tracking-wider transition-colors mb-6"
          >
            <ArrowLeft size={14} />
            RETURN TO {muni.name.toUpperCase()} OVERVIEW
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="text-[9px] tracking-[0.3em] text-[#888899] uppercase mb-1">
              SECTOR ANALYSIS // {muni.name.toUpperCase()} // {neighborhood.code}
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-[#e0e0f0] tracking-tight mb-2">
              {neighborhood.name.toUpperCase()}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-[10px] tracking-wider text-[#666680]">
              <span>POP: {neighborhood.population.toLocaleString()}</span>
              <span>|</span>
              <span>RANK: {rank} / {neighborhoods.length}</span>
              <span>|</span>
              <span>CODE: {neighborhood.code}</span>
              {neighborhood.postcode && (
                <>
                  <span>|</span>
                  <span>POSTCODE: {neighborhood.postcode}</span>
                </>
              )}
            </div>
          </div>

          {/* Main grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Left column */}
            <div className="space-y-4">
              <Panel title="THREAT ASSESSMENT">
                <ThreatLevel
                  score={neighborhood.safetyScore}
                  threatLevel={neighborhood.threatLevel}
                  crimeRate={neighborhood.crimeRate}
                />
              </Panel>

              <Panel title="SECTOR LOCATION">
                <MiniMap
                  geojson={geojson}
                  neighborhoods={neighborhoods}
                  selectedSlug={slug}
                  countryCode={countryCode}
                  cityId={cityId}
                  cityCenter={[muni.centerLat, muni.centerLng]}
                />
              </Panel>
            </div>

            {/* Right column */}
            <div className="lg:col-span-2 space-y-4">
              <Panel title="CRIME BREAKDOWN">
                <CrimeBreakdown
                  categories={neighborhood.categories}
                  categoryRates={neighborhood.categoryRates}
                />
              </Panel>

              <Panel title="TEMPORAL ANALYSIS">
                <TrendChart
                  trends={neighborhood.trends}
                  cityYearlyRates={cityAverages.yearlyRates}
                />
              </Panel>

              <Panel title="COMPARATIVE ANALYSIS — VS CITY AVERAGE">
                <ComparisonBar
                  categoryRates={neighborhood.categoryRates}
                  cityRates={cityAverages.categoryRates}
                />
              </Panel>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 py-4 border-t border-[#333340]">
            <div className="flex flex-col md:flex-row items-center justify-between text-[9px] text-[#666680] tracking-wider">
              <span>DATA: {country.dataSource.toUpperCase()}</span>
              <span>{muni.name.toUpperCase()} SECTOR INTELLIGENCE v2.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
