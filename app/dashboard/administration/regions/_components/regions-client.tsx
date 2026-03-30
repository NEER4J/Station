"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { Region } from "@/types/database";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RegionsTable } from "./regions-table";
import { RegionFormDialog } from "./region-form-dialog";

interface Props {
  initialData: Region[];
  createAction: (data: Record<string, unknown>) => Promise<void>;
  updateAction: (id: string, data: Record<string, unknown>) => Promise<void>;
  deleteAction: (id: string) => Promise<void>;
}

export function RegionsClient({
  initialData,
  createAction,
  updateAction,
  deleteAction,
}: Props) {
  const [regions, setRegions] = useState<Region[]>(initialData);
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [isPending, startTransition] = useTransition();
  const [editTarget, setEditTarget] = useState<Region | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  function handleQuickAdd() {
    if (!newName.trim()) return;
    startTransition(async () => {
      try {
        await createAction({ name: newName.trim(), category: newCategory.trim() || null });
        setNewName("");
        setNewCategory("");
        toast.success("Region created");
      } catch {
        toast.error("Failed to create region");
      }
    });
  }

  function handleEdit(region: Region) {
    setEditTarget(region);
    setDialogOpen(true);
  }

  function handleDialogSave(data: { name: string; category: string }) {
    if (!editTarget) return;
    startTransition(async () => {
      try {
        await updateAction(editTarget.id, {
          name: data.name,
          category: data.category || null,
        });
        setDialogOpen(false);
        setEditTarget(null);
        toast.success("Region updated");
      } catch {
        toast.error("Failed to update region");
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      try {
        await deleteAction(id);
        setRegions((prev) => prev.filter((r) => r.id !== id));
        toast.success("Region deleted");
      } catch {
        toast.error("Failed to delete region");
      }
    });
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Regions"
        subtitle="Manage region groupings for sites"
        backHref="/dashboard/administration"
      />

      {/* Quick-add row */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex items-end gap-3">
        <div className="flex-1">
          <Label className="text-xs text-gray-500 mb-1 block">Name</Label>
          <Input
            placeholder="Region name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="bg-gray-100 border-0"
            onKeyDown={(e) => e.key === "Enter" && handleQuickAdd()}
          />
        </div>
        <div className="w-40">
          <Label className="text-xs text-gray-500 mb-1 block">Category</Label>
          <Input
            placeholder="Category"
            value={newCategory}
            onChange={(e) => setNewCategory(e.target.value)}
            className="bg-gray-100 border-0"
            onKeyDown={(e) => e.key === "Enter" && handleQuickAdd()}
          />
        </div>
        <Button
          onClick={handleQuickAdd}
          disabled={!newName.trim() || isPending}
          className="bg-gray-900 text-white rounded-xl"
        >
          Add Region
        </Button>
      </div>

      <RegionsTable
        data={regions}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isPending={isPending}
      />

      <RegionFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        region={editTarget}
        onSave={handleDialogSave}
        isPending={isPending}
      />
    </div>
  );
}
