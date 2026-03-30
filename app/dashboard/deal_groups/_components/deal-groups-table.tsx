"use client";

import { useState, useMemo } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { DealGroup } from "@/types/database";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { FilterToolbar } from "@/components/shared/filter-toolbar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";

interface DealGroupsTableProps {
  data: DealGroup[];
  onEdit: (dealGroup: DealGroup) => void;
  onDelete: (id: string) => void;
}

export function DealGroupsTable({
  data,
  onEdit,
  onDelete,
}: DealGroupsTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
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
      const aVal = a[sortBy as keyof DealGroup];
      const bVal = b[sortBy as keyof DealGroup];
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

  const columns: ColumnDef<DealGroup>[] = [
    { key: "name", label: "Name", sortable: true },
    {
      key: "start_date",
      label: "Start Date",
      render: (val) =>
        val ? new Date(val as string).toLocaleDateString() : "\u2014",
    },
    {
      key: "end_date",
      label: "End Date",
      render: (val) =>
        val ? new Date(val as string).toLocaleDateString() : "\u2014",
    },
    {
      key: "availability",
      label: "Availability",
      render: (val) => (val as string) || "\u2014",
    },
    {
      key: "component_count",
      label: "# Components",
      align: "right",
      render: (val) => (val as number) ?? 0,
    },
    {
      key: "status",
      label: "Status",
      render: (val) => <StatusBadge status={val as "active" | "inactive"} />,
    },
    {
      key: "actions",
      label: "",
      align: "right",
      render: (_val, row) => {
        const dealGroup = row as unknown as DealGroup;
        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(dealGroup)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500 hover:text-red-600"
              onClick={() => onDelete(dealGroup.id)}
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
        searchPlaceholder="Search deal groups..."
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
        emptyMessage="No deal groups found"
      />
    </div>
  );
}
