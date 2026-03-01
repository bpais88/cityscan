import SafetyMapWrapper from "@/components/map/SafetyMapWrapper";
import SearchBar from "@/components/search/SearchBar";
import Panel from "@/components/ui/Panel";
import type { Neighborhood } from "@/lib/types";

async function getData() {
  let neighborhoods: Neighborhood[] = [];
  let geojson: GeoJSON.FeatureCollection = { type: "FeatureCollection", features: [] };

  try {
    neighborhoods = (await import("@/data/neighborhoods.json")).default as unknown as Neighborhood[];
  } catch {
    // Data not yet built
  }

  try {
    geojson = (await import("@/data/amsterdam.geo.json")).default as unknown as GeoJSON.FeatureCollection;
  } catch {
    // Data not yet built
  }

  return { neighborhoods, geojson };
}

export default async function HomePage() {
  const { neighborhoods, geojson } = await getData();

  const totalSectors = neighborhoods.length;
  const criticalCount = neighborhoods.filter((n) => n.threatLevel === "CRITICAL").length;
  const highCount = neighborhoods.filter((n) => n.threatLevel === "HIGH").length;
  const avgScore = totalSectors > 0
    ? (neighborhoods.reduce((s, n) => s + n.safetyScore, 0) / totalSectors).toFixed(1)
    : "—";

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <div className="px-4 py-6 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6">
            <h1 className="text-[10px] tracking-[0.3em] text-[#888899] uppercase mb-1">
              CLASSIFIED // AMSTERDAM MUNICIPAL INTELLIGENCE
            </h1>
            <h2 className="text-2xl md:text-3xl font-bold text-[#e0e0f0] tracking-tight">
              SECTOR <span className="text-[#00ffcc] glow-text-cyan">THREAT ANALYSIS</span>
            </h2>
            <p className="text-xs text-[#666680] mt-2 tracking-wider">
              REAL-TIME NEIGHBORHOOD SAFETY PROFILING // CBS POLITIE DATA INTEGRATION
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
            <SearchBar neighborhoods={neighborhoods} />
          </div>
        </div>
      </div>

      {/* Map */}
      <div className="relative">
        <SafetyMapWrapper geojson={geojson} neighborhoods={neighborhoods} />
      </div>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-[#333340]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-[9px] text-[#666680] tracking-wider font-mono">
          <span>DATA: CBS OPEN DATA (47018NED) // PDOK WFS BOUNDARIES</span>
          <span>AMSTERDAM SECTOR INTELLIGENCE v1.0</span>
        </div>
      </div>
    </div>
  );
}
