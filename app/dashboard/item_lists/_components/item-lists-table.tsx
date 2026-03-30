"use client";

import { useState, useMemo } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { ItemList } from "@/types/database";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { FilterToolbar } from "@/components/shared/filter-toolbar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";

interface ItemListsTableProps {
  data: ItemList[];
  onEdit: (itemList: ItemList) => void;
  onDelete: (id: string) => void;
}

export function ItemListsTable({ data, onEdit, onDelete }: ItemListsTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("description");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const filtered = useMemo(() => {
    let result = [...data];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((il) =>
        il.description.toLowerCase().includes(q),
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((il) => il.status === statusFilter);
    }

    result.sort((a, b) => {
      const aVal = a[sortBy as keyof ItemList];
      const bVal = b[sortBy as keyof ItemList];
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

  const columns: ColumnDef<ItemList>[] = [
    {
      key: "description",
      label: "Description",
      sortable: true,
    },
    {
      key: "status",
      label: "Status",
      render: (val) => <StatusBadge status={val as "active" | "inactive"} />,
    },
    {
      key: "deal_group_count",
      label: "# Deal Groups",
      align: "right",
      sortable: true,
      render: (val) => (val as number) ?? 0,
    },
    {
      key: "created_at",
      label: "Created",
      render: (val) =>
        val
          ? new Date(val as string).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })
          : "\u2014",
    },
    {
      key: "actions",
      label: "",
      align: "right",
      render: (_val, row) => {
        const itemList = row as unknown as ItemList;
        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(itemList)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500 hover:text-red-600"
              onClick={() => onDelete(itemList.id)}
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
        searchPlaceholder="Search item lists..."
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
        emptyMessage="No item lists found"
      />
    </div>
  );
}
