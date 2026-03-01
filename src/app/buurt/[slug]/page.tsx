import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Panel from "@/components/ui/Panel";
import ThreatLevel from "@/components/profile/ThreatLevel";
import MiniMap from "@/components/profile/MiniMap";
import CrimeBreakdown from "@/components/profile/CrimeBreakdown";
import TrendChart from "@/components/profile/TrendChart";
import ComparisonBar from "@/components/profile/ComparisonBar";
import type { Neighborhood, CityAverages } from "@/lib/types";

async function getData() {
  let neighborhoods: Neighborhood[] = [];
  let geojson: GeoJSON.FeatureCollection = { type: "FeatureCollection", features: [] };
  let cityAverages: CityAverages = {
    totalRate: 0,
    categoryRates: { PROPERTY: 0, VIOLENT: 0, DRUGS: 0, FRAUD: 0, VANDALISM: 0, OTHER: 0 },
    yearlyRates: {},
  };

  try {
    neighborhoods = (await import("@/data/neighborhoods.json")).default as unknown as Neighborhood[];
  } catch { /* not built yet */ }

  try {
    geojson = (await import("@/data/amsterdam.geo.json")).default as unknown as GeoJSON.FeatureCollection;
  } catch { /* not built yet */ }

  try {
    cityAverages = (await import("@/data/city-averages.json")).default as unknown as CityAverages;
  } catch { /* not built yet */ }

  return { neighborhoods, geojson, cityAverages };
}

export async function generateStaticParams() {
  let neighborhoods: Neighborhood[] = [];
  try {
    neighborhoods = (await import("@/data/neighborhoods.json")).default as unknown as Neighborhood[];
  } catch {
    return [];
  }
  return neighborhoods.map((n) => ({ slug: n.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let neighborhoods: Neighborhood[] = [];
  try {
    neighborhoods = (await import("@/data/neighborhoods.json")).default as unknown as Neighborhood[];
  } catch {
    return { title: "SECTOR NOT FOUND" };
  }

  const neighborhood = neighborhoods.find((n) => n.slug === slug);
  if (!neighborhood) return { title: "SECTOR NOT FOUND" };

  return {
    title: `${neighborhood.name} — THREAT LEVEL: ${neighborhood.threatLevel}`,
    description: `Safety analysis for ${neighborhood.name}, Amsterdam. Score: ${neighborhood.safetyScore}/10. Crime rate: ${neighborhood.crimeRate.toFixed(1)} per 1000 residents.`,
  };
}

export default async function BuurtPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { neighborhoods, geojson, cityAverages } = await getData();

  const neighborhood = neighborhoods.find((n) => n.slug === slug);
  if (!neighborhood) notFound();

  // Find rank
  const sorted = [...neighborhoods].sort((a, b) => a.safetyScore - b.safetyScore);
  const rank = sorted.findIndex((n) => n.code === neighborhood.code) + 1;

  return (
    <div className="min-h-screen px-4 py-6 md:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Navigation */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-[#888899] hover:text-[#00ffcc] text-xs tracking-wider transition-colors mb-6"
        >
          <ArrowLeft size={14} />
          RETURN TO OVERVIEW
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="text-[9px] tracking-[0.3em] text-[#888899] uppercase mb-1">
            SECTOR ANALYSIS // {neighborhood.code}
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
          </div>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Left column: Threat level + Mini map */}
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
              />
            </Panel>
          </div>

          {/* Right column: Charts */}
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
            <span>AMSTERDAM SECTOR INTELLIGENCE v1.0</span>
          </div>
        </div>
      </div>
    </div>
  );
}
