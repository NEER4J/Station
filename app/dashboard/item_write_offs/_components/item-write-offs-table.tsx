"use client";

import { useState, useMemo } from "react";
import type { ItemWriteOff } from "@/types/database";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { FilterToolbar } from "@/components/shared/filter-toolbar";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

interface ItemWriteOffsTableProps {
  data: ItemWriteOff[];
  onEdit: (writeOff: ItemWriteOff) => void;
  onDelete: (writeOff: ItemWriteOff) => void;
}

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  posted: "bg-green-100 text-green-700",
};

export function ItemWriteOffsTable({
  data,
  onEdit,
  onDelete,
}: ItemWriteOffsTableProps) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
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

  const columns: ColumnDef<ItemWriteOff>[] = [
    {
      key: "id",
      label: "Number",
      render: (val) => (
        <span className="font-mono text-xs">
          {(val as string).slice(0, 8).toUpperCase()}
        </span>
      ),
    },
    {
      key: "created_at",
      label: "Date Created",
      sortable: true,
      render: (val) => new Date(val as string).toLocaleDateString(),
    },
    {
      key: "posted_at",
      label: "Posted On",
      sortable: true,
      render: (val) =>
        (val as string)
          ? new Date(val as string).toLocaleDateString()
          : "—",
    },
    {
      key: "status",
      label: "Status",
      render: (val) => {
        const status = val as string;
        const cls = STATUS_STYLES[status] ?? "bg-gray-100 text-gray-700";
        return (
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${cls}`}
          >
            {status}
          </span>
        );
      },
    },
    {
      key: "total_amount",
      label: "Total",
      align: "right",
      sortable: true,
      render: (val) => (
        <span className="tabular-nums">${(val as number).toFixed(2)}</span>
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
        searchPlaceholder="Search write-offs..."
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
              { label: "Posted", value: "posted" },
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
        emptyMessage="No write-offs found"
      />
    </div>
  );
}
