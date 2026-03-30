"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import type { Role } from "@/types/database";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  roles: Role[];
  createRoleAction: (name: string) => Promise<void>;
  deleteRoleAction: (id: string) => Promise<void>;
}

export function RolesTab({ roles, createRoleAction, deleteRoleAction }: Props) {
  const [newRoleName, setNewRoleName] = useState("");
  const [isPending, startTransition] = useTransition();
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  function handleSort(key: string) {
    if (sortBy === key) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDirection("asc");
    }
  }

  const sorted = [...roles].sort((a, b) => {
    const aVal = (a as unknown as Record<string, unknown>)[sortBy];
    const bVal = (b as unknown as Record<string, unknown>)[sortBy];
    const aStr = aVal != null ? String(aVal) : "";
    const bStr = bVal != null ? String(bVal) : "";
    return sortDirection === "asc"
      ? aStr.localeCompare(bStr)
      : bStr.localeCompare(aStr);
  });

  function handleAddRole() {
    if (!newRoleName.trim()) return;
    startTransition(async () => {
      try {
        await createRoleAction(newRoleName.trim());
        setNewRoleName("");
        toast.success("Role created");
      } catch {
        toast.error("Failed to create role");
      }
    });
  }

  function handleDeleteRole(role: Role) {
    if (!confirm(`Delete role "${role.name}"?`)) return;
    startTransition(async () => {
      try {
        await deleteRoleAction(role.id);
        toast.success("Role deleted");
      } catch {
        toast.error("Failed to delete role");
      }
    });
  }

  const columns: ColumnDef<Role>[] = [
    {
      key: "name",
      label: "Name",
      sortable: true,
      render: (val) => <span className="capitalize">{val as string}</span>,
    },
    {
      key: "description",
      label: "Description",
      render: (val) => (val as string) || "\u2014",
    },
    {
      key: "actions",
      label: "",
      render: (_val, row) => {
        const role = row as unknown as Role;
        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteRole(role)}
            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
            disabled={isPending}
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Delete</span>
          </Button>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      {/* Quick-add row */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex items-end gap-3">
        <div className="flex-1">
          <Label className="text-xs text-gray-500 mb-1 block">Role Name</Label>
          <Input
            placeholder="e.g. Cashier, Supervisor"
            value={newRoleName}
            onChange={(e) => setNewRoleName(e.target.value)}
            className="bg-gray-100 border-0"
            onKeyDown={(e) => e.key === "Enter" && handleAddRole()}
          />
        </div>
        <Button
          onClick={handleAddRole}
          disabled={!newRoleName.trim() || isPending}
          className="bg-gray-900 text-white rounded-xl"
        >
          Add Role
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={sorted}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSort={handleSort}
        emptyMessage="No roles found. Add one above."
      />
    </div>
  );
}
