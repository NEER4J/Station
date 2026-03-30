"use client";

import { useState, useTransition } from "react";
import type { BatchPromotion } from "@/types/database";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { BatchPromotionsTable } from "./batch-promotions-table";
import { BatchPromotionFormDialog } from "./batch-promotion-form-dialog";

interface BatchPromotionsClientProps {
  initialData: BatchPromotion[];
  createAction: (data: Record<string, unknown>) => Promise<void>;
  updateAction: (id: string, data: Record<string, unknown>) => Promise<void>;
  deleteAction: (id: string) => Promise<void>;
}

export function BatchPromotionsClient({
  initialData,
  createAction,
  updateAction,
  deleteAction,
}: BatchPromotionsClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<
    BatchPromotion | undefined
  >(undefined);
  const [isPending, startTransition] = useTransition();

  function handleAdd() {
    setEditingPromotion(undefined);
    setDialogOpen(true);
  }

  function handleEdit(promotion: BatchPromotion) {
    setEditingPromotion(promotion);
    setDialogOpen(true);
  }

  function handleDelete(promotion: BatchPromotion) {
    if (!confirm(`Delete this batch promotion?`)) return;
    startTransition(async () => {
      try {
        await deleteAction(promotion.id);
        toast.success("Batch promotion deleted");
      } catch {
        toast.error("Failed to delete batch promotion");
      }
    });
  }

  function handleSubmit(data: Record<string, unknown>) {
    startTransition(async () => {
      try {
        if (editingPromotion) {
          await updateAction(editingPromotion.id, data);
          toast.success("Batch promotion updated");
        } else {
          await createAction(data);
          toast.success("Batch promotion created");
        }
        setDialogOpen(false);
      } catch {
        toast.error("Failed to save batch promotion");
      }
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Batch Promotions"
        subtitle="Manage promotional pricing campaigns"
        actions={
          <Button
            className="bg-gray-900 text-white rounded-xl"
            onClick={handleAdd}
            disabled={isPending}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add Promotion
          </Button>
        }
      />

      <BatchPromotionsTable
        data={initialData}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <BatchPromotionFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        promotion={editingPromotion}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
