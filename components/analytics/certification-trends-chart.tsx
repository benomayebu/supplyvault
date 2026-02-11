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
import { format, subMonths, startOfMonth, endOfMonth } from "date-fns";

interface Certification {
  created_at: Date;
}

interface CertificationTrendsChartProps {
  certifications: Certification[];
  months?: number;
}

export function CertificationTrendsChart({
  certifications,
  months = 6,
}: CertificationTrendsChartProps) {
  // Generate data for the last N months
  const now = new Date();
  const monthsData: Array<{
    month: string;
    count: number;
    cumulative: number;
  }> = [];

  for (let i = months - 1; i >= 0; i--) {
    const monthStart = startOfMonth(subMonths(now, i));
    const monthEnd = endOfMonth(monthStart);

    const count = certifications.filter((cert) => {
      const createdAt = new Date(cert.created_at);
      return createdAt >= monthStart && createdAt <= monthEnd;
    }).length;

    const cumulative = certifications.filter((cert) => {
      const createdAt = new Date(cert.created_at);
      return createdAt <= monthEnd;
    }).length;

    monthsData.push({
      month: format(monthStart, "MMM yyyy"),
      count,
      cumulative,
    });
  }

  if (monthsData.every((d) => d.cumulative === 0)) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        No certification data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={monthsData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="month"
          stroke="#6b7280"
          fontSize={12}
          tick={{ fill: "#6b7280" }}
        />
        <YAxis
          stroke="#6b7280"
          fontSize={12}
          tick={{ fill: "#6b7280" }}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "0.5rem",
            padding: "0.75rem",
          }}
          labelStyle={{ fontWeight: "bold", marginBottom: "0.5rem" }}
        />
        <Legend
          verticalAlign="top"
          height={36}
          iconType="line"
          wrapperStyle={{ paddingBottom: "1rem" }}
        />
        <Line
          type="monotone"
          dataKey="count"
          stroke="#3BCEAC"
          strokeWidth={2}
          dot={{ fill: "#3BCEAC", r: 4 }}
          activeDot={{ r: 6 }}
          name="New Certifications"
        />
        <Line
          type="monotone"
          dataKey="cumulative"
          stroke="#3B82F6"
          strokeWidth={2}
          dot={{ fill: "#3B82F6", r: 4 }}
          activeDot={{ r: 6 }}
          name="Total Certifications"
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
