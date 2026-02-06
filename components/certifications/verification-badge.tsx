interface VerificationBadgeProps {
  status: 'UNVERIFIED' | 'PENDING' | 'VERIFIED' | 'FAILED' | 'BASIC';
  method?: 'MANUAL' | 'API' | 'WEB_SCRAPING' | 'LIST_MATCHING' | null;
  confidence?: number | null;
  showDetails?: boolean;
}

export default function VerificationBadge({
  status,
  method,
  confidence,
  showDetails = false,
}: VerificationBadgeProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'VERIFIED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'FAILED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'BASIC':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'UNVERIFIED':
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'VERIFIED':
        return '✓';
      case 'PENDING':
        return '⏳';
      case 'FAILED':
        return '✗';
      case 'BASIC':
        return '○';
      case 'UNVERIFIED':
      default:
        return '—';
    }
  };

  const getMethodLabel = () => {
    switch (method) {
      case 'API':
        return 'API';
      case 'WEB_SCRAPING':
        return 'Web Check';
      case 'LIST_MATCHING':
        return 'List Match';
      case 'MANUAL':
        return 'Manual';
      default:
        return '';
    }
  };

  return (
    <div className="inline-flex items-center gap-2">
      <span
        className={\`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border \${getStatusColor()}\`}
      >
        <span>{getStatusIcon()}</span>
        <span>{status}</span>
      </span>
      {showDetails && method && (
        <span className="text-xs text-gray-500">
          via {getMethodLabel()}
          {confidence !== null && confidence !== undefined && (
            <> ({Math.round(confidence * 100)}%)</>
          )}
        </span>
      )}
    </div>
  );
}
