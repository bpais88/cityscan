"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { YearlyTrend } from "@/lib/types";

interface TrendChartProps {
  trends: YearlyTrend[];
  cityYearlyRates: Record<string, number>;
}

export default function TrendChart({ trends, cityYearlyRates }: TrendChartProps) {
  const data = trends.map((t) => ({
    year: t.year,
    sector: Number(t.rate.toFixed(1)),
    city: Number((cityYearlyRates[t.year] ?? 0).toFixed(1)),
  }));

  return (
    <div className="h-[280px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333340" />
          <XAxis
            dataKey="year"
            stroke="#666680"
            tick={{ fill: "#888899", fontSize: 10 }}
          />
          <YAxis
            stroke="#666680"
            tick={{ fill: "#888899", fontSize: 10 }}
            label={{
              value: "per 1K",
              angle: -90,
              position: "insideLeft",
              fill: "#666680",
              fontSize: 9,
            }}
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
          />
          <Legend
            wrapperStyle={{
              fontFamily: "monospace",
              fontSize: 10,
              color: "#888899",
            }}
          />
          <Line
            type="monotone"
            dataKey="sector"
            stroke="#00ffcc"
            strokeWidth={2}
            dot={{ fill: "#00ffcc", r: 3 }}
            activeDot={{ r: 5, fill: "#00ffcc" }}
            name="SECTOR RATE"
          />
          <Line
            type="monotone"
            dataKey="city"
            stroke="#666680"
            strokeWidth={1.5}
            strokeDasharray="5 5"
            dot={{ fill: "#666680", r: 2 }}
            name="CITY AVG"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
