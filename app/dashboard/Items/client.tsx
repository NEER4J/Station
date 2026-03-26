"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ItemsTable } from "./_components/items-table";
import { ItemFormDialog } from "./_components/item-form-dialog";
import type { Item, Department, Subdepartment, Supplier } from "@/types/database";
import type { ItemFormData } from "@/lib/validations/items";

interface ItemsClientProps {
  initialData: Item[];
  initialCount: number;
  departments: Department[];
  subdepartments: Subdepartment[];
  suppliers: Supplier[];
  createItemAction: (data: ItemFormData) => Promise<void>;
  updateItemAction: (id: string, data: ItemFormData) => Promise<void>;
  deleteItemAction: (id: string) => Promise<void>;
  fetchItemsAction: (opts: {
    page: number;
    pageSize: number;
    search?: string;
    departmentId?: string;
    supplierId?: string;
    status?: string;
  }) => Promise<{ data: Item[]; count: number }>;
}

export function ItemsClient({
  initialData,
  initialCount,
  departments,
  subdepartments,
  suppliers,
  createItemAction,
  updateItemAction,
  deleteItemAction,
  fetchItemsAction,
}: ItemsClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | undefined>();

  const handleEdit = (item?: Item) => {
    setEditingItem(item);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteItemAction(id);
      toast.success("Item deleted");
    } catch {
      toast.error("Failed to delete item");
    }
  };

  const handleSubmit = async (data: ItemFormData) => {
    try {
      if (editingItem) {
        await updateItemAction(editingItem.id, data);
        toast.success("Item updated");
      } else {
        await createItemAction(data);
        toast.success("Item created");
      }
    } catch {
      toast.error("Failed to save item");
    }
  };

  return (
    <>
      <ItemsTable
        initialData={initialData}
        initialCount={initialCount}
        departments={departments}
        suppliers={suppliers}
        onEdit={handleEdit}
        onDelete={handleDelete}
        fetchItems={fetchItemsAction}
      />

      <ItemFormDialog
        key={editingItem?.id ?? "new"}
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        item={editingItem}
        departments={departments}
        subdepartments={subdepartments}
        suppliers={suppliers}
        onSubmit={handleSubmit}
      />
    </>
  );
}
