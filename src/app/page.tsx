import Link from "next/link";
import StatusBar from "@/components/ui/StatusBar";
import Panel from "@/components/ui/Panel";
import { getCountries, getCityIndex } from "@/db/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const allCountries = await getCountries();

  // If only one country exists, show its city grid directly
  if (allCountries.length === 1) {
    const country = allCountries[0];
    const cities = await getCityIndex(country.code);

    const totalSectors = cities.reduce((s, c) => s + c.totalSectors, 0);
    const totalCritical = cities.reduce((s, c) => s + c.criticalCount, 0);
    const overallAvg = cities.length > 0
      ? (cities.reduce((s, c) => s + c.avgScore, 0) / cities.length).toFixed(1)
      : "—";

    return (
      <div className="min-h-screen">
        <StatusBar sectorCount={totalSectors} />

        <div className="pt-10 px-4 py-6 md:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Hero */}
            <div className="mb-8 text-center">
              <h1 className="text-[10px] tracking-[0.3em] text-[#888899] uppercase mb-1">
                CLASSIFIED // {country.name.toUpperCase()} MUNICIPAL INTELLIGENCE NETWORK
              </h1>
              <h2 className="text-3xl md:text-4xl font-bold text-[#e0e0f0] tracking-tight">
                CITY<span className="text-[#00ffcc] glow-text-cyan">SCAN</span>
              </h2>
              <p className="text-xs text-[#666680] mt-2 tracking-wider max-w-md mx-auto">
                NEIGHBORHOOD SAFETY PROFILING // CBS POLITIE DATA INTEGRATION // {cities.length} MUNICIPALITIES ACTIVE
              </p>
            </div>

            {/* Global stats */}
            <div className="grid grid-cols-3 gap-3 mb-8 max-w-xl mx-auto">
              <Panel>
                <div className="text-[9px] text-[#888899] tracking-[0.2em] mb-1">MUNICIPALITIES</div>
                <div className="text-xl font-bold text-[#00ffcc]">{cities.length}</div>
              </Panel>
              <Panel>
                <div className="text-[9px] text-[#888899] tracking-[0.2em] mb-1">TOTAL SECTORS</div>
                <div className="text-xl font-bold text-[#00ffcc]">{totalSectors}</div>
              </Panel>
              <Panel accent="red">
                <div className="text-[9px] text-[#888899] tracking-[0.2em] mb-1">CRITICAL ZONES</div>
                <div className="text-xl font-bold text-[#ff3333]">{totalCritical}</div>
              </Panel>
            </div>

            {/* City grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {cities.map((city) => {
                const threatColor = getThreatColor(city.avgScore);
                return (
                  <Link key={city.id} href={`/${country.code}/${city.id}`}>
                    <div className="group border border-[#333340] bg-[#0a0a0f]/80 p-4 hover:border-[#00ffcc]/50 hover:shadow-[0_0_20px_rgba(0,255,204,0.08)] transition-all cursor-pointer">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-bold text-[#e0e0f0] group-hover:text-[#00ffcc] transition-colors tracking-wider">
                          {city.name.toUpperCase()}
                        </h3>
                        <span className="text-xs font-bold" style={{ color: threatColor }}>
                          {city.avgScore}/10
                        </span>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] text-[#888899] tracking-wider">
                          <span>SECTORS</span>
                          <span className="text-[#e0e0f0]">{city.totalSectors}</span>
                        </div>
                        <div className="flex justify-between text-[10px] text-[#888899] tracking-wider">
                          <span>CRIME RATE</span>
                          <span className="text-[#e0e0f0]">{city.avgRate}/1K</span>
                        </div>
                        <div className="flex justify-between text-[10px] text-[#888899] tracking-wider">
                          <span>CRITICAL</span>
                          <span className={city.criticalCount > 0 ? "text-[#ff3333]" : "text-[#00ffcc]"}>
                            {city.criticalCount}
                          </span>
                        </div>
                      </div>

                      {/* Score bar */}
                      <div className="mt-3 h-1 bg-[#333340] overflow-hidden">
                        <div
                          className="h-full transition-all"
                          style={{
                            width: `${(city.avgScore / 10) * 100}%`,
                            backgroundColor: threatColor,
                          }}
                        />
                      </div>

                      <div className="mt-2 text-[9px] text-[#666680] tracking-wider text-right group-hover:text-[#00ffcc]/60 transition-colors">
                        ENTER ANALYSIS →
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Empty state */}
            {cities.length === 0 && (
              <div className="text-center py-12">
                <div className="text-[#666680] text-sm tracking-wider">
                  NO DATA AVAILABLE — RUN PIPELINE TO FETCH
                </div>
              </div>
            )}

            {/* Footer */}
            <div className="py-4 border-t border-[#333340]">
              <div className="flex flex-col md:flex-row items-center justify-between text-[9px] text-[#666680] tracking-wider font-mono">
                <span>DATA: CBS OPEN DATA (47018NED) // PDOK WFS BOUNDARIES</span>
                <div className="flex items-center gap-3">
                  <Link href="/methodology" className="text-[#888899] hover:text-[#00ffcc] transition-colors">
                    METHODOLOGY
                  </Link>
                  <span>CITYSCAN v2.0 // AVG SAFETY: {overallAvg}/10</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Multi-country selector
  return (
    <div className="min-h-screen">
      <StatusBar sectorCount={0} />

      <div className="pt-10 px-4 py-6 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-[10px] tracking-[0.3em] text-[#888899] uppercase mb-1">
              CLASSIFIED // INTERNATIONAL SAFETY INTELLIGENCE NETWORK
            </h1>
            <h2 className="text-3xl md:text-4xl font-bold text-[#e0e0f0] tracking-tight">
              CITY<span className="text-[#00ffcc] glow-text-cyan">SCAN</span>
            </h2>
            <p className="text-xs text-[#666680] mt-2 tracking-wider max-w-md mx-auto">
              SELECT COUNTRY TO ACCESS MUNICIPAL INTELLIGENCE
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {allCountries.map((country) => (
              <Link key={country.code} href={`/${country.code}`}>
                <div className="group border border-[#333340] bg-[#0a0a0f]/80 p-6 hover:border-[#00ffcc]/50 hover:shadow-[0_0_20px_rgba(0,255,204,0.08)] transition-all cursor-pointer text-center">
                  <h3 className="text-lg font-bold text-[#e0e0f0] group-hover:text-[#00ffcc] transition-colors tracking-wider mb-2">
                    {country.name.toUpperCase()}
                  </h3>
                  <div className="text-[10px] text-[#666680] tracking-wider">
                    {country.code.toUpperCase()} // {country.dataSource}
                  </div>
                  <div className="mt-3 text-[9px] text-[#666680] tracking-wider group-hover:text-[#00ffcc]/60 transition-colors">
                    ENTER →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function getThreatColor(avgScore: number): string {
  if (avgScore >= 8) return "#00ffcc";
  if (avgScore >= 6) return "#00ff88";
  if (avgScore >= 4) return "#ffaa00";
  return "#ff3333";
}
