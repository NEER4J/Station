"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { ItemWriteOff } from "@/types/database";
import type { ItemWriteOffFormData } from "@/lib/validations/item-write-offs";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { ItemWriteOffsTable } from "./item-write-offs-table";
import { ItemWriteOffFormDialog } from "./item-write-off-form-dialog";

interface ItemWriteOffsClientProps {
  initialData: ItemWriteOff[];
  createAction: (data: Record<string, unknown>) => Promise<void>;
  updateAction: (id: string, data: Record<string, unknown>) => Promise<void>;
  deleteAction: (id: string) => Promise<void>;
}

export function ItemWriteOffsClient({
  initialData,
  createAction,
  updateAction,
  deleteAction,
}: ItemWriteOffsClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingWriteOff, setEditingWriteOff] = useState<
    ItemWriteOff | undefined
  >();
  const [isPending, startTransition] = useTransition();

  function handleAdd() {
    setEditingWriteOff(undefined);
    setDialogOpen(true);
  }

  function handleEdit(writeOff: ItemWriteOff) {
    setEditingWriteOff(writeOff);
    setDialogOpen(true);
  }

  function handleDelete(writeOff: ItemWriteOff) {
    if (
      !confirm(
        `Delete write-off ${writeOff.id.slice(0, 8).toUpperCase()}?`,
      )
    )
      return;
    startTransition(async () => {
      try {
        await deleteAction(writeOff.id);
        toast.success("Write-off deleted");
      } catch {
        toast.error("Failed to delete write-off");
      }
    });
  }

  function handleSubmit(data: ItemWriteOffFormData) {
    startTransition(async () => {
      try {
        if (editingWriteOff) {
          await updateAction(editingWriteOff.id, data);
          toast.success("Write-off updated");
        } else {
          await createAction(data);
          toast.success("Write-off created");
        }
      } catch {
        toast.error("Failed to save write-off");
      }
    });
  }

  return (
    <>
      <PageHeader
        title="Item Write-Off"
        subtitle="Record and post inventory write-offs"
        actions={
          <Button
            onClick={handleAdd}
            className="bg-gray-900 text-white rounded-xl gap-2"
            disabled={isPending}
          >
            <Plus className="h-4 w-4" />
            New Write-Off
          </Button>
        }
      />

      <ItemWriteOffsTable
        data={initialData}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <ItemWriteOffFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        writeOff={editingWriteOff}
        onSubmit={handleSubmit}
      />
    </>
  );
}
