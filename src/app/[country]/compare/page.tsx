import { notFound } from "next/navigation";
import Link from "next/link";
import StatusBar from "@/components/ui/StatusBar";
import CompareClient from "@/components/compare/CompareClient";
import { getCountry, getAllMunicipalitiesForComparison } from "@/db/queries";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country: countryCode } = await params;
  const country = await getCountry(countryCode);
  if (!country) return { title: "COUNTRY NOT FOUND" };

  return {
    title: `${country.name.toUpperCase()} — NATIONAL OVERVIEW`,
    description: `Compare all municipalities in ${country.name} on an interactive map with safety rankings.`,
  };
}

export default async function ComparePage({
  params,
}: {
  params: Promise<{ country: string }>;
}) {
  const { country: countryCode } = await params;
  const country = await getCountry(countryCode);
  if (!country) notFound();

  const municipalities = await getAllMunicipalitiesForComparison(countryCode);

  const totalSectors = municipalities.reduce((s, c) => s + c.totalSectors, 0);
  const totalCritical = municipalities.reduce((s, c) => s + c.criticalCount, 0);
  const overallAvg =
    municipalities.length > 0
      ? (
          municipalities.reduce((s, c) => s + c.avgScore, 0) /
          municipalities.length
        ).toFixed(1)
      : "—";

  return (
    <div className="h-screen flex flex-col bg-[#0a0a0f]">
      <StatusBar sectorCount={totalSectors} />

      {/* Subheader */}
      <div className="pt-10 px-4 py-2 border-b border-[#333340] flex items-center justify-between font-mono">
        <div className="flex items-center gap-3">
          <Link
            href={`/${countryCode}`}
            className="text-[10px] tracking-[0.2em] text-[#888899] hover:text-[#00ffcc] transition-colors uppercase"
          >
            ← {country.name.toUpperCase()}
          </Link>
          <span className="text-[#333340]">|</span>
          <h1 className="text-[10px] tracking-[0.25em] text-[#00ffcc] uppercase">
            NATIONAL OVERVIEW
          </h1>
        </div>
        <div className="text-[9px] tracking-[0.2em] text-[#666680] uppercase">
          {municipalities.length} MUNICIPALITIES // AVG: {overallAvg}/10
        </div>
      </div>

      {/* Map + Sidebar */}
      <CompareClient
        municipalities={municipalities}
        countryCode={countryCode}
        countryCenter={[country.centerLat, country.centerLng]}
        countryZoom={country.zoom}
        totalSectors={totalSectors}
        totalCritical={totalCritical}
        overallAvg={overallAvg}
      />
    </div>
  );
}
