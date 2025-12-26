import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Building2,
  LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { clsx } from "clsx";

interface MetricCardProps {
  title: string;
  value: number;
  trend?: string;
  href?: string;
  variant?: "default" | "success" | "warning" | "danger";
}

const iconMap: Record<string, LucideIcon> = {
  default: Building2,
  success: CheckCircle2,
  warning: AlertTriangle,
  danger: XCircle,
};

const variantStyles = {
  default: {
    bg: "bg-white",
    icon: "text-primary-navy",
    value: "text-primary-navy",
  },
  success: {
    bg: "bg-white",
    icon: "text-green-600",
    value: "text-green-600",
  },
  warning: {
    bg: "bg-white",
    icon: "text-yellow-600",
    value: "text-yellow-600",
  },
  danger: {
    bg: "bg-white",
    icon: "text-red-600",
    value: "text-red-600",
  },
};

export function MetricCard({
  title,
  value,
  trend,
  href,
  variant = "default",
}: MetricCardProps) {
  const IconComponent = iconMap[variant];
  const styles = variantStyles[variant];

  const content = (
    <div
      className={clsx(
        "rounded-lg border border-gray-200 p-6 shadow-sm transition-shadow hover:shadow-md",
        styles.bg,
        href && "cursor-pointer"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className={clsx("mt-2 text-3xl font-bold", styles.value)}>
            {value.toLocaleString()}
          </p>
          {trend && <p className="mt-1 text-xs text-gray-500">{trend}</p>}
        </div>
        <div className={clsx("rounded-full bg-gray-100 p-3", styles.icon)}>
          <IconComponent className="h-6 w-6" aria-hidden="true" />
        </div>
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}
