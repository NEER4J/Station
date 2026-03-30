"use client";

import { useState, useMemo, useTransition } from "react";
import { toast } from "sonner";
import { Pencil } from "lucide-react";
import type { UserWithProfile } from "@/lib/data/users";
import type { Role } from "@/types/database";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { FilterToolbar } from "@/components/shared/filter-toolbar";
import { Button } from "@/components/ui/button";
import { UserEditDialog } from "./user-edit-dialog";

interface Props {
  users: UserWithProfile[];
  roles: Role[];
  stations: { id: string; name: string }[];
  updateUserAction: (id: string, data: Record<string, unknown>) => Promise<void>;
}

export function UsersTab({ users, roles, stations, updateUserAction }: Props) {
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserWithProfile | null>(null);
  const [isPending, startTransition] = useTransition();
  const [sortBy, setSortBy] = useState<string>("full_name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  function handleSort(key: string) {
    if (sortBy === key) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDirection("asc");
    }
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter((u) => {
      if (!q) return true;
      return (u.full_name ?? "").toLowerCase().includes(q);
    });
  }, [users, search]);

  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const aVal = (a as unknown as Record<string, unknown>)[sortBy];
      const bVal = (b as unknown as Record<string, unknown>)[sortBy];
      const aStr = aVal != null ? String(aVal) : "";
      const bStr = bVal != null ? String(bVal) : "";
      return sortDirection === "asc"
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }, [filtered, sortBy, sortDirection]);

  function handleEdit(user: UserWithProfile) {
    setEditingUser(user);
    setDialogOpen(true);
  }

  function handleSubmit(data: Record<string, unknown>) {
    if (!editingUser) return;
    startTransition(async () => {
      try {
        await updateUserAction(editingUser.id, data);
        setDialogOpen(false);
        setEditingUser(null);
        toast.success("User updated");
      } catch {
        toast.error("Failed to update user");
      }
    });
  }

  const columns: ColumnDef<UserWithProfile>[] = [
    {
      key: "full_name",
      label: "Name",
      sortable: true,
      render: (val) => (val as string) || "\u2014",
    },
    {
      key: "id",
      label: "User ID",
      className: "font-mono text-xs",
      render: (val) => (val as string)?.slice(0, 8).toUpperCase() || "\u2014",
    },
    {
      key: "role",
      label: "Role",
      render: (_val, row) => {
        const u = row as unknown as UserWithProfile;
        return u.role?.name ? (
          <span className="capitalize">{u.role.name}</span>
        ) : (
          "\u2014"
        );
      },
    },
    {
      key: "station",
      label: "Site",
      render: (_val, row) => {
        const u = row as unknown as UserWithProfile;
        return u.station?.name || "\u2014";
      },
    },
    {
      key: "is_active",
      label: "Status",
      render: (val) =>
        val ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
            Active
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
            Inactive
          </span>
        ),
    },
    {
      key: "actions",
      label: "",
      render: (_val, row) => {
        const u = row as unknown as UserWithProfile;
        return (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 w-7 p-0 text-gray-500 hover:text-gray-900"
            onClick={() => handleEdit(u)}
            disabled={isPending}
          >
            <Pencil className="h-3.5 w-3.5" />
            <span className="sr-only">Edit</span>
          </Button>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <FilterToolbar
        searchPlaceholder="Search by name..."
        searchValue={search}
        onSearchChange={setSearch}
      />

      <DataTable
        columns={columns}
        data={sorted}
        sortBy={sortBy}
        sortDirection={sortDirection}
        onSort={handleSort}
        emptyMessage="No users found."
      />

      <UserEditDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        user={editingUser ?? undefined}
        roles={roles}
        stations={stations}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
