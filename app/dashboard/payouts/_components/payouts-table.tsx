"use client";

import { useState, useMemo } from "react";
import type { Payout } from "@/types/database";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { FilterToolbar } from "@/components/shared/filter-toolbar";
import { ExportButton } from "@/components/shared/export-button";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

interface PayoutsTableProps {
  data: Payout[];
  onEdit: (payout: Payout) => void;
  onDelete: (payout: Payout) => void;
}

export function PayoutsTable({ data, onEdit, onDelete }: PayoutsTableProps) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("sort_order");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const filtered = useMemo(() => {
    let rows = [...data];

    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.description.toLowerCase().includes(q) ||
          (r.french_description ?? "").toLowerCase().includes(q),
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
  }, [data, search, sortBy, sortDir]);

  function handleSort(key: string) {
    if (sortBy === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDir("asc");
    }
  }

  const exportColumns = [
    { key: "description", label: "Description" },
    { key: "french_description", label: "French Description" },
    { key: "sort_order", label: "Sort Order" },
  ];

  const columns: ColumnDef<Payout>[] = [
    {
      key: "sort_order",
      label: "#",
      sortable: true,
      align: "right",
      render: (val) => (
        <span className="tabular-nums">{val as number}</span>
      ),
    },
    { key: "description", label: "Description", sortable: true },
    {
      key: "french_description",
      label: "French Description",
      sortable: true,
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
        searchPlaceholder="Search payouts..."
        searchValue={search}
        onSearchChange={setSearch}
        actions={
          <ExportButton
            data={filtered}
            columns={exportColumns}
            filename="payouts"
          />
        }
      />

      <DataTable
        columns={columns}
        data={filtered}
        sortBy={sortBy}
        sortDirection={sortDir}
        onSort={handleSort}
        emptyMessage="No payouts found"
      />
    </div>
  );
}
