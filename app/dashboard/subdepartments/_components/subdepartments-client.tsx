"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { Department, Subdepartment } from "@/types/database";
import type { SubdepartmentFormData } from "@/lib/validations/subdepartments";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { SubdepartmentsTable } from "./subdepartments-table";
import { SubdepartmentFormDialog } from "./subdepartment-form-dialog";

interface SubdepartmentsClientProps {
  initialData: Subdepartment[];
  departments: Department[];
  createAction: (data: Record<string, unknown>) => Promise<void>;
  updateAction: (id: string, data: Record<string, unknown>) => Promise<void>;
  deleteAction: (id: string) => Promise<void>;
}

export function SubdepartmentsClient({
  initialData,
  departments,
  createAction,
  updateAction,
  deleteAction,
}: SubdepartmentsClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSubdept, setEditingSubdept] = useState<
    Subdepartment | undefined
  >();
  const [isPending, startTransition] = useTransition();

  function handleEdit(subdept: Subdepartment) {
    setEditingSubdept(subdept);
    setDialogOpen(true);
  }

  function handleAdd() {
    setEditingSubdept(undefined);
    setDialogOpen(true);
  }

  function handleSubmit(data: SubdepartmentFormData) {
    startTransition(async () => {
      try {
        if (editingSubdept) {
          await updateAction(editingSubdept.id, data);
          toast.success("Subdepartment updated");
        } else {
          await createAction(data);
          toast.success("Subdepartment created");
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
        toast.success("Subdepartment deleted");
      } catch {
        toast.error("Failed to delete subdepartment");
      }
    });
  }

  return (
    <>
      <PageHeader
        title="Subdepartments"
        subtitle="Manage product subdepartments"
        actions={
          <Button
            onClick={handleAdd}
            className="bg-gray-900 text-white rounded-xl gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Subdepartment
          </Button>
        }
      />

      <SubdepartmentsTable
        data={initialData}
        departments={departments}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <SubdepartmentFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        subdepartment={editingSubdept}
        departments={departments}
        onSubmit={handleSubmit}
      />
    </>
  );
}
