"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Fuse from "fuse.js";
import type { Neighborhood } from "@/lib/types";
import { THREAT_COLORS } from "@/lib/constants";

interface SearchBarProps {
  neighborhoods: Neighborhood[];
}

export default function SearchBar({ neighborhoods }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const fuse = useMemo(
    () =>
      new Fuse(neighborhoods, {
        keys: [
          { name: "name", weight: 0.7 },
          { name: "code", weight: 0.3 },
        ],
        threshold: 0.4,
        minMatchCharLength: 2,
      }),
    [neighborhoods]
  );

  const results = useMemo(() => {
    if (!query || query.length < 2) return [];
    return fuse.search(query).slice(0, 8);
  }, [fuse, query]);

  useEffect(() => {
    setSelectedIndex(0);
    setIsOpen(results.length > 0);
  }, [results]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && results[selectedIndex]) {
      router.push(`/buurt/${results[selectedIndex].item.slug}`);
      setIsOpen(false);
    } else if (e.key === "Escape") {
      setIsOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative w-full max-w-xl mx-auto">
      <div className="flex items-center bg-[#0a0a0f] border border-[#333340] px-4 py-3 font-mono focus-within:border-[#00ffcc]/50 focus-within:shadow-[0_0_20px_rgba(0,255,204,0.1)] transition-all">
        <span className="text-[#00ffcc] text-sm mr-2">&gt;</span>
        <span className="text-[#888899] text-sm mr-1">QUERY</span>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => results.length > 0 && setIsOpen(true)}
          onBlur={() => setTimeout(() => setIsOpen(false), 200)}
          placeholder="SECTOR_"
          className="flex-1 bg-transparent text-sm text-[#e0e0f0] outline-none placeholder:text-[#333340]"
          autoComplete="off"
          spellCheck={false}
        />
        {!query && (
          <span className="text-[#00ffcc] cursor-blink text-sm">▊</span>
        )}
      </div>

      {isOpen && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-[#0a0a0f]/95 border border-[#333340] backdrop-blur-sm z-50 max-h-80 overflow-y-auto">
          {results.map((r, i) => (
            <button
              key={r.item.code}
              className={`w-full text-left px-4 py-2.5 font-mono text-sm flex items-center justify-between transition-colors ${
                i === selectedIndex
                  ? "bg-[#00ffcc]/10 border-l-2 border-l-[#00ffcc]"
                  : "border-l-2 border-l-transparent hover:bg-[#333340]/30"
              }`}
              onMouseDown={() => {
                router.push(`/buurt/${r.item.slug}`);
              }}
              onMouseEnter={() => setSelectedIndex(i)}
            >
              <div>
                <div className="text-[#e0e0f0]">{r.item.name}</div>
                <div className="text-[9px] text-[#666680] tracking-wider mt-0.5">
                  {r.item.code}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className="text-[10px] font-bold tracking-wider"
                  style={{ color: THREAT_COLORS[r.item.threatLevel] }}
                >
                  {r.item.threatLevel}
                </span>
                <span className="text-[#888899] text-xs">
                  {r.item.safetyScore}/10
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
