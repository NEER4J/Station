"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { PriceGroup } from "@/types/database";
import type { PriceGroupFormData } from "@/lib/validations/price-groups";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { PriceGroupsTable } from "./price-groups-table";
import { PriceGroupFormDialog } from "./price-group-form-dialog";

interface PriceGroupsClientProps {
  initialData: PriceGroup[];
  createAction: (data: Record<string, unknown>) => Promise<void>;
  updateAction: (id: string, data: Record<string, unknown>) => Promise<void>;
  deleteAction: (id: string) => Promise<void>;
}

export function PriceGroupsClient({
  initialData,
  createAction,
  updateAction,
  deleteAction,
}: PriceGroupsClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPriceGroup, setEditingPriceGroup] = useState<
    PriceGroup | undefined
  >();
  const [isPending, startTransition] = useTransition();

  function handleAdd() {
    setEditingPriceGroup(undefined);
    setDialogOpen(true);
  }

  function handleEdit(priceGroup: PriceGroup) {
    setEditingPriceGroup(priceGroup);
    setDialogOpen(true);
  }

  function handleSubmit(data: PriceGroupFormData) {
    startTransition(async () => {
      try {
        if (editingPriceGroup) {
          await updateAction(editingPriceGroup.id, data);
          toast.success("Price group updated");
        } else {
          await createAction(data);
          toast.success("Price group created");
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
        toast.success("Price group deleted");
      } catch {
        toast.error("Failed to delete price group");
      }
    });
  }

  return (
    <>
      <PageHeader
        title="Price Groups"
        subtitle="Manage price groups and their item associations"
        actions={
          <Button
            onClick={handleAdd}
            disabled={isPending}
            className="bg-gray-900 text-white rounded-xl gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Price Group
          </Button>
        }
      />

      <PriceGroupsTable
        data={initialData}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <PriceGroupFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        priceGroup={editingPriceGroup}
        onSubmit={handleSubmit}
      />
    </>
  );
}
