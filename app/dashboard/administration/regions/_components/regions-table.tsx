"use client";

import { useState } from "react";
import type { Region } from "@/types/database";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

interface Props {
  data: Region[];
  onEdit: (region: Region) => void;
  onDelete: (id: string) => void;
  isPending?: boolean;
}

export function RegionsTable({ data, onEdit, onDelete, isPending }: Props) {
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  function handleSort(key: string) {
    if (sortBy === key) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDirection("asc");
    }
  }

  const sorted = [...data].sort((a, b) => {
    const aVal = (a as unknown as Record<string, unknown>)[sortBy];
    const bVal = (b as unknown as Record<string, unknown>)[sortBy];
    const aStr = aVal != null ? String(aVal) : "";
    const bStr = bVal != null ? String(bVal) : "";
    return sortDirection === "asc"
      ? aStr.localeCompare(bStr)
      : bStr.localeCompare(aStr);
  });

  const columns: ColumnDef<Region>[] = [
    {
      key: "name",
      label: "Name",
      sortable: true,
    },
    {
      key: "category",
      label: "Category",
      sortable: true,
      render: (val) => (val as string) || "—",
    },
    {
      key: "site_count",
      label: "# Sites",
      align: "right",
      render: (val) => <span className="tabular-nums">{(val as number) ?? 0}</span>,
    },
    {
      key: "created_at",
      label: "Created",
      render: (val) =>
        val ? new Date(val as string).toLocaleDateString() : "—",
    },
    {
      key: "actions",
      label: "",
      render: (_val, row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-gray-500 hover:text-gray-900"
            onClick={() => onEdit(row)}
            disabled={isPending}
          >
            <Pencil className="h-3.5 w-3.5" />
            <span className="sr-only">Edit</span>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50"
            onClick={() => onDelete(row.id)}
            disabled={isPending}
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="sr-only">Delete</span>
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
      emptyMessage="No regions found. Add one above."
    />
  );
}
