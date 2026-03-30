"use client";

import { useState, useMemo } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { TenderCoupon } from "@/types/database";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { FilterToolbar } from "@/components/shared/filter-toolbar";
import { Button } from "@/components/ui/button";

interface TenderCouponsTableProps {
  data: TenderCoupon[];
  onEdit: (coupon: TenderCoupon) => void;
  onDelete: (id: string) => void;
}

const DISCOUNT_TYPE_LABELS: Record<string, string> = {
  fixed: "Fixed",
  percentage: "Percentage",
  amount_off: "Amount Off",
};

export function TenderCouponsTable({
  data,
  onEdit,
  onDelete,
}: TenderCouponsTableProps) {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("description");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const filtered = useMemo(() => {
    let result = [...data];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((d) =>
        d.description.toLowerCase().includes(q),
      );
    }

    result.sort((a, b) => {
      const aVal = a[sortBy as keyof TenderCoupon];
      const bVal = b[sortBy as keyof TenderCoupon];
      const cmp =
        typeof aVal === "number" && typeof bVal === "number"
          ? aVal - bVal
          : String(aVal ?? "").localeCompare(String(bVal ?? ""));
      return sortDirection === "asc" ? cmp : -cmp;
    });

    return result;
  }, [data, search, sortBy, sortDirection]);

  function handleSort(key: string) {
    if (sortBy === key) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDirection("asc");
    }
  }

  const columns: ColumnDef<TenderCoupon>[] = [
    { key: "description", label: "Description", sortable: true },
    {
      key: "type_of_discount",
      label: "Discount Type",
      render: (val) =>
        DISCOUNT_TYPE_LABELS[val as string] ?? (val as string) ?? "\u2014",
    },
    {
      key: "amount",
      label: "Amount",
      align: "right",
      render: (val) => `$${(val as number).toFixed(2)}`,
    },
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
      key: "is_disabled",
      label: "Status",
      render: (val) =>
        val ? (
          <span className="text-xs text-red-500 font-medium">Disabled</span>
        ) : (
          <span className="text-xs text-green-600 font-medium">Active</span>
        ),
    },
    {
      key: "actions",
      label: "",
      align: "right",
      render: (_val, row) => {
        const coupon = row as unknown as TenderCoupon;
        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(coupon)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500 hover:text-red-600"
              onClick={() => onDelete(coupon.id)}
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
        searchPlaceholder="Search tender coupons..."
        searchValue={search}
        onSearchChange={setSearch}
        filters={[]}
      />

      <DataTable
        columns={columns}
        data={filtered}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSort={handleSort}
        emptyMessage="No tender coupons found"
      />
    </div>
  );
}
