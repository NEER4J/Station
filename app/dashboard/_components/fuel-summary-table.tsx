"use client";

import { useState } from "react";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { formatCurrency } from "@/lib/utils";
import type { FuelSalesSummary } from "@/types/database";

interface FuelSummaryTableProps {
  data: FuelSalesSummary[];
}

type FuelRow = Record<string, unknown>;

const columns: ColumnDef<FuelRow>[] = [
  {
    key: "grade",
    label: "Grade",
    sortable: true,
    render: (_, row) => (
      <div className="flex items-center gap-2">
        <div
          className="h-3 w-3 rounded-full"
          style={{ backgroundColor: (row.color as string) || "#6b7280" }}
        />
        <span className="font-medium">{row.grade as string}</span>
      </div>
    ),
  },
  {
    key: "units_sold",
    label: "Volume (L)",
    align: "right",
    sortable: true,
    render: (val) => Number(val).toLocaleString(undefined, { maximumFractionDigits: 0 }),
  },
  {
    key: "dollars_sold",
    label: "Amount",
    align: "right",
    sortable: true,
    render: (val) => formatCurrency(Number(val)),
  },
];

export function FuelSummaryTable({ data }: FuelSummaryTableProps) {
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const rows: FuelRow[] = data.map((d) => ({
    grade: d.fuel_grade?.name ?? "Unknown",
    color: d.fuel_grade?.color ?? "#6b7280",
    units_sold: d.units_sold,
    dollars_sold: d.dollars_sold,
  }));

  const sorted = [...rows].sort((a, b) => {
    if (!sortBy) return 0;
    const aVal = a[sortBy];
    const bVal = b[sortBy];
    if (typeof aVal === "number" && typeof bVal === "number") {
      return sortDir === "asc" ? aVal - bVal : bVal - aVal;
    }
    return sortDir === "asc"
      ? String(aVal).localeCompare(String(bVal))
      : String(bVal).localeCompare(String(aVal));
  });

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDir("asc");
    }
  };

  return (
    <div>
      <h2 className="text-lg font-semibold text-gray-900 mb-3">
        Fuel Summary
      </h2>
      <DataTable
        columns={columns}
        data={sorted}
        sortBy={sortBy}
        sortDirection={sortDir}
        onSort={handleSort}
        emptyMessage="No fuel sales data available"
      />
    </div>
  );
}
