import type { CrimeCategory } from "./types";
import { getThreatLevel } from "./constants";

export function calculateSafetyScore(
  buurtRate: number,
  cityRate: number
): number {
  if (cityRate === 0) return 5;
  const raw = ((cityRate - buurtRate) / cityRate) * 100;
  // Normalize from [-100, 100] to [1, 10]
  const normalized = Math.round(((raw + 100) / 200) * 9) + 1;
  return Math.max(1, Math.min(10, normalized));
}

export function calculateCrimeRate(crimes: number, population: number): number {
  if (population === 0) return 0;
  return (crimes / population) * 1000;
}

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function computeThreatLevel(score: number) {
  return getThreatLevel(score);
}

export function groupCrimesByCategory(
  records: Array<{ category: CrimeCategory; count: number }>
): Record<CrimeCategory, number> {
  const result: Record<CrimeCategory, number> = {
    PROPERTY: 0,
    VIOLENT: 0,
    DRUGS: 0,
    FRAUD: 0,
    VANDALISM: 0,
    OTHER: 0,
  };
  for (const r of records) {
    result[r.category] += r.count;
  }
  return result;
}
