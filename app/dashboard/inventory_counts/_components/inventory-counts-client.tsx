"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { InventoryCount } from "@/types/database";
import type { InventoryCountFormData } from "@/lib/validations/inventory-counts";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { InventoryCountsTable } from "./inventory-counts-table";
import { InventoryCountFormDialog } from "./inventory-count-form-dialog";

interface InventoryCountsClientProps {
  initialData: InventoryCount[];
  createAction: (data: Record<string, unknown>) => Promise<void>;
  updateAction: (id: string, data: Record<string, unknown>) => Promise<void>;
  deleteAction: (id: string) => Promise<void>;
}

export function InventoryCountsClient({
  initialData,
  createAction,
  updateAction,
  deleteAction,
}: InventoryCountsClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCount, setEditingCount] = useState<InventoryCount | undefined>();
  const [isPending, startTransition] = useTransition();

  function handleEdit(count: InventoryCount) {
    setEditingCount(count);
    setDialogOpen(true);
  }

  function handleAdd() {
    setEditingCount(undefined);
    setDialogOpen(true);
  }

  function handleSubmit(data: InventoryCountFormData) {
    startTransition(async () => {
      try {
        if (editingCount) {
          await updateAction(editingCount.id, data);
          toast.success("Inventory count updated");
        } else {
          await createAction(data);
          toast.success("Inventory count created");
        }
        setDialogOpen(false);
      } catch {
        toast.error("Something went wrong");
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      try {
        await deleteAction(id);
        toast.success("Inventory count deleted");
      } catch {
        toast.error("Failed to delete inventory count");
      }
    });
  }

  return (
    <>
      <PageHeader
        title="Physical Counts"
        subtitle="Manage inventory count sessions"
        actions={
          <Button
            onClick={handleAdd}
            disabled={isPending}
            className="bg-gray-900 text-white rounded-xl gap-2"
          >
            <Plus className="h-4 w-4" />
            New Count
          </Button>
        }
      />

      <InventoryCountsTable
        data={initialData}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <InventoryCountFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        count={editingCount}
        onSubmit={handleSubmit}
      />
    </>
  );
}
