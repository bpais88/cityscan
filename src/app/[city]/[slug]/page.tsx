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
import { CITIES } from "@/lib/cities";
import type { Neighborhood, CityAverages } from "@/lib/types";

async function getCityData(cityId: string) {
  let neighborhoods: Neighborhood[] = [];
  let geojson: GeoJSON.FeatureCollection = { type: "FeatureCollection", features: [] };
  let cityAverages: CityAverages = {
    totalRate: 0,
    categoryRates: { PROPERTY: 0, VIOLENT: 0, DRUGS: 0, FRAUD: 0, VANDALISM: 0, OTHER: 0 },
    yearlyRates: {},
  };

  try {
    neighborhoods = (
      await import(`@/data/cities/${cityId}/neighborhoods.json`)
    ).default as unknown as Neighborhood[];
  } catch { /* not built yet */ }

  try {
    geojson = (
      await import(`@/data/${cityId}.geo.json`)
    ).default as unknown as GeoJSON.FeatureCollection;
  } catch { /* not built yet */ }

  try {
    cityAverages = (
      await import(`@/data/cities/${cityId}/city-averages.json`)
    ).default as unknown as CityAverages;
  } catch { /* not built yet */ }

  return { neighborhoods, geojson, cityAverages };
}

export async function generateStaticParams() {
  const allParams: { city: string; slug: string }[] = [];

  for (const city of CITIES) {
    try {
      const neighborhoods = (
        await import(`@/data/cities/${city.id}/neighborhoods.json`)
      ).default as unknown as Neighborhood[];
      for (const n of neighborhoods) {
        allParams.push({ city: city.id, slug: n.slug });
      }
    } catch {
      // Data not built for this city
    }
  }

  return allParams;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string; slug: string }>;
}) {
  const { city: cityId, slug } = await params;
  const cfg = CITIES.find((c) => c.id === cityId);
  if (!cfg) return { title: "NOT FOUND" };

  try {
    const neighborhoods = (
      await import(`@/data/cities/${cityId}/neighborhoods.json`)
    ).default as unknown as Neighborhood[];
    const neighborhood = neighborhoods.find((n) => n.slug === slug);
    if (!neighborhood) return { title: "SECTOR NOT FOUND" };

    return {
      title: `${neighborhood.name} — ${cfg.name} — THREAT: ${neighborhood.threatLevel}`,
      description: `Safety analysis for ${neighborhood.name}, ${cfg.name}. Score: ${neighborhood.safetyScore}/10. Crime rate: ${neighborhood.crimeRate.toFixed(1)} per 1000 residents.`,
    };
  } catch {
    return { title: "SECTOR NOT FOUND" };
  }
}

export default async function NeighborhoodPage({
  params,
}: {
  params: Promise<{ city: string; slug: string }>;
}) {
  const { city: cityId, slug } = await params;
  const cfg = CITIES.find((c) => c.id === cityId);
  if (!cfg) notFound();

  const { neighborhoods, geojson, cityAverages } = await getCityData(cityId);

  const neighborhood = neighborhoods.find((n) => n.slug === slug);
  if (!neighborhood) notFound();

  const sorted = [...neighborhoods].sort((a, b) => a.safetyScore - b.safetyScore);
  const rank = sorted.findIndex((n) => n.code === neighborhood.code) + 1;

  return (
    <div className="min-h-screen">
      <StatusBar cityName={cfg.name} sectorCount={neighborhoods.length} />

      <div className="pt-10 px-4 py-6 md:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Navigation */}
          <Link
            href={`/${cityId}`}
            className="inline-flex items-center gap-2 text-[#888899] hover:text-[#00ffcc] text-xs tracking-wider transition-colors mb-6"
          >
            <ArrowLeft size={14} />
            RETURN TO {cfg.name.toUpperCase()} OVERVIEW
          </Link>

          {/* Header */}
          <div className="mb-8">
            <div className="text-[9px] tracking-[0.3em] text-[#888899] uppercase mb-1">
              SECTOR ANALYSIS // {cfg.name.toUpperCase()} // {neighborhood.code}
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
                  cityId={cityId}
                  cityCenter={cfg.center}
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
              <span>DATA: CBS OPEN DATA (47018NED) // PDOK WFS BOUNDARIES</span>
              <span>{cfg.name.toUpperCase()} SECTOR INTELLIGENCE v2.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
