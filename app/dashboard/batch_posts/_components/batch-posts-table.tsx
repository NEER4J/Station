"use client";

import { useState, useMemo } from "react";
import type { BatchPost } from "@/types/database";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { FilterToolbar } from "@/components/shared/filter-toolbar";

interface BatchPostsTableProps {
  data: BatchPost[];
}

const STATUS_BADGE: Record<
  BatchPost["status"],
  { label: string; className: string }
> = {
  pending: { label: "Pending", className: "bg-gray-100 text-gray-700" },
  completed: { label: "Completed", className: "bg-green-100 text-green-700" },
  failed: { label: "Failed", className: "bg-red-100 text-red-700" },
};

export function BatchPostsTable({ data }: BatchPostsTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const filtered = useMemo(() => {
    let result = [...data];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (p) =>
          p.type.toLowerCase().includes(q) ||
          (p.reference_type ?? "").toLowerCase().includes(q),
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((p) => p.status === statusFilter);
    }

    result.sort((a, b) => {
      const aVal = a[sortBy as keyof BatchPost];
      const bVal = b[sortBy as keyof BatchPost];
      const cmp = String(aVal ?? "").localeCompare(String(bVal ?? ""));
      return sortDirection === "asc" ? cmp : -cmp;
    });

    return result;
  }, [data, search, statusFilter, sortBy, sortDirection]);

  function handleSort(key: string) {
    if (sortBy === key) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDirection("asc");
    }
  }

  const columns: ColumnDef<BatchPost>[] = [
    {
      key: "type",
      label: "Type",
      sortable: true,
      render: (val) => val as string,
    },
    {
      key: "reference_type",
      label: "Reference Type",
      render: (val) => (val as string) || "\u2014",
    },
    {
      key: "status",
      label: "Status",
      render: (val) => {
        const s = val as BatchPost["status"];
        const badge = STATUS_BADGE[s] ?? {
          label: s,
          className: "bg-gray-100 text-gray-700",
        };
        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}
          >
            {badge.label}
          </span>
        );
      },
    },
    {
      key: "posted_at",
      label: "Posted At",
      sortable: true,
      render: (val) =>
        (val as string)
          ? new Date(val as string).toLocaleString()
          : "\u2014",
    },
    {
      key: "created_at",
      label: "Created",
      sortable: true,
      render: (val) => new Date(val as string).toLocaleDateString(),
    },
  ];

  return (
    <div className="space-y-4">
      <FilterToolbar
        searchPlaceholder="Search batch posts..."
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
        sortDirection={sortDirection}
        onSort={handleSort}
        emptyMessage="No batch posts found"
      />
    </div>
  );
}
