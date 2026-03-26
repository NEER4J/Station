"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { Department } from "@/types/database";
import type { DepartmentFormData } from "@/lib/validations/departments";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { DepartmentsTable } from "./departments-table";
import { DepartmentFormDialog } from "./department-form-dialog";

interface DepartmentsClientProps {
  initialData: Department[];
  createAction: (data: Record<string, unknown>) => Promise<void>;
  updateAction: (id: string, data: Record<string, unknown>) => Promise<void>;
  deleteAction: (id: string) => Promise<void>;
}

export function DepartmentsClient({
  initialData,
  createAction,
  updateAction,
  deleteAction,
}: DepartmentsClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | undefined>();
  const [isPending, startTransition] = useTransition();

  function handleEdit(dept: Department) {
    setEditingDept(dept);
    setDialogOpen(true);
  }

  function handleAdd() {
    setEditingDept(undefined);
    setDialogOpen(true);
  }

  function handleSubmit(data: DepartmentFormData) {
    startTransition(async () => {
      try {
        if (editingDept) {
          await updateAction(editingDept.id, data);
          toast.success("Department updated");
        } else {
          await createAction(data);
          toast.success("Department created");
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
        toast.success("Department deleted");
      } catch {
        toast.error("Failed to delete department");
      }
    });
  }

  return (
    <>
      <PageHeader
        title="Departments"
        subtitle="Manage product departments"
        actions={
          <Button
            onClick={handleAdd}
            className="bg-gray-900 text-white rounded-xl gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Department
          </Button>
        }
      />

      <DepartmentsTable
        data={initialData}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <DepartmentFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        department={editingDept}
        onSubmit={handleSubmit}
      />
    </>
  );
}
