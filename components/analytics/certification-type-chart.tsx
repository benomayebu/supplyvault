"use client";

import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

interface Certification {
  certification_type: string;
}

interface CertificationTypeChartProps {
  certifications: Certification[];
}

const COLORS = [
  "#3BCEAC", // Teal
  "#10B981", // Green
  "#3B82F6", // Blue
  "#8B5CF6", // Purple
  "#EC4899", // Pink
  "#F59E0B", // Orange
  "#EF4444", // Red
  "#6B7280", // Gray
];

export function CertificationTypeChart({
  certifications,
}: CertificationTypeChartProps) {
  // Group certifications by type
  const typeCount = certifications.reduce(
    (acc, cert) => {
      const type = cert.certification_type || "Unknown";
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  // Convert to chart data
  const data = Object.entries(typeCount)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value); // Sort by count descending

  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-gray-500">
        No certification data available
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
            const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
            const x = cx + radius * Math.cos((-midAngle * Math.PI) / 180);
            const y = cy + radius * Math.sin((-midAngle * Math.PI) / 180);

            return percent > 0.05 ? (
              <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? "start" : "end"}
                dominantBaseline="central"
                className="text-xs font-medium"
              >
                {`${(percent * 100).toFixed(0)}%`}
              </text>
            ) : null;
          }}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {data.map((_entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: "white",
            border: "1px solid #e5e7eb",
            borderRadius: "0.5rem",
            padding: "0.5rem",
          }}
        />
        <Legend
          verticalAlign="bottom"
          height={36}
          iconType="circle"
          wrapperStyle={{ paddingTop: "1rem" }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
