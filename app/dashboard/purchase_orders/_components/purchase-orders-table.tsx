"use client";

import { useState, useMemo } from "react";
import type { PurchaseOrder } from "@/types/database";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { FilterToolbar } from "@/components/shared/filter-toolbar";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";

interface PurchaseOrdersTableProps {
  data: PurchaseOrder[];
  onEdit: (po: PurchaseOrder) => void;
  onDelete: (po: PurchaseOrder) => void;
}

const STATUS_STYLES: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  submitted: "bg-blue-100 text-blue-700",
  received: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export function PurchaseOrdersTable({
  data,
  onEdit,
  onDelete,
}: PurchaseOrdersTableProps) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("created_at");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
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
          r.id.toLowerCase().includes(q) ||
          (r.invoice_number ?? "").toLowerCase().includes(q) ||
          (r.supplier?.name ?? "").toLowerCase().includes(q),
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

  const columns: ColumnDef<PurchaseOrder>[] = [
    {
      key: "id",
      label: "PO #",
      render: (val) => (
        <span className="font-mono text-xs">
          {(val as string).slice(0, 8).toUpperCase()}
        </span>
      ),
    },
    {
      key: "invoice_date",
      label: "Invoice Date",
      sortable: true,
      render: (val) =>
        (val as string)
          ? new Date(val as string).toLocaleDateString()
          : "—",
    },
    {
      key: "invoice_number",
      label: "Invoice #",
      render: (val) => (val as string) || "—",
    },
    {
      key: "supplier",
      label: "Supplier",
      sortable: true,
      render: (_val, row) => {
        const po = row as PurchaseOrder;
        return po.supplier?.name ?? "—";
      },
    },
    {
      key: "expected_date",
      label: "Expected",
      sortable: true,
      render: (val) =>
        (val as string)
          ? new Date(val as string).toLocaleDateString()
          : "—",
    },
    {
      key: "status",
      label: "Status",
      render: (val) => {
        const status = val as string;
        const cls = STATUS_STYLES[status] ?? "bg-gray-100 text-gray-700";
        return (
          <span
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize ${cls}`}
          >
            {status}
          </span>
        );
      },
    },
    {
      key: "total",
      label: "Total",
      align: "right",
      sortable: true,
      render: (val) => (
        <span className="tabular-nums">${(val as number).toFixed(2)}</span>
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
        searchPlaceholder="Search purchase orders..."
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
        sortDirection={sortDir}
        onSort={handleSort}
        emptyMessage="No purchase orders found"
      />
    </div>
  );
}
