"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { ItemTransferOrder } from "@/types/database";
import type { ItemTransferOrderFormData } from "@/lib/validations/item-transfer-orders";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { ItemTransferOrdersTable } from "./item-transfer-orders-table";
import { ItemTransferOrderFormDialog } from "./item-transfer-order-form-dialog";

interface ItemTransferOrdersClientProps {
  initialData: ItemTransferOrder[];
  createAction: (data: Record<string, unknown>) => Promise<void>;
  updateAction: (id: string, data: Record<string, unknown>) => Promise<void>;
  deleteAction: (id: string) => Promise<void>;
}

export function ItemTransferOrdersClient({
  initialData,
  createAction,
  updateAction,
  deleteAction,
}: ItemTransferOrdersClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<
    ItemTransferOrder | undefined
  >();
  const [isPending, startTransition] = useTransition();

  function handleEdit(order: ItemTransferOrder) {
    setEditingOrder(order);
    setDialogOpen(true);
  }

  function handleAdd() {
    setEditingOrder(undefined);
    setDialogOpen(true);
  }

  function handleSubmit(data: ItemTransferOrderFormData) {
    startTransition(async () => {
      try {
        if (editingOrder) {
          await updateAction(editingOrder.id, data);
          toast.success("Transfer order updated");
        } else {
          await createAction(data);
          toast.success("Transfer order created");
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
        toast.success("Transfer order deleted");
      } catch {
        toast.error("Failed to delete transfer order");
      }
    });
  }

  return (
    <>
      <PageHeader
        title="Item Transfer Orders"
        subtitle="Manage stock transfers between sites"
        actions={
          <Button
            onClick={handleAdd}
            disabled={isPending}
            className="bg-gray-900 text-white rounded-xl gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Transfer Order
          </Button>
        }
      />

      <ItemTransferOrdersTable
        data={initialData}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <ItemTransferOrderFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        order={editingOrder}
        onSubmit={handleSubmit}
      />
    </>
  );
}
