"use client";

import { useState, useMemo } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { Vendor } from "@/types/database";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { FilterToolbar } from "@/components/shared/filter-toolbar";
import { Button } from "@/components/ui/button";

interface Props {
  data: Vendor[];
  onEdit: (vendor: Vendor) => void;
  onDelete: (id: string) => void;
  isPending?: boolean;
}

export function VendorsTable({ data, onEdit, onDelete, isPending }: Props) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<string>("vendor_code");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  function handleSort(key: string) {
    if (sortBy === key) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDirection("asc");
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return data.filter((v) => {
      if (!q) return true;
      return (
        v.vendor_code.toLowerCase().includes(q) ||
        v.name.toLowerCase().includes(q)
      );
    });
  }, [data, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aVal = (a as unknown as Record<string, unknown>)[sortBy];
      const bVal = (b as unknown as Record<string, unknown>)[sortBy];
      const aStr = aVal != null ? String(aVal) : "";
      const bStr = bVal != null ? String(bVal) : "";
      return sortDirection === "asc"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }, [filtered, sortBy, sortDirection]);

  const columns: ColumnDef<Vendor>[] = [
    {
      key: "vendor_code",
      label: "Vendor ID",
      sortable: true,
      className: "font-mono",
    },
    {
      key: "name",
      label: "Name",
      sortable: true,
    },
    {
      key: "created_at",
      label: "Created",
      render: (val) =>
        val ? new Date(val as string).toLocaleDateString() : "\u2014",
    },
    {
      key: "actions",
      label: "",
      render: (_val, row) => {
        const vendor = row as unknown as Vendor;
        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 text-gray-500 hover:text-gray-900"
              onClick={() => onEdit(vendor)}
              disabled={isPending}
            >
              <Pencil className="h-3.5 w-3.5" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="h-7 w-7 p-0 text-gray-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => onDelete(vendor.id)}
              disabled={isPending}
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <FilterToolbar
        searchPlaceholder="Search by code or name..."
        searchValue={search}
        onSearchChange={setSearch}
      />

      <DataTable
        columns={columns}
        data={sorted}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSort={handleSort}
        emptyMessage="No vendors found. Add one above."
      />
    </div>
  );
}
