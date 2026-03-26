"use client";

import { useState, useMemo } from "react";
import { Pencil, Trash2 } from "lucide-react";
import type { Department, Subdepartment } from "@/types/database";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { FilterToolbar } from "@/components/shared/filter-toolbar";
import { StatusBadge } from "@/components/shared/status-badge";
import { Button } from "@/components/ui/button";

interface SubdepartmentsTableProps {
  data: Subdepartment[];
  departments: Department[];
  onEdit: (subdept: Subdepartment) => void;
  onDelete: (id: string) => void;
}

export function SubdepartmentsTable({
  data,
  departments,
  onEdit,
  onDelete,
}: SubdepartmentsTableProps) {
  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const filtered = useMemo(() => {
    let result = [...data];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter((d) => d.name.toLowerCase().includes(q));
    }

    if (departmentFilter !== "all") {
      result = result.filter((d) => d.department_id === departmentFilter);
    }

    result.sort((a, b) => {
      const aVal = a[sortBy as keyof Subdepartment];
      const bVal = b[sortBy as keyof Subdepartment];
      const cmp = String(aVal ?? "").localeCompare(String(bVal ?? ""));
      return sortDirection === "asc" ? cmp : -cmp;
    });

    return result;
  }, [data, search, departmentFilter, sortBy, sortDirection]);

  function handleSort(key: string) {
    if (sortBy === key) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDirection("asc");
    }
  }

  const columns: ColumnDef<Subdepartment>[] = [
    { key: "name", label: "Name", sortable: true },
    {
      key: "department",
      label: "Department",
      sortable: true,
      render: (val) => {
        const dept = val as { id: string; name: string } | null;
        return dept?.name ?? "\u2014";
      },
    },
    {
      key: "gl_code",
      label: "GL Code",
      render: (val) => (val as string) || "\u2014",
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
        const subdept = row as unknown as Subdepartment;
        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(subdept)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500 hover:text-red-600"
              onClick={() => onDelete(subdept.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  const departmentOptions = [
    { label: "All Departments", value: "all" },
    ...departments.map((d) => ({ label: d.name, value: d.id })),
  ];

  return (
    <div className="space-y-4">
      <FilterToolbar
        searchPlaceholder="Search subdepartments..."
        searchValue={search}
        onSearchChange={setSearch}
        filters={[
          {
            key: "department",
            label: "Department",
            value: departmentFilter,
            onChange: setDepartmentFilter,
            options: departmentOptions,
          },
        ]}
      />

      <DataTable
        columns={columns}
        data={filtered}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSort={handleSort}
        emptyMessage="No subdepartments found"
      />
    </div>
  );
}
