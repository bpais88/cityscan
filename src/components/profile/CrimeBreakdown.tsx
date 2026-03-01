"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { CrimeCategory } from "@/lib/types";
import { CATEGORY_LABELS, ALL_CATEGORIES } from "@/lib/constants";

interface CrimeBreakdownProps {
  categories: Record<CrimeCategory, number>;
  categoryRates: Record<CrimeCategory, number>;
}

const BAR_COLORS: Record<CrimeCategory, string> = {
  PROPERTY: "#00ffcc",
  VIOLENT: "#ff3333",
  DRUGS: "#ffaa00",
  FRAUD: "#8888ff",
  VANDALISM: "#ff8844",
  OTHER: "#666680",
};

export default function CrimeBreakdown({ categories, categoryRates }: CrimeBreakdownProps) {
  const data = ALL_CATEGORIES.map((cat) => ({
    name: CATEGORY_LABELS[cat],
    count: categories[cat],
    rate: categoryRates[cat],
    category: cat,
  })).sort((a, b) => b.count - a.count);

  return (
    <div className="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#333340" horizontal={false} />
          <XAxis type="number" stroke="#666680" tick={{ fill: "#888899", fontSize: 10 }} />
          <YAxis
            type="category"
            dataKey="name"
            stroke="#666680"
            tick={{ fill: "#888899", fontSize: 9 }}
            width={130}
          />
          <Tooltip
            contentStyle={{
              background: "rgba(10, 10, 15, 0.95)",
              border: "1px solid #333340",
              borderRadius: 0,
              fontFamily: "monospace",
              fontSize: 11,
              color: "#e0e0f0",
            }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            formatter={((value: any, name: any) => {
              const v = Number(value ?? 0);
              if (name === "count") return [`${v} incidents`, "COUNT"];
              return [`${v.toFixed(1)} per 1K`, "RATE"];
            }) as any}
          />
          <Bar dataKey="count" radius={[0, 2, 2, 0]}>
            {data.map((entry) => (
              <Cell
                key={entry.category}
                fill={BAR_COLORS[entry.category]}
                fillOpacity={0.75}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
