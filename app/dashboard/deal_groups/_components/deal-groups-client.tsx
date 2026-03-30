"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { DealGroup } from "@/types/database";
import type { DealGroupFormData } from "@/lib/validations/deal-groups";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { DealGroupsTable } from "./deal-groups-table";
import { DealGroupFormDialog } from "./deal-group-form-dialog";

interface DealGroupsClientProps {
  initialData: DealGroup[];
  createAction: (data: Record<string, unknown>) => Promise<void>;
  updateAction: (id: string, data: Record<string, unknown>) => Promise<void>;
  deleteAction: (id: string) => Promise<void>;
}

export function DealGroupsClient({
  initialData,
  createAction,
  updateAction,
  deleteAction,
}: DealGroupsClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDealGroup, setEditingDealGroup] = useState<
    DealGroup | undefined
  >();
  const [isPending, startTransition] = useTransition();

  function handleEdit(dealGroup: DealGroup) {
    setEditingDealGroup(dealGroup);
    setDialogOpen(true);
  }

  function handleAdd() {
    setEditingDealGroup(undefined);
    setDialogOpen(true);
  }

  function handleSubmit(data: DealGroupFormData) {
    startTransition(async () => {
      try {
        if (editingDealGroup) {
          await updateAction(editingDealGroup.id, data);
          toast.success("Deal group updated");
        } else {
          await createAction(data);
          toast.success("Deal group created");
        }
      } catch {
        toast.error("Something went wrong");
      }
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      try {
        await deleteAction(id);
        toast.success("Deal group deleted");
      } catch {
        toast.error("Failed to delete deal group");
      }
    });
  }

  return (
    <>
      <PageHeader
        title="Deal Groups"
        subtitle="Manage deal groups and promotional components"
        actions={
          <Button
            onClick={handleAdd}
            className="bg-gray-900 text-white rounded-xl gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Deal Group
          </Button>
        }
      />

      <DealGroupsTable
        data={initialData}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <DealGroupFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        dealGroup={editingDealGroup}
        onSubmit={handleSubmit}
      />
    </>
  );
}
