"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { ItemList } from "@/types/database";
import type { ItemListFormData } from "@/lib/validations/item-lists";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { ItemListsTable } from "./item-lists-table";
import { ItemListFormDialog } from "./item-list-form-dialog";

interface ItemListsClientProps {
  initialData: ItemList[];
  createAction: (data: Record<string, unknown>) => Promise<void>;
  updateAction: (id: string, data: Record<string, unknown>) => Promise<void>;
  deleteAction: (id: string) => Promise<void>;
}

export function ItemListsClient({
  initialData,
  createAction,
  updateAction,
  deleteAction,
}: ItemListsClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItemList, setEditingItemList] = useState<ItemList | undefined>();
  const [isPending, startTransition] = useTransition();

  function handleAdd() {
    setEditingItemList(undefined);
    setDialogOpen(true);
  }

  function handleEdit(itemList: ItemList) {
    setEditingItemList(itemList);
    setDialogOpen(true);
  }

  function handleSubmit(data: ItemListFormData) {
    startTransition(async () => {
      try {
        if (editingItemList) {
          await updateAction(editingItemList.id, data);
          toast.success("Item list updated");
        } else {
          await createAction(data);
          toast.success("Item list created");
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
        toast.success("Item list deleted");
      } catch {
        toast.error("Failed to delete item list");
      }
    });
  }

  return (
    <>
      <PageHeader
        title="Item Lists"
        subtitle="Manage item lists and their deal group associations"
        actions={
          <Button
            onClick={handleAdd}
            disabled={isPending}
            className="bg-gray-900 text-white rounded-xl gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Item List
          </Button>
        }
      />

      <ItemListsTable
        data={initialData}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <ItemListFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        itemList={editingItemList}
        onSubmit={handleSubmit}
      />
    </>
  );
}
