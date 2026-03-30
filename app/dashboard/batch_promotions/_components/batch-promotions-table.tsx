"use client";

import { useState, useMemo } from "react";
import type { BatchPromotion } from "@/types/database";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { FilterToolbar } from "@/components/shared/filter-toolbar";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

interface BatchPromotionsTableProps {
  data: BatchPromotion[];
  onEdit: (promotion: BatchPromotion) => void;
  onDelete: (promotion: BatchPromotion) => void;
}

export function BatchPromotionsTable({
  data,
  onEdit,
  onDelete,
}: BatchPromotionsTableProps) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("start_date");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    let rows = [...data];

    if (statusFilter !== "all") {
      rows = rows.filter((r) => r.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((r) =>
        (r.comments ?? "").toLowerCase().includes(q),
      );
    }

    rows.sort((a, b) => {
      const aVal = (a as unknown as Record<string, unknown>)[sortBy] ?? "";
      const bVal = (b as unknown as Record<string, unknown>)[sortBy] ?? "";
      const cmp = String(aVal).localeCompare(String(bVal), undefined, {
        numeric: true,
      });
      return sortDir === "asc" ? cmp : -cmp;
    });

    return rows;
  }, [data, search, sortBy, sortDir, statusFilter]);

  function handleSort(key: string) {
    if (sortBy === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDir("asc");
    }
  }

  const columns: ColumnDef<BatchPromotion>[] = [
    {
      key: "promotion_price",
      label: "Promo Price",
      align: "right",
      sortable: true,
      render: (val) => (
        <span className="tabular-nums">${(val as number).toFixed(2)}</span>
      ),
    },
    {
      key: "comments",
      label: "Comments",
      render: (val) => <span>{(val as string) || "—"}</span>,
    },
    {
      key: "start_date",
      label: "Start Date",
      sortable: true,
      render: (val) => (
        <span>{new Date(val as string).toLocaleDateString()}</span>
      ),
    },
    {
      key: "end_date",
      label: "End Date",
      sortable: true,
      render: (val) => (
        <span>{new Date(val as string).toLocaleDateString()}</span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (val) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            val === "active"
              ? "bg-green-100 text-green-700"
              : val === "expired"
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-600"
          }`}
        >
          {String(val).charAt(0).toUpperCase() + String(val).slice(1)}
        </span>
      ),
    },
    {
      key: "item_count",
      label: "# Items",
      align: "right",
      sortable: true,
      render: (val) => (
        <span className="tabular-nums">{(val as number) ?? 0}</span>
      ),
    },
    {
      key: "actions",
      label: "",
      align: "right",
      render: (_val, row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(row)}
            className="h-8 w-8 p-0"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(row)}
            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <FilterToolbar
        searchPlaceholder="Search promotions..."
        searchValue={search}
        onSearchChange={setSearch}
        filters={[
          {
            key: "status",
            label: "Status",
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: "All Statuses", value: "all" },
              { label: "Draft", value: "draft" },
              { label: "Active", value: "active" },
              { label: "Expired", value: "expired" },
            ],
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={filtered}
        sortBy={sortBy}
        sortDirection={sortDir}
        onSort={handleSort}
        emptyMessage="No batch promotions found"
      />
    </div>
  );
}
