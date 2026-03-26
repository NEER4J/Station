"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ShelfTagsTable } from "./_components/shelf-tags-table";
import { ShelfTagFormDialog } from "./_components/shelf-tag-form-dialog";
import type { ShelfTag } from "@/types/database";

interface ShelfTagsClientProps {
  data: ShelfTag[];
  updateAction: (id: string, unitOrOrder: string) => Promise<void>;
  deleteAction: (id: string) => Promise<void>;
  clearAllAction: () => Promise<void>;
}

export function ShelfTagsClient({
  data,
  updateAction,
  deleteAction,
  clearAllAction,
}: ShelfTagsClientProps) {
  const [editingTag, setEditingTag] = useState<ShelfTag | undefined>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [, startTransition] = useTransition();

  const handleEdit = (tag: ShelfTag) => {
    setEditingTag(tag);
    setDialogOpen(true);
  };

  const handleUpdate = (id: string, unitOrOrder: string) => {
    startTransition(async () => {
      try {
        await updateAction(id, unitOrOrder);
        toast.success("Shelf tag updated");
      } catch {
        toast.error("Failed to update shelf tag");
      }
    });
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteAction(id);
      toast.success("Shelf tag removed");
    } catch {
      toast.error("Failed to remove shelf tag");
    }
  };

  const handleClearAll = async () => {
    try {
      await clearAllAction();
      toast.success("All shelf tags cleared");
    } catch {
      toast.error("Failed to clear shelf tags");
    }
  };

  return (
    <>
      <ShelfTagsTable
        data={data}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onClearAll={handleClearAll}
      />
      <ShelfTagFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        shelfTag={editingTag}
        onSubmit={handleUpdate}
      />
    </>
  );
}
