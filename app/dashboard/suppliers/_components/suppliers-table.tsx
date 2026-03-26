"use client";

import { useState, useMemo } from "react";
import type { Supplier } from "@/types/database";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { FilterToolbar } from "@/components/shared/filter-toolbar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

interface SuppliersTableProps {
  data: Supplier[];
  onEdit: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
  onToggleActive: (id: string, active: boolean) => void;
}

export function SuppliersTable({
  data,
  onEdit,
  onDelete,
}: SuppliersTableProps) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [statusFilter, setStatusFilter] = useState("all");

  const filtered = useMemo(() => {
    let rows = [...data];

    if (statusFilter !== "all") {
      rows = rows.filter((r) => r.status === statusFilter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      rows = rows.filter(
        (r) =>
          r.name.toLowerCase().includes(q) ||
          (r.account_number ?? "").toLowerCase().includes(q) ||
          (r.primary_contact ?? "").toLowerCase().includes(q) ||
          (r.city ?? "").toLowerCase().includes(q),
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

  const columns: ColumnDef<Supplier>[] = [
    { key: "name", label: "Name", sortable: true },
    { key: "account_number", label: "Account #", sortable: true },
    { key: "primary_contact", label: "Primary Contact", sortable: true },
    { key: "phone", label: "Phone" },
    { key: "city", label: "City", sortable: true },
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
      key: "status",
      label: "Status",
      render: (val) => (
        <StatusBadge status={val as "active" | "inactive"} />
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
        searchPlaceholder="Search suppliers..."
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
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
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
        emptyMessage="No suppliers found"
      />
    </div>
  );
}
