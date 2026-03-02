import Link from "next/link";
import StatusBar from "@/components/ui/StatusBar";
import Panel from "@/components/ui/Panel";

export const metadata = {
  title: "CITYSCAN — Methodology & Data Sources",
  description: "How CityScan calculates neighborhood safety scores using CBS police crime data.",
};

export default function MethodologyPage() {
  return (
    <div className="min-h-screen">
      <StatusBar />

      <div className="pt-10 px-4 py-6 md:px-8">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/"
              className="text-[10px] text-[#666680] tracking-[0.2em] uppercase hover:text-[#00ffcc] transition-colors"
            >
              &larr; BACK TO OVERVIEW
            </Link>
            <h1 className="text-2xl font-bold text-[#e0e0f0] mt-4 tracking-tight">
              METHODO<span className="text-[#00ffcc]">LOGY</span>
            </h1>
            <p className="text-[10px] text-[#888899] tracking-[0.2em] mt-1 uppercase">
              Data Sources // Scoring Algorithm // Limitations
            </p>
          </div>

          {/* Data Sources */}
          <Panel title="DATA SOURCES" className="mb-6">
            <div className="space-y-4 text-xs text-[#e0e0f0] leading-relaxed">
              <p>
                All data used in CityScan is <span className="text-[#00ffcc] font-bold">real, publicly available government data</span> — not generated, estimated, or synthetic.
              </p>

              <div>
                <h4 className="text-[10px] text-[#00ffcc] tracking-[0.2em] mb-2 uppercase">
                  CBS — Centraal Bureau voor de Statistiek
                </h4>
                <p className="text-[#888899]">
                  Crime statistics come from CBS dataset <span className="text-[#e0e0f0] font-semibold">47018NED</span> —
                  &quot;Geregistreerde criminaliteit; soort misdrijf, regio&quot; (Registered crime by type and region).
                  This records every crime reported to or detected by Dutch police, published annually by the national statistics bureau.
                </p>
                <div className="mt-2 pl-3 border-l border-[#333340] text-[#888899]">
                  <p><span className="text-[#666680]">API:</span> OData v3 — dataderden.cbs.nl</p>
                  <p><span className="text-[#666680]">COVERAGE:</span> 59 crime types per neighborhood per year</p>
                  <p><span className="text-[#666680]">YEARS:</span> Last 5 available years</p>
                  <p><span className="text-[#666680]">MEASURE:</span> GeregistreerdeMisdrijven_1 (registered crime count)</p>
                </div>
              </div>

              <div>
                <h4 className="text-[10px] text-[#00ffcc] tracking-[0.2em] mb-2 uppercase">
                  PDOK — Publieke Dienstverlening Op de Kaart
                </h4>
                <p className="text-[#888899]">
                  Geographic boundaries and population counts come from the PDOK WFS service for Wijken en Buurten 2024.
                  Each neighborhood polygon includes the official CBS resident count (<span className="text-[#e0e0f0]">aantalInwoners</span>).
                </p>
              </div>
            </div>
          </Panel>

          {/* Crime Categories */}
          <Panel title="CRIME CATEGORIES" className="mb-6">
            <div className="text-xs text-[#888899] leading-relaxed mb-3">
              The 59 CBS crime types are grouped into 6 categories:
            </div>
            <div className="space-y-2">
              {[
                { cat: "PROPERTY", desc: "Burglary, theft, bike theft, pickpocketing, shoplifting, vehicle theft" },
                { cat: "VIOLENT", desc: "Assault, threats, robbery, murder, sexual offenses, domestic violence" },
                { cat: "DRUG-RELATED", desc: "Drug trade, drug nuisance, DUI" },
                { cat: "FRAUD & CYBER", desc: "Financial fraud, identity fraud, cybercrime" },
                { cat: "VANDALISM", desc: "Property damage, arson, domestic disputes, public order" },
                { cat: "OTHER", desc: "Traffic offenses, environmental crimes, administrative violations" },
              ].map((item) => (
                <div key={item.cat} className="flex gap-3 text-xs">
                  <span className="text-[#00ffcc] font-semibold w-32 shrink-0 text-[10px] tracking-wider">{item.cat}</span>
                  <span className="text-[#888899]">{item.desc}</span>
                </div>
              ))}
            </div>
          </Panel>

          {/* Safety Score */}
          <Panel title="SAFETY SCORE ALGORITHM" className="mb-6">
            <div className="space-y-4 text-xs leading-relaxed">
              <p className="text-[#888899]">
                Each neighborhood receives a safety score from <span className="text-[#00ffcc] font-bold">1</span> to <span className="text-[#00ffcc] font-bold">10</span> based on its crime rate
                relative to the city average. This makes neighborhoods within a city directly comparable.
              </p>

              <div className="bg-[#0a0a0f] border border-[#333340] p-4 font-mono text-[11px]">
                <div className="text-[#666680] mb-2">// Step 1: Calculate per-capita crime rate</div>
                <div className="text-[#e0e0f0]">crimeRate = (totalCrimes / population) &times; 1000</div>

                <div className="text-[#666680] mt-3 mb-2">// Step 2: Compare to city average</div>
                <div className="text-[#e0e0f0]">relative = ((cityRate - buurtRate) / cityRate) &times; 100</div>

                <div className="text-[#666680] mt-3 mb-2">// Step 3: Normalize to 1-10 scale</div>
                <div className="text-[#e0e0f0]">score = round(((relative + 100) / 200) &times; 9) + 1</div>
              </div>

              <p className="text-[#888899]">
                A neighborhood with the exact city average crime rate scores approximately <span className="text-[#e0e0f0]">5.5</span>.
                Lower crime rates produce higher scores. The score is clamped between 1 and 10.
              </p>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
                {[
                  { range: "8 — 10", level: "LOW", color: "#00ffcc" },
                  { range: "6 — 7", level: "MODERATE", color: "#00ff88" },
                  { range: "4 — 5", level: "HIGH", color: "#ffaa00" },
                  { range: "1 — 3", level: "CRITICAL", color: "#ff3333" },
                ].map((t) => (
                  <div key={t.level} className="border border-[#333340] p-2 text-center">
                    <div className="text-sm font-bold" style={{ color: t.color }}>{t.range}</div>
                    <div className="text-[9px] tracking-[0.15em] mt-1" style={{ color: t.color }}>{t.level}</div>
                  </div>
                ))}
              </div>
            </div>
          </Panel>

          {/* Exclusions */}
          <Panel title="DATA PROCESSING" className="mb-6">
            <div className="space-y-3 text-xs text-[#888899] leading-relaxed">
              <div className="flex gap-2">
                <span className="text-[#00ffcc] shrink-0">&#9656;</span>
                <p>
                  Neighborhoods with fewer than <span className="text-[#e0e0f0] font-semibold">50 residents</span> are excluded — too few people for meaningful per-capita statistics.
                </p>
              </div>
              <div className="flex gap-2">
                <span className="text-[#00ffcc] shrink-0">&#9656;</span>
                <p>
                  CBS suppresses small crime counts (typically &lt; 5) for privacy, returning <span className="text-[#e0e0f0]">null</span> instead of the actual number.
                  These are treated as <span className="text-[#e0e0f0]">0</span>, which slightly understates crime in quieter areas.
                </p>
              </div>
              <div className="flex gap-2">
                <span className="text-[#00ffcc] shrink-0">&#9656;</span>
                <p>
                  CBS publishes data with a delay. The &quot;latest year&quot; in our dataset is typically <span className="text-[#e0e0f0]">1–2 years</span> behind the current date.
                </p>
              </div>
              <div className="flex gap-2">
                <span className="text-[#00ffcc] shrink-0">&#9656;</span>
                <p>
                  Geographic boundaries use the PDOK 2024 edition. Neighborhood boundaries may shift between CBS editions due to municipal reorganizations.
                </p>
              </div>
            </div>
          </Panel>

          {/* Limitations */}
          <Panel title="IMPORTANT LIMITATIONS" accent="amber" className="mb-6">
            <div className="space-y-3 text-xs text-[#888899] leading-relaxed">
              <div className="flex gap-2">
                <span className="text-[#ffaa00] shrink-0">&#9888;</span>
                <p>
                  <span className="text-[#e0e0f0] font-semibold">Registered crimes only.</span> Only crimes reported to or detected by police are included.
                  Unreported crimes (the &quot;dark number&quot;) are not captured. Property crimes tend to be well-reported; drug-related and domestic crimes less so.
                </p>
              </div>
              <div className="flex gap-2">
                <span className="text-[#ffaa00] shrink-0">&#9888;</span>
                <p>
                  <span className="text-[#e0e0f0] font-semibold">Scores are relative, not absolute.</span> A safety score of 7 means &quot;better than the city average&quot; —
                  not an absolute measure. A 7/10 in Amsterdam represents a different crime rate than a 7/10 in Bloemendaal.
                </p>
              </div>
              <div className="flex gap-2">
                <span className="text-[#ffaa00] shrink-0">&#9888;</span>
                <p>
                  <span className="text-[#e0e0f0] font-semibold">Not a safety guarantee.</span> This tool provides statistical context for neighborhoods based on historical police data.
                  It does not predict future crime and should not be the sole factor in housing decisions.
                </p>
              </div>
            </div>
          </Panel>

          {/* Footer */}
          <div className="py-4 border-t border-[#333340]">
            <div className="text-[9px] text-[#666680] tracking-wider font-mono text-center">
              DATA: CBS OPEN DATA (47018NED) // PDOK WFS 2024 // PUBLIC DOMAIN (CC0)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
