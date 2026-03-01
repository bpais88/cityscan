export default function MapLegend() {
  const stops = [
    { label: "1-2", color: "#ff3333", text: "CRITICAL" },
    { label: "3-4", color: "#ff6633", text: "HIGH" },
    { label: "5-6", color: "#ffaa00", text: "MODERATE" },
    { label: "7-8", color: "#44dd88", text: "" },
    { label: "9-10", color: "#00ffcc", text: "LOW" },
  ];

  return (
    <div className="bg-[#0a0a0f]/90 border border-[#333340] p-3 font-mono">
      <div className="text-[9px] tracking-[0.2em] text-[#888899] uppercase mb-2">
        ◇ THREAT LEVEL INDEX
      </div>
      <div className="flex items-center gap-0.5">
        {stops.map((s) => (
          <div key={s.label} className="flex-1">
            <div
              className="h-2"
              style={{ background: s.color, opacity: 0.8 }}
            />
            <div className="text-[8px] text-[#888899] mt-1 text-center">
              {s.label}
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[8px] text-[#ff3333]">CRITICAL</span>
        <span className="text-[8px] text-[#00ffcc]">LOW</span>
      </div>
    </div>
  );
}
