"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { DailyReconciliation } from "@/types/database";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";

interface ReconciliationsTableProps {
  data: DailyReconciliation[];
  onEdit: (recon: DailyReconciliation) => void;
  onDelete: (recon: DailyReconciliation) => void;
}

const STATUS_STYLES: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  reconciled: "bg-blue-100 text-blue-700",
  approved: "bg-green-100 text-green-700",
};

export function ReconciliationsTable({
  data,
  onEdit,
  onDelete,
}: ReconciliationsTableProps) {
  const [sortBy, setSortBy] = useState("report_date");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  function handleSort(key: string) {
    if (sortBy === key) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDirection("desc");
    }
  }

  const sorted = [...data].sort((a, b) => {
    const aVal = a[sortBy as keyof DailyReconciliation];
    const bVal = b[sortBy as keyof DailyReconciliation];
    if (aVal === undefined || bVal === undefined) return 0;
    const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
    return sortDirection === "asc" ? cmp : -cmp;
  });

  const columns: ColumnDef<DailyReconciliation>[] = [
    {
      key: "report_date",
      label: "Date",
      sortable: true,
      render: (val) => new Date(val as string).toLocaleDateString(),
    },
    {
      key: "shift_count",
      label: "Shifts",
      align: "right",
    },
    {
      key: "fuel_volume",
      label: "Fuel Vol",
      align: "right",
      render: (val) => `${(val as number).toFixed(0)} L`,
    },
    {
      key: "fuel_sales",
      label: "Fuel $",
      align: "right",
      sortable: true,
      render: (val) => `$${(val as number).toFixed(2)}`,
    },
    {
      key: "store_sales",
      label: "Sales",
      align: "right",
      sortable: true,
      render: (val) => `$${(val as number).toFixed(2)}`,
    },
    {
      key: "taxes",
      label: "Taxes",
      align: "right",
      render: (val) => `$${(val as number).toFixed(2)}`,
    },
    {
      key: "non_cash_tender",
      label: "Non-Cash",
      align: "right",
      render: (val) => `$${(val as number).toFixed(2)}`,
    },
    {
      key: "over_short_dollars",
      label: "O/S $",
      align: "right",
      render: (val) => {
        const v = val as number;
        return (
          <span
            className={
              v < 0
                ? "text-red-600 font-medium"
                : v > 0
                  ? "text-green-600 font-medium"
                  : ""
            }
          >
            {v >= 0 ? "+" : ""}
            {v.toFixed(2)}
          </span>
        );
      },
    },
    {
      key: "status",
      label: "Status",
      render: (val) => {
        const s = val as string;
        const style = STATUS_STYLES[s] ?? "bg-gray-100 text-gray-700";
        return (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${style}`}
          >
            {s}
          </span>
        );
      },
    },
    {
      key: "id",
      label: "",
      render: (_val, row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-gray-400 hover:text-gray-700"
            onClick={() => onEdit(row)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-gray-400 hover:text-red-600"
            onClick={() => onDelete(row)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={sorted}
      sortBy={sortBy}
      sortDirection={sortDirection}
      onSort={handleSort}
      emptyMessage="No reconciliations found. Create your first report."
    />
  );
}
