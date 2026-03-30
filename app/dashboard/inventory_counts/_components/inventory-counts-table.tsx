"use client";

import { useState, useMemo } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { InventoryCount } from "@/types/database";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { FilterToolbar } from "@/components/shared/filter-toolbar";
import { Button } from "@/components/ui/button";

interface InventoryCountsTableProps {
  data: InventoryCount[];
  onEdit: (count: InventoryCount) => void;
  onDelete: (id: string) => void;
}

const STATUS_BADGE: Record<
  InventoryCount["status"],
  { label: string; className: string }
> = {
  draft: { label: "Draft", className: "bg-gray-100 text-gray-700" },
  counting: { label: "Counting", className: "bg-blue-100 text-blue-700" },
  posted: { label: "Posted", className: "bg-green-100 text-green-700" },
};

export function InventoryCountsTable({
  data,
  onEdit,
  onDelete,
}: InventoryCountsTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const filtered = useMemo(() => {
    let result = [...data];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((c) => c.id.toLowerCase().includes(q));
    }

    if (statusFilter !== "all") {
      result = result.filter((c) => c.status === statusFilter);
    }

    result.sort((a, b) => {
      const aVal = a[sortBy as keyof InventoryCount];
      const bVal = b[sortBy as keyof InventoryCount];
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

  const columns: ColumnDef<InventoryCount>[] = [
    {
      key: "id",
      label: "Number",
      sortable: true,
      render: (val) => (
        <span className="font-mono text-xs">
          {(val as string).slice(0, 8).toUpperCase()}
        </span>
      ),
    },
    {
      key: "status",
      label: "Status",
      render: (val) => {
        const s = val as InventoryCount["status"];
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
      key: "counted_at",
      label: "Counted At",
      sortable: true,
      render: (val) =>
        (val as string)
          ? new Date(val as string).toLocaleDateString()
          : "\u2014",
    },
    {
      key: "posted_at",
      label: "Posted At",
      sortable: true,
      render: (val) =>
        (val as string)
          ? new Date(val as string).toLocaleDateString()
          : "\u2014",
    },
    {
      key: "created_at",
      label: "Created",
      sortable: true,
      render: (val) => new Date(val as string).toLocaleDateString(),
    },
    {
      key: "actions",
      label: "",
      align: "right",
      render: (_val, row) => {
        const count = row as unknown as InventoryCount;
        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(count)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500 hover:text-red-600"
              onClick={() => onDelete(count.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <FilterToolbar
        searchPlaceholder="Search counts..."
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
              { label: "Counting", value: "counting" },
              { label: "Posted", value: "posted" },
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
        emptyMessage="No inventory counts found"
      />
    </div>
  );
}
