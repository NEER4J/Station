"use client";

import type { DailyReconciliation } from "@/types/database";

interface ReconciliationSummaryProps {
  data: DailyReconciliation[];
}

export function ReconciliationSummary({ data }: ReconciliationSummaryProps) {
  const pendingCount = data.filter((r) => r.status === "pending").length;
  const reconciledCount = data.filter((r) => r.status === "reconciled").length;
  const approvedCount = data.filter((r) => r.status === "approved").length;

  const summaryItems = [
    {
      label: "Total Store Sales",
      value: data.reduce((s, r) => s + r.store_sales, 0),
      format: "currency" as const,
    },
    {
      label: "Total Fuel Sales",
      value: data.reduce((s, r) => s + r.fuel_sales, 0),
      format: "currency" as const,
    },
    {
      label: "Total Taxes",
      value: data.reduce((s, r) => s + r.taxes, 0),
      format: "currency" as const,
    },
    {
      label: "Net Over/Short",
      value: data.reduce((s, r) => s + r.over_short_dollars, 0),
      format: "currency_signed" as const,
    },
  ];

  return (
    <div className="sticky top-6 space-y-4">
      {/* Title */}
      <div>
        <h2 className="font-semibold text-base text-gray-900">Summary</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          {data.length} report{data.length !== 1 ? "s" : ""} in view
        </p>
      </div>

      {/* Totals card */}
      <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Filtered Results ({data.length})
        </p>
        {summaryItems.map((item) => (
          <div key={item.label} className="flex items-center justify-between">
            <span className="text-sm text-gray-600">{item.label}</span>
            <span
              className={`text-sm font-semibold tabular-nums ${
                item.format === "currency_signed" && item.value < 0
                  ? "text-red-600"
                  : item.format === "currency_signed" && item.value > 0
                    ? "text-green-600"
                    : ""
              }`}
            >
              {item.format === "currency_signed"
                ? `${item.value >= 0 ? "+" : ""}$${Math.abs(item.value).toFixed(2)}`
                : `$${item.value.toFixed(2)}`}
            </span>
          </div>
        ))}
      </div>

      {/* Status breakdown card */}
      <div className="bg-white rounded-xl shadow-sm p-4 space-y-3">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          Status Breakdown
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Pending</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            {pendingCount}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Reconciled</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
            {reconciledCount}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Approved</span>
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
            {approvedCount}
          </span>
        </div>
      </div>
    </div>
  );
}
