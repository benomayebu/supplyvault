"use client";

import { useEffect, useState } from "react";
import { Activity, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface Certification {
  created_at: Date;
}

interface ActivityStatsProps {
  certifications: Certification[];
}

export function ActivityStats({ certifications }: ActivityStatsProps) {
  const [stats, setStats] = useState({
    thisMonth: 0,
    lastMonth: 0,
    trend: 0,
    trendDirection: "neutral" as "up" | "down" | "neutral",
  });

  useEffect(() => {
    const now = new Date();
    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const thisMonth = certifications.filter((cert) => {
      const createdAt = new Date(cert.created_at);
      return createdAt >= thisMonthStart;
    }).length;

    const lastMonth = certifications.filter((cert) => {
      const createdAt = new Date(cert.created_at);
      return createdAt >= lastMonthStart && createdAt <= lastMonthEnd;
    }).length;

    let trend = 0;
    let trendDirection: "up" | "down" | "neutral" = "neutral";

    if (lastMonth > 0) {
      trend = Math.round(((thisMonth - lastMonth) / lastMonth) * 100);
      if (trend > 0) trendDirection = "up";
      else if (trend < 0) trendDirection = "down";
    } else if (thisMonth > 0) {
      trend = 100;
      trendDirection = "up";
    }

    setStats({ thisMonth, lastMonth, trend, trendDirection });
  }, [certifications]);

  const TrendIcon =
    stats.trendDirection === "up"
      ? TrendingUp
      : stats.trendDirection === "down"
        ? TrendingDown
        : Minus;

  const trendColor =
    stats.trendDirection === "up"
      ? "text-green-600"
      : stats.trendDirection === "down"
        ? "text-red-600"
        : "text-gray-600";

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-600">This Month</h3>
          <div className="rounded-lg bg-[#3BCEAC]/10 p-2">
            <Activity className="h-5 w-5 text-[#3BCEAC]" />
          </div>
        </div>
        <div className="mt-4">
          <div className="text-3xl font-bold text-gray-900">
            {stats.thisMonth}
          </div>
          <p className="mt-1 text-sm text-gray-600">New certifications</p>
        </div>
      </div>

      <div className="rounded-lg bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-600">Growth</h3>
          <div className={`rounded-lg ${trendColor} bg-opacity-10 p-2`}>
            <TrendIcon className={`h-5 w-5 ${trendColor}`} />
          </div>
        </div>
        <div className="mt-4">
          <div className={`text-3xl font-bold ${trendColor}`}>
            {stats.trend > 0 ? "+" : ""}
            {stats.trend}%
          </div>
          <p className="mt-1 text-sm text-gray-600">vs last month</p>
        </div>
      </div>
    </div>
  );
}
