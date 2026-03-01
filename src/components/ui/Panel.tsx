import { ReactNode } from "react";

interface PanelProps {
  title?: string;
  children: ReactNode;
  className?: string;
  accent?: "cyan" | "amber" | "red" | "green";
}

const accentColors = {
  cyan: "border-[#00ffcc]/30 shadow-[0_0_15px_rgba(0,255,204,0.05)]",
  amber: "border-[#ffaa00]/30 shadow-[0_0_15px_rgba(255,170,0,0.05)]",
  red: "border-[#ff3333]/30 shadow-[0_0_15px_rgba(255,51,51,0.05)]",
  green: "border-[#00ff88]/30 shadow-[0_0_15px_rgba(0,255,136,0.05)]",
};

const titleColors = {
  cyan: "text-[#00ffcc]",
  amber: "text-[#ffaa00]",
  red: "text-[#ff3333]",
  green: "text-[#00ff88]",
};

export default function Panel({
  title,
  children,
  className = "",
  accent = "cyan",
}: PanelProps) {
  return (
    <div
      className={`relative bg-[#0a0a0f]/85 border ${accentColors[accent]} ${className}`}
    >
      {/* Corner accents */}
      <div className="absolute top-0 left-0 w-3 h-3 border-t border-l border-[#00ffcc]/50" />
      <div className="absolute top-0 right-0 w-3 h-3 border-t border-r border-[#00ffcc]/50" />
      <div className="absolute bottom-0 left-0 w-3 h-3 border-b border-l border-[#00ffcc]/50" />
      <div className="absolute bottom-0 right-0 w-3 h-3 border-b border-r border-[#00ffcc]/50" />

      {title && (
        <div className="px-4 py-2 border-b border-[#333340]/50">
          <h3
            className={`text-[10px] font-mono tracking-[0.25em] uppercase ${titleColors[accent]}`}
          >
            ◇ {title}
          </h3>
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}
