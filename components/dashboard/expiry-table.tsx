import Link from "next/link";
import { format, differenceInDays } from "date-fns";
import { CertificationType } from "@prisma/client";
import { clsx } from "clsx";

interface ExpiryItem {
  id: string;
  certification_name: string;
  certification_type: CertificationType;
  expiry_date: Date;
  supplier: {
    id: string;
    name: string;
  };
}

interface ExpiryTableProps {
  expiries: ExpiryItem[];
}

const formatCertificationType = (type: CertificationType): string => {
  return type
    .split("_")
    .map((word) => word.charAt(0) + word.slice(1).toLowerCase())
    .join(" ");
};

const getDaysRemaining = (expiryDate: Date): number => {
  return differenceInDays(new Date(expiryDate), new Date());
};

const getDaysRemainingColor = (days: number): string => {
  if (days < 0) return "text-red-600 bg-red-50"; // Expired
  if (days <= 30) return "text-red-600 bg-red-50"; // Urgent
  if (days <= 60) return "text-yellow-600 bg-yellow-50"; // Warning
  return "text-green-600 bg-green-50"; // Good
};

export function ExpiryTable({ expiries }: ExpiryTableProps) {
  if (expiries.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-primary-navy">
          Upcoming Expiries
        </h3>
        <p className="text-sm text-gray-500">
          No certifications expiring soon.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-primary-navy">
          Upcoming Expiries
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Supplier
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Certification
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Expiry Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Days Remaining
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {expiries.map((item) => {
              const daysRemaining = getDaysRemaining(item.expiry_date);
              const colorClass = getDaysRemainingColor(daysRemaining);

              return (
                <tr
                  key={item.id}
                  className="transition-colors hover:bg-gray-50"
                >
                  <td className="whitespace-nowrap px-6 py-4">
                    <Link
                      href={`/dashboard/suppliers/${item.supplier.id}`}
                      className="text-sm font-medium text-primary-navy hover:text-secondary-teal"
                    >
                      {item.supplier.name}
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <Link
                      href={`/dashboard/certifications/${item.id}`}
                      className="text-sm text-gray-900 hover:text-secondary-teal"
                    >
                      <div>{item.certification_name}</div>
                      <div className="text-xs text-gray-500">
                        {formatCertificationType(item.certification_type)}
                      </div>
                    </Link>
                  </td>
                  <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">
                    {format(new Date(item.expiry_date), "MMM d, yyyy")}
                  </td>
                  <td className="whitespace-nowrap px-6 py-4">
                    <span
                      className={clsx(
                        "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
                        colorClass
                      )}
                    >
                      {daysRemaining < 0
                        ? `Expired ${Math.abs(daysRemaining)} days ago`
                        : daysRemaining === 0
                          ? "Expires today"
                          : `${daysRemaining} days`}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
