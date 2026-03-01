import { THREAT_COLORS } from "@/lib/constants";

interface ThreatLevelProps {
  score: number;
  threatLevel: string;
  crimeRate: number;
}

export default function ThreatLevel({ score, threatLevel, crimeRate }: ThreatLevelProps) {
  const color = THREAT_COLORS[threatLevel] ?? "#888899";

  const glowClass =
    threatLevel === "LOW"
      ? "glow-text-cyan"
      : threatLevel === "CRITICAL"
        ? "glow-text-red"
        : threatLevel === "HIGH"
          ? "glow-text-amber"
          : "";

  return (
    <div className="text-center">
      <div className="text-[9px] tracking-[0.3em] text-[#888899] uppercase mb-3">
        COMPOSITE THREAT ASSESSMENT
      </div>

      {/* Large score */}
      <div
        className={`text-7xl md:text-8xl font-bold ${glowClass}`}
        style={{ color }}
      >
        {score}
      </div>
      <div className="text-[#888899] text-xs tracking-wider mt-1">/ 10</div>

      {/* Threat level badge */}
      <div className="mt-4 inline-block px-4 py-1.5 border" style={{ borderColor: color }}>
        <span
          className="text-xs font-bold tracking-[0.3em]"
          style={{ color }}
        >
          THREAT LEVEL: {threatLevel}
        </span>
      </div>

      {/* Crime rate */}
      <div className="mt-3 text-[#888899] text-[11px] tracking-wider">
        {crimeRate.toFixed(1)} INCIDENTS / 1K RESIDENTS
      </div>
    </div>
  );
}
