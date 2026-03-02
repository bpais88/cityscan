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
            <div className="text-xs text-[#888899] leading-relaxed mb-4">
              The 59 CBS crime types (SoortMisdrijf) are grouped into 6 categories.
              Below are the official CBS crime type names (Dutch) with English translations.
            </div>
            <div className="space-y-5">
              {[
                {
                  cat: "PROPERTY CRIME",
                  color: "#00ffcc",
                  crimes: [
                    { code: "1.1.1", nl: "Diefstal/inbraak woning", en: "Home burglary/break-in" },
                    { code: "1.1.2", nl: "Diefstal/inbraak box/garage/schuur", en: "Shed/garage break-in" },
                    { code: "1.2.1", nl: "Diefstal uit/vanaf motorvoertuigen", en: "Theft from motor vehicles" },
                    { code: "1.2.2", nl: "Diefstal van motorvoertuigen", en: "Motor vehicle theft" },
                    { code: "1.2.3", nl: "Diefstal van brom-, snor-, fietsen", en: "Bike/moped theft" },
                    { code: "1.2.4", nl: "Zakkenrollerij", en: "Pickpocketing" },
                    { code: "1.2.5", nl: "Diefstal af/uit/van ov. voertuigen", en: "Theft from other vehicles" },
                    { code: "1.5.2", nl: "Diefstallen (water)", en: "Theft (waterways)" },
                    { code: "1.6.2", nl: "Overige vermogensdelicten", en: "Other property offenses" },
                    { code: "2.5.1", nl: "Diefstal/inbraak bedrijven enz.", en: "Commercial burglary/break-in" },
                    { code: "2.5.2", nl: "Winkeldiefstal", en: "Shoplifting" },
                  ],
                },
                {
                  cat: "VIOLENT CRIME",
                  color: "#ff3333",
                  crimes: [
                    { code: "1.4.1", nl: "Zedenmisdrijf", en: "Sexual offenses" },
                    { code: "1.4.2", nl: "Moord, doodslag", en: "Murder, manslaughter" },
                    { code: "1.4.3", nl: "Openlijk geweld (persoon)", en: "Public violence (against person)" },
                    { code: "1.4.4", nl: "Bedreiging", en: "Threats" },
                    { code: "1.4.5", nl: "Mishandeling", en: "Assault" },
                    { code: "1.4.6", nl: "Straatroof", en: "Street robbery" },
                    { code: "1.4.7", nl: "Overval", en: "Armed robbery" },
                    { code: "1.6.3", nl: "Mensenhandel", en: "Human trafficking" },
                    { code: "3.1.2", nl: "Mensensmokkel", en: "People smuggling" },
                    { code: "3.1.3", nl: "Wapenhandel", en: "Arms trafficking" },
                    { code: "3.2.1", nl: "Kinderporno", en: "Child exploitation material" },
                    { code: "3.2.2", nl: "Kinderprostitutie", en: "Child prostitution" },
                  ],
                },
                {
                  cat: "DRUG-RELATED",
                  color: "#ffaa00",
                  crimes: [
                    { code: "3.1.1", nl: "Drugshandel", en: "Drug trafficking" },
                    { code: "2.1.1", nl: "Drugs/drankoverlast", en: "Drug/alcohol nuisance" },
                    { code: "3.3.2", nl: "Onder invloed (lucht)", en: "DUI (aviation)" },
                    { code: "3.4.2", nl: "Onder invloed (water)", en: "DUI (waterways)" },
                    { code: "3.5.2", nl: "Onder invloed (weg)", en: "DUI (road)" },
                  ],
                },
                {
                  cat: "FRAUD & CYBER",
                  color: "#e0e0f0",
                  crimes: [
                    { code: "3.9.1", nl: "Horizontale fraude", en: "Horizontal fraud (citizen-to-citizen)" },
                    { code: "3.9.2", nl: "Verticale fraude", en: "Vertical fraud (against government/institutions)" },
                    { code: "3.9.3", nl: "Fraude (overig)", en: "Other fraud" },
                    { code: "3.7.4", nl: "Cybercrime", en: "Cybercrime" },
                  ],
                },
                {
                  cat: "VANDALISM & NUISANCE",
                  color: "#ffaa00",
                  crimes: [
                    { code: "2.2.1", nl: "Vernieling cq. zaakbeschadiging", en: "Vandalism / property damage" },
                    { code: "1.6.1", nl: "Brand/ontploffing", en: "Arson / explosion" },
                    { code: "2.4.1", nl: "Burengerucht (relatieproblemen)", en: "Domestic disputes / neighbor conflicts" },
                    { code: "2.4.2", nl: "Huisvredebreuk", en: "Trespassing (residential)" },
                    { code: "3.6.4", nl: "Aantasting openbare orde", en: "Public order disturbance" },
                  ],
                },
                {
                  cat: "OTHER",
                  color: "#666680",
                  crimes: [
                    { code: "1.3.1", nl: "Ongevallen (weg)", en: "Road accidents" },
                    { code: "3.7.1", nl: "Discriminatie", en: "Discrimination" },
                    { code: "3.7.2", nl: "Vreemdelingenzorg", en: "Immigration matters" },
                    { code: "3.7.3", nl: "Maatsch. integriteit (overig)", en: "Social integrity (other)" },
                    { code: "2.7.2", nl: "Bijzondere wetten", en: "Special legislation violations" },
                    { code: "2.7.3", nl: "Leefbaarheid (overig)", en: "Livability (other)" },
                    { code: "2.6.1–14", nl: "Milieudelicten, APV, etc.", en: "Environmental, regulatory, and administrative violations" },
                  ],
                },
              ].map((group) => (
                <div key={group.cat}>
                  <h4
                    className="text-[10px] tracking-[0.2em] font-bold mb-2 uppercase"
                    style={{ color: group.color }}
                  >
                    {group.cat}
                  </h4>
                  <div className="space-y-1 pl-3 border-l border-[#333340]">
                    {group.crimes.map((crime) => (
                      <div key={crime.code} className="flex gap-2 text-[11px]">
                        <span className="text-[#666680] w-12 shrink-0 font-mono text-[10px]">{crime.code}</span>
                        <span className="text-[#888899] flex-1">{crime.nl}</span>
                        <span className="text-[#e0e0f0] flex-1">{crime.en}</span>
                      </div>
                    ))}
                  </div>
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
