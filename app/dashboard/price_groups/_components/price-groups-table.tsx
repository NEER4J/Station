"use client";

import { useState, useMemo } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { PriceGroup } from "@/types/database";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { FilterToolbar } from "@/components/shared/filter-toolbar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";

interface PriceGroupsTableProps {
  data: PriceGroup[];
  onEdit: (priceGroup: PriceGroup) => void;
  onDelete: (id: string) => void;
}

export function PriceGroupsTable({
  data,
  onEdit,
  onDelete,
}: PriceGroupsTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("description");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const filtered = useMemo(() => {
    let result = [...data];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((pg) =>
        pg.description.toLowerCase().includes(q),
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((pg) => pg.status === statusFilter);
    }

    result.sort((a, b) => {
      const aVal = a[sortBy as keyof PriceGroup];
      const bVal = b[sortBy as keyof PriceGroup];
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

  const columns: ColumnDef<PriceGroup>[] = [
    {
      key: "description",
      label: "Description",
      sortable: true,
    },
    {
      key: "availability",
      label: "Availability",
      render: (val) => (val as string) || "\u2014",
    },
    {
      key: "unit_price",
      label: "Unit Price",
      align: "right",
      sortable: true,
      render: (val) => {
        const price = val as number;
        return price != null
          ? `$${price.toFixed(2)}`
          : "\u2014";
      },
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
      render: (val) => <StatusBadge status={val as "active" | "inactive"} />,
    },
    {
      key: "actions",
      label: "",
      align: "right",
      render: (_val, row) => {
        const priceGroup = row as unknown as PriceGroup;
        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(priceGroup)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500 hover:text-red-600"
              onClick={() => onDelete(priceGroup.id)}
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
        searchPlaceholder="Search price groups..."
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
        emptyMessage="No price groups found"
      />
    </div>
  );
}
