"use client";

import { useState, useMemo } from "react";
import type { LiquorImport } from "@/types/database";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { FilterToolbar } from "@/components/shared/filter-toolbar";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

interface LiquorImportsTableProps {
  data: LiquorImport[];
  onDelete: (liquorImport: LiquorImport) => void;
}

export function LiquorImportsTable({ data, onDelete }: LiquorImportsTableProps) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("imported_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    let rows = [...data];

    if (statusFilter !== "all") {
      rows = rows.filter((r) => r.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter((r) => r.id.toLowerCase().includes(q));
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

  const columns: ColumnDef<LiquorImport>[] = [
    {
      key: "id",
      label: "Batch ID",
      render: (val) => (
        <span className="font-mono text-xs">
          {(val as string).slice(0, 8).toUpperCase()}
        </span>
      ),
    },
    {
      key: "is_regular",
      label: "Type",
      render: (val) => (
        <span>{(val as boolean) ? "Regular" : "LTO"}</span>
      ),
    },
    {
      key: "lto_start_date",
      label: "LTO Start",
      render: (val) => (
        <span>
          {(val as string)
            ? new Date(val as string).toLocaleDateString()
            : "—"}
        </span>
      ),
    },
    {
      key: "lto_end_date",
      label: "LTO End",
      render: (val) => (
        <span>
          {(val as string)
            ? new Date(val as string).toLocaleDateString()
            : "—"}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (val) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
            val === "completed"
              ? "bg-green-100 text-green-700"
              : val === "failed"
                ? "bg-red-100 text-red-700"
                : val === "processing"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-gray-100 text-gray-600"
          }`}
        >
          {String(val).charAt(0).toUpperCase() + String(val).slice(1)}
        </span>
      ),
    },
    {
      key: "item_count",
      label: "Items",
      align: "right",
      sortable: true,
      render: (val) => (
        <span className="tabular-nums">{(val as number) ?? 0}</span>
      ),
    },
    {
      key: "matched_count",
      label: "Matched",
      align: "right",
      sortable: true,
      render: (val) => (
        <span className="tabular-nums">{(val as number) ?? 0}</span>
      ),
    },
    {
      key: "imported_at",
      label: "Imported",
      sortable: true,
      render: (val) => (
        <span>{new Date(val as string).toLocaleString()}</span>
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
        searchPlaceholder="Search by batch ID..."
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
              { label: "Pending", value: "pending" },
              { label: "Processing", value: "processing" },
              { label: "Completed", value: "completed" },
              { label: "Failed", value: "failed" },
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
        emptyMessage="No liquor imports found"
      />
    </div>
  );
}
