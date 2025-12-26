import { AlertTriangle, Info, AlertCircle } from "lucide-react";

interface AlertStatsProps {
  totalUnread: number;
  critical: number; // <7 days
  warning: number; // 7-30 days
  info: number; // >30 days
}

export function AlertStats({
  totalUnread,
  critical,
  warning,
  info,
}: AlertStatsProps) {
  return (
    <div className="space-y-4">
      {/* Total Unread */}
      <div className="rounded-lg border-2 border-secondary-teal bg-secondary-teal/10 p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600">Unread Alerts</p>
            <p className="mt-1 text-4xl font-bold text-primary-navy">
              {totalUnread}
            </p>
          </div>
        </div>
      </div>

      {/* Breakdown by Urgency */}
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-red-600" />
            <span className="text-sm font-medium text-red-900">Critical</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-red-600">{critical}</p>
          <p className="text-xs text-red-700">{"< 7 days"}</p>
        </div>

        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <span className="text-sm font-medium text-yellow-900">Warning</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-yellow-600">{warning}</p>
          <p className="text-xs text-yellow-700">7-30 days</p>
        </div>

        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex items-center gap-2">
            <Info className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-900">Info</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-blue-600">{info}</p>
          <p className="text-xs text-blue-700">{"> 30 days"}</p>
        </div>
      </div>
    </div>
  );
}
