"use client";

import { useState, useMemo } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { Department } from "@/types/database";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { FilterToolbar } from "@/components/shared/filter-toolbar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";

interface DepartmentsTableProps {
  data: Department[];
  onEdit: (dept: Department) => void;
  onDelete: (id: string) => void;
}

export function DepartmentsTable({
  data,
  onEdit,
  onDelete,
}: DepartmentsTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("sort_order");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const filtered = useMemo(() => {
    let result = [...data];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((d) => d.name.toLowerCase().includes(q));
    }

    if (statusFilter !== "all") {
      result = result.filter((d) => d.status === statusFilter);
    }

    result.sort((a, b) => {
      const aVal = a[sortBy as keyof Department];
      const bVal = b[sortBy as keyof Department];
      const cmp =
        typeof aVal === "number" && typeof bVal === "number"
          ? aVal - bVal
          : String(aVal ?? "").localeCompare(String(bVal ?? ""));
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

  const columns: ColumnDef<Department>[] = [
    { key: "name", label: "Name", sortable: true },
    { key: "short_name", label: "Short Name" },
    {
      key: "pcats_code",
      label: "PCATS / Conexxus",
      render: (val) => (val as string) || "\u2014",
    },
    {
      key: "taxes",
      label: "Taxes",
      render: (val) => {
        const arr = val as string[];
        return arr?.length ? arr.join(", ") : "\u2014";
      },
    },
    {
      key: "include_in_sales_report",
      label: "Sales Report",
      align: "center",
      render: (val) => (
        <span
          className={`inline-block h-2.5 w-2.5 rounded-full ${
            val ? "bg-green-500" : "bg-gray-300"
          }`}
        />
      ),
    },
    {
      key: "include_in_shift_report",
      label: "Shift Report",
      align: "center",
      render: (val) => (
        <span
          className={`inline-block h-2.5 w-2.5 rounded-full ${
            val ? "bg-green-500" : "bg-gray-300"
          }`}
        />
      ),
    },
    {
      key: "item_count",
      label: "# Items",
      align: "right",
      sortable: true,
      render: (val) => (val as number) ?? 0,
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
      render: (_val, row) => {
        const dept = row as unknown as Department;
        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(dept)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500 hover:text-red-600"
              onClick={() => onDelete(dept.id)}
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
        searchPlaceholder="Search departments..."
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
        sortDirection={sortDirection}
        onSort={handleSort}
        emptyMessage="No departments found"
      />
    </div>
  );
}
