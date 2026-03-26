"use client";

import { useState, useTransition } from "react";
import type { Supplier } from "@/types/database";
import type { SupplierFormData } from "@/lib/validations/suppliers";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { SuppliersTable } from "./_components/suppliers-table";
import { SupplierFormDialog } from "./_components/supplier-form-dialog";

interface SuppliersClientProps {
  initialData: Supplier[];
  createAction: (data: SupplierFormData) => Promise<void>;
  updateAction: (id: string, data: SupplierFormData) => Promise<void>;
  deleteAction: (id: string) => Promise<void>;
}

export function SuppliersClient({
  initialData,
  createAction,
  updateAction,
  deleteAction,
}: SuppliersClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | undefined>(
    undefined,
  );
  const [isPending, startTransition] = useTransition();

  function handleAdd() {
    setEditingSupplier(undefined);
    setDialogOpen(true);
  }

  function handleEdit(supplier: Supplier) {
    setEditingSupplier(supplier);
    setDialogOpen(true);
  }

  function handleDelete(supplier: Supplier) {
    if (!confirm(`Delete supplier "${supplier.name}"?`)) return;
    startTransition(async () => {
      try {
        await deleteAction(supplier.id);
        toast.success("Supplier deleted");
      } catch {
        toast.error("Failed to delete supplier");
      }
    });
  }

  function handleToggleActive(id: string, active: boolean) {
    startTransition(async () => {
      try {
        await updateAction(id, { status: active ? "active" : "inactive" } as SupplierFormData);
        toast.success(`Supplier ${active ? "activated" : "deactivated"}`);
      } catch {
        toast.error("Failed to update supplier");
      }
    });
  }

  function handleSubmit(data: SupplierFormData) {
    startTransition(async () => {
      try {
        if (editingSupplier) {
          await updateAction(editingSupplier.id, data);
          toast.success("Supplier updated");
        } else {
          await createAction(data);
          toast.success("Supplier created");
        }
      } catch {
        toast.error("Failed to save supplier");
      }
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Suppliers"
        subtitle="Manage your product suppliers"
        actions={
          <Button
            className="bg-gray-900 text-white rounded-xl"
            onClick={handleAdd}
            disabled={isPending}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            Add Supplier
          </Button>
        }
      />

      <SuppliersTable
        data={initialData}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onToggleActive={handleToggleActive}
      />

      <SupplierFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        supplier={editingSupplier}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
