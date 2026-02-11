import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  color?: "teal" | "red" | "yellow" | "green" | "blue" | "gray";
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const colorClasses = {
  teal: "text-[#3BCEAC] bg-[#3BCEAC]/10",
  red: "text-red-600 bg-red-50",
  yellow: "text-yellow-600 bg-yellow-50",
  green: "text-green-600 bg-green-50",
  blue: "text-blue-600 bg-blue-50",
  gray: "text-gray-600 bg-gray-50",
};

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = "teal",
  trend,
}: StatCardProps) {
  return (
    <div className="rounded-lg bg-white p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-600">{title}</h3>
        {Icon && (
          <div className={`rounded-lg p-2 ${colorClasses[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>
      <div className="mt-4">
        <div className="text-3xl font-bold text-gray-900">{value}</div>
        {subtitle && <p className="mt-1 text-sm text-gray-600">{subtitle}</p>}
        {trend && (
          <div
            className={`mt-2 flex items-center text-sm ${
              trend.isPositive ? "text-green-600" : "text-red-600"
            }`}
          >
            <span className="font-medium">
              {trend.isPositive ? "+" : ""}
              {trend.value}%
            </span>
            <span className="ml-1 text-gray-600">vs last month</span>
          </div>
        )}
      </div>
    </div>
  );
}
