"use client";

import { useState, useTransition } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { FuelGrade, FuelTank } from "@/types/database";
import { Button } from "@/components/ui/button";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { FuelTankFormDialog } from "./fuel-tank-form-dialog";

interface FuelTanksPanelProps {
  initialData: FuelTank[];
  fuelGrades: FuelGrade[];
  createAction: (data: Record<string, unknown>) => Promise<void>;
  updateAction: (id: string, data: Record<string, unknown>) => Promise<void>;
  deleteAction: (id: string) => Promise<void>;
}

export function FuelTanksPanel({
  initialData,
  fuelGrades,
  createAction,
  updateAction,
  deleteAction,
}: FuelTanksPanelProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTank, setEditingTank] = useState<FuelTank | undefined>();
  const [isPending, startTransition] = useTransition();
  const [sortBy, setSortBy] = useState<string>("tank_number");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  function handleAdd() {
    setEditingTank(undefined);
    setDialogOpen(true);
  }

  function handleEdit(tank: FuelTank) {
    setEditingTank(tank);
    setDialogOpen(true);
  }

  function handleSort(key: string) {
    if (sortBy === key) {
      setSortDirection((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDirection("asc");
    }
  }

  function handleSubmit(data: Record<string, unknown>) {
    startTransition(async () => {
      try {
        if (editingTank) {
          await updateAction(editingTank.id, data);
          toast.success("Tank updated");
        } else {
          await createAction(data);
          toast.success("Tank created");
        }
      } catch {
        toast.error("Something went wrong");
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      try {
        await deleteAction(id);
        toast.success("Tank deleted");
      } catch {
        toast.error("Failed to delete tank");
      }
    });
  }

  const sorted = [...initialData].sort((a, b) => {
    const aVal = (a as unknown as Record<string, unknown>)[sortBy];
    const bVal = (b as unknown as Record<string, unknown>)[sortBy];
    const cmp =
      typeof aVal === "number" && typeof bVal === "number"
        ? aVal - bVal
        : String(aVal ?? "").localeCompare(String(bVal ?? ""));
    return sortDirection === "asc" ? cmp : -cmp;
  });

  const columns: ColumnDef<FuelTank>[] = [
    {
      key: "tank_number",
      label: "Tank #",
      sortable: true,
    },
    {
      key: "fuel_grade",
      label: "Product",
      render: (_val, row) => {
        const tank = row as unknown as FuelTank;
        return tank.fuel_grade?.name ?? "—";
      },
    },
    {
      key: "capacity_litres",
      label: "Capacity (L)",
      align: "right",
      sortable: true,
      render: (val) => `${(val as number).toLocaleString()} L`,
    },
    {
      key: "low_level_threshold",
      label: "Low Level (L)",
      align: "right",
      render: (val) => `${(val as number).toLocaleString()} L`,
    },
    {
      key: "is_active",
      label: "Active",
      render: (val) => (
        <span
          className={`inline-block h-2.5 w-2.5 rounded-full ${
            val ? "bg-green-500" : "bg-gray-300"
          }`}
        />
      ),
    },
    {
      key: "actions",
      label: "",
      render: (_val, row) => {
        const tank = row as FuelTank;
        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-gray-700"
              onClick={() => handleEdit(tank)}
              disabled={isPending}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-red-600"
              onClick={() => handleDelete(tank.id)}
              disabled={isPending}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">Tanks</h2>
          <Button
            onClick={handleAdd}
            className="bg-gray-900 text-white rounded-xl gap-2"
            disabled={isPending}
          >
            <Plus className="h-4 w-4" />
            Add Tank
          </Button>
        </div>

        <DataTable<FuelTank>
          columns={columns}
          data={sorted}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSort={handleSort}
          emptyMessage="No tanks configured yet."
          className="shadow-none"
        />
      </div>

      <FuelTankFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tank={editingTank}
        fuelGrades={fuelGrades}
        onSubmit={handleSubmit}
      />
    </>
  );
}
