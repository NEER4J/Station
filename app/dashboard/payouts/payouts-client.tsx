"use client";

import { useState, useTransition } from "react";
import type { Payout } from "@/types/database";
import type { PayoutFormData } from "@/lib/validations/payouts";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { PayoutsTable } from "./_components/payouts-table";
import { PayoutFormDialog } from "./_components/payout-form-dialog";

interface PayoutsClientProps {
  initialData: Payout[];
  createAction: (data: PayoutFormData) => Promise<void>;
  updateAction: (id: string, data: PayoutFormData) => Promise<void>;
  deleteAction: (id: string) => Promise<void>;
}

export function PayoutsClient({
  initialData,
  createAction,
  updateAction,
  deleteAction,
}: PayoutsClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPayout, setEditingPayout] = useState<Payout | undefined>(
    undefined,
  );
  const [isPending, startTransition] = useTransition();

  function handleAdd() {
    setEditingPayout(undefined);
    setDialogOpen(true);
  }

  function handleEdit(payout: Payout) {
    setEditingPayout(payout);
    setDialogOpen(true);
  }

  function handleDelete(payout: Payout) {
    if (!confirm(`Delete payout "${payout.description}"?`)) return;
    startTransition(async () => {
      try {
        await deleteAction(payout.id);
        toast.success("Payout deleted");
      } catch {
        toast.error("Failed to delete payout");
      }
    });
  }

  function handleSubmit(data: PayoutFormData) {
    startTransition(async () => {
      try {
        if (editingPayout) {
          await updateAction(editingPayout.id, data);
          toast.success("Payout updated");
        } else {
          await createAction(data);
          toast.success("Payout created");
        }
      } catch {
        toast.error("Failed to save payout");
      }
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payouts"
        subtitle="Manage payout descriptions and sort order"
        actions={
          <Button
            className="bg-gray-900 text-white rounded-xl"
            onClick={handleAdd}
            disabled={isPending}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add Payout
          </Button>
        }
      />

      <PayoutsTable
        data={initialData}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <PayoutFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        payout={editingPayout}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
