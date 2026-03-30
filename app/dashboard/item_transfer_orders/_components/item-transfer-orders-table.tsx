"use client";

import { useState, useMemo } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { ItemTransferOrder } from "@/types/database";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { FilterToolbar } from "@/components/shared/filter-toolbar";
import { Button } from "@/components/ui/button";

interface ItemTransferOrdersTableProps {
  data: ItemTransferOrder[];
  onEdit: (order: ItemTransferOrder) => void;
  onDelete: (id: string) => void;
}

const STATUS_BADGE: Record<
  ItemTransferOrder["status"],
  { label: string; className: string }
> = {
  draft: { label: "Draft", className: "bg-gray-100 text-gray-700" },
  submitted: { label: "Submitted", className: "bg-blue-100 text-blue-700" },
  received: { label: "Received", className: "bg-green-100 text-green-700" },
  cancelled: { label: "Cancelled", className: "bg-red-100 text-red-700" },
};

export function ItemTransferOrdersTable({
  data,
  onEdit,
  onDelete,
}: ItemTransferOrdersTableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const filtered = useMemo(() => {
    let result = [...data];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(
        (o) =>
          o.id.toLowerCase().includes(q) ||
          (o.source_site ?? "").toLowerCase().includes(q) ||
          (o.destination_site ?? "").toLowerCase().includes(q),
      );
    }

    if (statusFilter !== "all") {
      result = result.filter((o) => o.status === statusFilter);
    }

    result.sort((a, b) => {
      const aVal = a[sortBy as keyof ItemTransferOrder];
      const bVal = b[sortBy as keyof ItemTransferOrder];
      const cmp = String(aVal ?? "").localeCompare(String(bVal ?? ""));
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

  const columns: ColumnDef<ItemTransferOrder>[] = [
    {
      key: "id",
      label: "Number",
      sortable: true,
      render: (val) => (
        <span className="font-mono text-xs">
          {(val as string).slice(0, 8).toUpperCase()}
        </span>
      ),
    },
    {
      key: "source_site",
      label: "Source Site",
      render: (val) => (val as string) || "\u2014",
    },
    {
      key: "destination_site",
      label: "Destination Site",
      render: (val) => (val as string) || "\u2014",
    },
    {
      key: "status",
      label: "Status",
      render: (val) => {
        const s = val as ItemTransferOrder["status"];
        const badge = STATUS_BADGE[s] ?? {
          label: s,
          className: "bg-gray-100 text-gray-700",
        };
        return (
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${badge.className}`}
          >
            {badge.label}
          </span>
        );
      },
    },
    {
      key: "created_at",
      label: "Created",
      sortable: true,
      render: (val) => new Date(val as string).toLocaleDateString(),
    },
    {
      key: "actions",
      label: "",
      align: "right",
      render: (_val, row) => {
        const order = row as unknown as ItemTransferOrder;
        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(order)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500 hover:text-red-600"
              onClick={() => onDelete(order.id)}
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
        searchPlaceholder="Search transfer orders..."
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
              { label: "Submitted", value: "submitted" },
              { label: "Received", value: "received" },
              { label: "Cancelled", value: "cancelled" },
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
        emptyMessage="No transfer orders found"
      />
    </div>
  );
}
