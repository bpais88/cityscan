"use client";

export default function ScanlineOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[100]"
      style={{
        background:
          "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 255, 204, 0.008) 2px, rgba(0, 255, 204, 0.008) 4px)",
      }}
    />
  );
}
