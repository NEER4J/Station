"use client";

import { useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { FilterToolbar } from "@/components/shared/filter-toolbar";
import { formatCurrency } from "@/lib/utils";
import type { ShelfTag } from "@/types/database";

interface ShelfTagsTableProps {
  data: ShelfTag[];
  onEdit: (tag: ShelfTag) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export function ShelfTagsTable({
  data,
  onEdit,
  onDelete,
  onClearAll,
}: ShelfTagsTableProps) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const handleSort = (key: string) => {
    const newDir = sortBy === key && sortDir === "asc" ? "desc" : "asc";
    setSortBy(key);
    setSortDir(newDir);
  };

  const handleClearAll = () => {
    if (window.confirm("Are you sure you want to clear all shelf tags? This cannot be undone.")) {
      onClearAll();
    }
  };

  const filtered = data.filter((tag) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      tag.item?.plu?.toLowerCase().includes(q) ||
      tag.item?.upc?.toLowerCase().includes(q) ||
      tag.item?.description?.toLowerCase().includes(q)
    );
  });

  const columns: ColumnDef<ShelfTag>[] = [
    {
      key: "plu",
      label: "PLU",
      sortable: true,
      render: (_v: unknown, row: ShelfTag) => row.item?.plu ?? "-",
    },
    {
      key: "upc",
      label: "UPC",
      sortable: true,
      render: (_v: unknown, row: ShelfTag) => row.item?.upc ?? "-",
    },
    {
      key: "description",
      label: "Description",
      sortable: true,
      render: (_v: unknown, row: ShelfTag) => row.item?.description ?? "-",
    },
    {
      key: "unit_or_order",
      label: "Unit/Order",
      render: (_v: unknown, row: ShelfTag) => row.unit_or_order,
    },
    {
      key: "retail_price",
      label: "Unit Price",
      align: "right",
      sortable: true,
      render: (_v: unknown, row: ShelfTag) =>
        row.item?.retail_price != null
          ? formatCurrency(row.item.retail_price)
          : "-",
    },
    {
      key: "unit_cost",
      label: "Last Cost",
      align: "right",
      sortable: true,
      render: (_v: unknown, row: ShelfTag) =>
        row.item?.unit_cost != null
          ? formatCurrency(row.item.unit_cost)
          : "-",
    },
    {
      key: "case_cost",
      label: "Case Cost",
      align: "right",
      sortable: true,
      render: (_v: unknown, row: ShelfTag) =>
        row.item?.case_cost != null
          ? formatCurrency(row.item.case_cost)
          : "-",
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (_v: unknown, row: ShelfTag) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-500 hover:text-gray-900"
            onClick={() => onEdit(row)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-500 hover:text-red-600"
            onClick={() => onDelete(row.id)}
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
        searchPlaceholder="Search shelf tags..."
        searchValue={search}
        onSearchChange={setSearch}
        actions={
          <Button
            variant="outline"
            size="sm"
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleClearAll}
            disabled={data.length === 0}
          >
            Clear All
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={filtered}
        sortBy={sortBy}
        sortDirection={sortDir}
        onSort={handleSort}
        emptyMessage="No shelf tags"
      />
    </div>
  );
}
