"use client";

import { useState, useTransition, useCallback } from "react";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { FilterToolbar } from "@/components/shared/filter-toolbar";
import { Pagination } from "@/components/shared/pagination";
import { StatusBadge } from "@/components/shared/status-badge";
import { ExportButton } from "@/components/shared/export-button";
import { formatCurrency } from "@/lib/utils";
import type { Item, Department, Supplier } from "@/types/database";

interface FetchItemsOpts {
  page: number;
  pageSize: number;
  search?: string;
  departmentId?: string;
  supplierId?: string;
  status?: string;
}

interface ItemsTableProps {
  initialData: Item[];
  initialCount: number;
  departments: Department[];
  suppliers: Supplier[];
  onEdit: (item?: Item) => void;
  onDelete: (id: string) => void;
  fetchItems: (opts: FetchItemsOpts) => Promise<{ data: Item[]; count: number }>;
}

export function ItemsTable({
  initialData,
  initialCount,
  departments,
  suppliers,
  onEdit,
  onDelete,
  fetchItems,
}: ItemsTableProps) {
  const [data, setData] = useState<Item[]>(initialData);
  const [count, setCount] = useState(initialCount);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [sortBy, setSortBy] = useState<string | undefined>();
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isPending, startTransition] = useTransition();

  const refetch = useCallback(
    (overrides?: Partial<FetchItemsOpts & { pageOverride: number }>) => {
      const opts = {
        page: overrides?.pageOverride ?? overrides?.page ?? page,
        pageSize: overrides?.pageSize ?? pageSize,
        search: (overrides?.search ?? search) || undefined,
        departmentId:
          (overrides?.departmentId ?? departmentFilter) === "all"
            ? undefined
            : overrides?.departmentId ?? departmentFilter,
        supplierId:
          (overrides?.supplierId ?? supplierFilter) === "all"
            ? undefined
            : overrides?.supplierId ?? supplierFilter,
        status:
          (overrides?.status ?? statusFilter) === "all"
            ? undefined
            : overrides?.status ?? statusFilter,
      };
      startTransition(async () => {
        const result = await fetchItems(opts);
        setData(result.data);
        setCount(result.count);
      });
    },
    [page, pageSize, search, departmentFilter, supplierFilter, statusFilter, fetchItems],
  );

  const handleSearchChange = (value: string) => {
    setSearch(value);
    setPage(1);
    refetch({ search: value || undefined, pageOverride: 1 } as FetchItemsOpts & { pageOverride: number });
  };

  const handleDepartmentChange = (value: string) => {
    setDepartmentFilter(value);
    setPage(1);
    refetch({ departmentId: value, pageOverride: 1 } as FetchItemsOpts & { pageOverride: number });
  };

  const handleSupplierChange = (value: string) => {
    setSupplierFilter(value);
    setPage(1);
    refetch({ supplierId: value, pageOverride: 1 } as FetchItemsOpts & { pageOverride: number });
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    setPage(1);
    refetch({ status: value, pageOverride: 1 } as FetchItemsOpts & { pageOverride: number });
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    refetch({ page: newPage });
  };

  const handlePageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(1);
    refetch({ pageSize: newSize, pageOverride: 1 } as FetchItemsOpts & { pageOverride: number });
  };

  const handleSort = (key: string) => {
    const newDir = sortBy === key && sortDir === "asc" ? "desc" : "asc";
    setSortBy(key);
    setSortDir(newDir);
  };

  const totalPages = Math.ceil(count / pageSize);

  const statusLabel =
    statusFilter !== "all"
      ? statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1)
      : "Total";

  type ItemRow = Record<string, unknown>;

  const rows: ItemRow[] = data.map((item) => ({
    ...item,
    _item: item,
    department_name: item.department?.name ?? "-",
    supplier_name: item.supplier?.name ?? "-",
  }));

  const columns: ColumnDef<ItemRow>[] = [
    { key: "plu", label: "PLU", sortable: true },
    { key: "upc", label: "UPC", sortable: true },
    { key: "description", label: "Description", sortable: true },
    { key: "department_name", label: "Department" },
    { key: "supplier_name", label: "Supplier" },
    {
      key: "retail_price",
      label: "Retail Price",
      align: "right",
      sortable: true,
      render: (val) => formatCurrency(Number(val)),
    },
    {
      key: "unit_cost",
      label: "Unit Cost",
      align: "right",
      sortable: true,
      render: (val) => (val != null ? formatCurrency(Number(val)) : "-"),
    },
    {
      key: "margin",
      label: "Margin",
      align: "right",
      sortable: true,
      render: (val) => (val != null ? `${Number(val).toFixed(1)}%` : "-"),
    },
    {
      key: "status",
      label: "Status",
      render: (val) => <StatusBadge status={val as "active" | "inactive"} />,
    },
    {
      key: "actions",
      label: "Actions",
      align: "right",
      render: (_v, row) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-500 hover:text-gray-900"
            onClick={() => onEdit(row._item as Item)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-gray-500 hover:text-red-600"
            onClick={() => onDelete((row._item as Item).id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const exportColumns = [
    { key: "plu", label: "PLU" },
    { key: "upc", label: "UPC" },
    { key: "description", label: "Description" },
    { key: "retail_price", label: "Retail Price" },
    { key: "unit_cost", label: "Unit Cost" },
    { key: "margin", label: "Margin" },
    { key: "status", label: "Status" },
  ];

  return (
    <div className="space-y-4">
      <FilterToolbar
        searchPlaceholder="Search items..."
        searchValue={search}
        onSearchChange={handleSearchChange}
        filters={[
          {
            key: "department",
            label: "Department",
            value: departmentFilter,
            onChange: handleDepartmentChange,
            options: [
              { label: "All Departments", value: "all" },
              ...departments.map((d) => ({ label: d.name, value: d.id })),
            ],
          },
          {
            key: "supplier",
            label: "Supplier",
            value: supplierFilter,
            onChange: handleSupplierChange,
            options: [
              { label: "All Suppliers", value: "all" },
              ...suppliers.map((s) => ({ label: s.name, value: s.id })),
            ],
          },
          {
            key: "status",
            label: "Status",
            value: statusFilter,
            onChange: handleStatusChange,
            options: [
              { label: "All Status", value: "all" },
              { label: "Active", value: "active" },
              { label: "Inactive", value: "inactive" },
            ],
          },
        ]}
        actions={
          <>
            <ExportButton
              data={rows}
              columns={exportColumns}
              filename="items-export"
            />
            <Button
              className="bg-gray-900 text-white rounded-xl gap-1.5"
              size="sm"
              onClick={() => onEdit(undefined)}
            >
              <Plus className="h-4 w-4" />
              Add Item
            </Button>
          </>
        }
      />

      <DataTable
        columns={columns}
        data={rows}
        sortBy={sortBy}
        sortDirection={sortDir}
        onSort={handleSort}
        isLoading={isPending}
        emptyMessage="No items found"
      />

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        pageSize={pageSize}
        totalItems={count}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />

      <p className="text-sm text-gray-500">
        {count} {statusLabel} Items
      </p>
    </div>
  );
}
