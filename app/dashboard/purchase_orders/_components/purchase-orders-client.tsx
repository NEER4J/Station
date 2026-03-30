"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { PurchaseOrder, Supplier } from "@/types/database";
import type { PurchaseOrderFormData } from "@/lib/validations/purchase-orders";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { PurchaseOrdersTable } from "./purchase-orders-table";
import { PurchaseOrderFormDialog } from "./purchase-order-form-dialog";

interface PurchaseOrdersClientProps {
  initialData: PurchaseOrder[];
  suppliers: Supplier[];
  createAction: (data: Record<string, unknown>) => Promise<void>;
  updateAction: (id: string, data: Record<string, unknown>) => Promise<void>;
  deleteAction: (id: string) => Promise<void>;
}

export function PurchaseOrdersClient({
  initialData,
  suppliers,
  createAction,
  updateAction,
  deleteAction,
}: PurchaseOrdersClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPO, setEditingPO] = useState<PurchaseOrder | undefined>();
  const [isPending, startTransition] = useTransition();

  function handleAdd() {
    setEditingPO(undefined);
    setDialogOpen(true);
  }

  function handleEdit(po: PurchaseOrder) {
    setEditingPO(po);
    setDialogOpen(true);
  }

  function handleDelete(po: PurchaseOrder) {
    if (!confirm(`Delete purchase order ${(po.id).slice(0, 8).toUpperCase()}?`)) return;
    startTransition(async () => {
      try {
        await deleteAction(po.id);
        toast.success("Purchase order deleted");
      } catch {
        toast.error("Failed to delete purchase order");
      }
    });
  }

  function handleSubmit(data: PurchaseOrderFormData) {
    startTransition(async () => {
      try {
        if (editingPO) {
          await updateAction(editingPO.id, data);
          toast.success("Purchase order updated");
        } else {
          await createAction(data);
          toast.success("Purchase order created");
        }
      } catch {
        toast.error("Failed to save purchase order");
      }
    });
  }

  return (
    <>
      <PageHeader
        title="Purchase Orders"
        subtitle="Track supplier invoices and receiving"
        actions={
          <Button
            onClick={handleAdd}
            className="bg-gray-900 text-white rounded-xl gap-2"
            disabled={isPending}
          >
            <Plus className="h-4 w-4" />
            New Purchase Order
          </Button>
        }
      />

      <PurchaseOrdersTable
        data={initialData}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <PurchaseOrderFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        purchaseOrder={editingPO}
        suppliers={suppliers}
        onSubmit={handleSubmit}
      />
    </>
  );
}
