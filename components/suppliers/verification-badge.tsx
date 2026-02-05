import { CheckCircle2, Shield, AlertCircle } from "lucide-react";

export type VerificationStatus = "UNVERIFIED" | "BASIC" | "VERIFIED";

interface VerificationBadgeProps {
  status: VerificationStatus;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
}

export function VerificationBadge({
  status,
  size = "md",
  showLabel = true,
}: VerificationBadgeProps) {
  const config = {
    UNVERIFIED: {
      icon: AlertCircle,
      label: "Unverified",
      bgColor: "bg-gray-100",
      textColor: "text-gray-700",
      iconColor: "text-gray-500",
      description: "Profile incomplete or not verified",
    },
    BASIC: {
      icon: Shield,
      label: "Basic",
      bgColor: "bg-blue-50",
      textColor: "text-blue-700",
      iconColor: "text-blue-600",
      description: "Profile complete with certifications",
    },
    VERIFIED: {
      icon: CheckCircle2,
      label: "Verified",
      bgColor: "bg-green-50",
      textColor: "text-green-700",
      iconColor: "text-green-600",
      description: "Verified by brand admin",
    },
  };

  const { icon: Icon, label, bgColor, textColor, iconColor } = config[status];

  const sizeClasses = {
    sm: {
      container: "px-2 py-0.5 text-xs gap-1",
      icon: "w-3 h-3",
    },
    md: {
      container: "px-2.5 py-1 text-sm gap-1.5",
      icon: "w-4 h-4",
    },
    lg: {
      container: "px-3 py-1.5 text-base gap-2",
      icon: "w-5 h-5",
    },
  };

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${bgColor} ${textColor} ${sizeClasses[size].container}`}
      title={config[status].description}
    >
      <Icon className={`${iconColor} ${sizeClasses[size].icon}`} />
      {showLabel && <span>{label}</span>}
    </span>
  );
}
