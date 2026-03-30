"use client";

import { useState, useTransition } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { FuelGrade } from "@/types/database";
import { Button } from "@/components/ui/button";
import { DataTable, type ColumnDef } from "@/components/shared/data-table";
import { FuelGradeFormDialog } from "./fuel-grade-form-dialog";

interface FuelGradesPanelProps {
  initialData: FuelGrade[];
  createAction: (data: Record<string, unknown>) => Promise<void>;
  updateAction: (id: string, data: Record<string, unknown>) => Promise<void>;
  deleteAction: (id: string) => Promise<void>;
}

export function FuelGradesPanel({
  initialData,
  createAction,
  updateAction,
  deleteAction,
}: FuelGradesPanelProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingGrade, setEditingGrade] = useState<FuelGrade | undefined>();
  const [isPending, startTransition] = useTransition();
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  function handleAdd() {
    setEditingGrade(undefined);
    setDialogOpen(true);
  }

  function handleEdit(grade: FuelGrade) {
    setEditingGrade(grade);
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
        if (editingGrade) {
          await updateAction(editingGrade.id, data);
          toast.success("Product updated");
        } else {
          await createAction(data);
          toast.success("Product created");
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
        toast.success("Product deleted");
      } catch {
        toast.error("Failed to delete product");
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

  const columns: ColumnDef<FuelGrade>[] = [
    {
      key: "name",
      label: "Name",
      sortable: true,
    },
    {
      key: "code",
      label: "Code",
    },
    {
      key: "color",
      label: "Color",
      render: (val) =>
        val ? (
          <div className="flex items-center gap-2">
            <div
              className="h-4 w-4 rounded-full border border-gray-200"
              style={{ backgroundColor: val as string }}
            />
            <span>{val as string}</span>
          </div>
        ) : (
          "—"
        ),
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
        const grade = row as FuelGrade;
        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-gray-700"
              onClick={() => handleEdit(grade)}
              disabled={isPending}
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-gray-400 hover:text-red-600"
              onClick={() => handleDelete(grade.id)}
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
          <h2 className="font-semibold text-lg">Products</h2>
          <Button
            onClick={handleAdd}
            className="bg-gray-900 text-white rounded-xl gap-2"
            disabled={isPending}
          >
            <Plus className="h-4 w-4" />
            Add Product
          </Button>
        </div>

        <DataTable<FuelGrade>
          columns={columns}
          data={sorted}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSort={handleSort}
          emptyMessage="No fuel products configured yet."
          className="shadow-none"
        />
      </div>

      <FuelGradeFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        grade={editingGrade}
        onSubmit={handleSubmit}
      />
    </>
  );
}
