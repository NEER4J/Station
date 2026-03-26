"use client";

import { useState } from "react";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { FilterToolbar } from "@/components/shared/filter-toolbar";
import { ExportButton } from "@/components/shared/export-button";
import { formatCurrency } from "@/lib/utils";
import type { FuelSalesSummary } from "@/types/database";

interface FuelGradeSummaryTableProps {
  data: FuelSalesSummary[];
  hideFinancials?: boolean;
}

type FuelGradeRow = Record<string, unknown>;

function getColumns(hideFinancials: boolean): ColumnDef<FuelGradeRow>[] {
  return [
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
      key: "dollars_sold",
      label: "Dollars Sold",
      align: "right",
      sortable: true,
      render: (val) =>
        hideFinancials ? "---" : formatCurrency(Number(val)),
    },
    {
      key: "units_sold",
      label: "Units Sold",
      align: "right",
      sortable: true,
      render: (val) =>
        Number(val).toLocaleString(undefined, { maximumFractionDigits: 0 }),
    },
    {
      key: "avg_price",
      label: "Avg Price",
      align: "right",
      sortable: true,
      render: (val) =>
        formatCurrency(Number(val), { maximumFractionDigits: 3 }),
    },
    {
      key: "avg_margin",
      label: "Avg Margin",
      align: "right",
      sortable: true,
      render: (val) =>
        hideFinancials
          ? "---"
          : `${(Number(val) * 100).toFixed(1)}%`,
    },
    {
      key: "gross_profit",
      label: "Gross Profit",
      align: "right",
      sortable: true,
      render: (val) =>
        hideFinancials ? "---" : formatCurrency(Number(val)),
    },
  ];
}

const exportColumns = [
  { key: "grade", label: "Grade" },
  { key: "dollars_sold", label: "Dollars Sold" },
  { key: "units_sold", label: "Units Sold" },
  { key: "avg_price", label: "Avg Price" },
  { key: "avg_margin", label: "Avg Margin" },
  { key: "gross_profit", label: "Gross Profit" },
];

export function FuelGradeSummaryTable({
  data,
  hideFinancials = false,
}: FuelGradeSummaryTableProps) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const rows: FuelGradeRow[] = data.map((d) => ({
    grade: d.fuel_grade?.name ?? "Unknown",
    color: d.fuel_grade?.color ?? "#6b7280",
    dollars_sold: d.dollars_sold,
    units_sold: d.units_sold,
    avg_price: d.avg_price,
    avg_margin: d.avg_margin,
    gross_profit: d.gross_profit,
  }));

  const filtered = rows.filter((r) =>
    String(r.grade).toLowerCase().includes(search.toLowerCase()),
  );

  const sorted = [...filtered].sort((a, b) => {
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
    <div className="space-y-3">
      <FilterToolbar
        searchPlaceholder="Filter by grade..."
        searchValue={search}
        onSearchChange={setSearch}
        actions={
          <ExportButton
            data={rows}
            columns={exportColumns}
            filename="fuel-grade-summary"
          />
        }
      />
      <DataTable
        columns={getColumns(hideFinancials)}
        data={sorted}
        sortBy={sortBy}
        sortDirection={sortDir}
        onSort={handleSort}
        emptyMessage="No fuel sales data available"
      />
    </div>
  );
}
