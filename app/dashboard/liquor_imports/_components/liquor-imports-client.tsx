"use client";

import { useState, useTransition } from "react";
import type { LiquorImport } from "@/types/database";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { LiquorImportsTable } from "./liquor-imports-table";
import { LiquorImportFormDialog } from "./liquor-import-form-dialog";

interface LiquorImportsClientProps {
  initialData: LiquorImport[];
  createAction: (data: Record<string, unknown>) => Promise<void>;
  deleteAction: (id: string) => Promise<void>;
}

export function LiquorImportsClient({
  initialData,
  createAction,
  deleteAction,
}: LiquorImportsClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleAdd() {
    setDialogOpen(true);
  }

  function handleDelete(liquorImport: LiquorImport) {
    if (!confirm(`Delete this liquor import batch?`)) return;
    startTransition(async () => {
      try {
        await deleteAction(liquorImport.id);
        toast.success("Liquor import deleted");
      } catch {
        toast.error("Failed to delete liquor import");
      }
    });
  }

  function handleSubmit(data: Record<string, unknown>) {
    startTransition(async () => {
      try {
        await createAction(data);
        toast.success("Liquor import created");
        setDialogOpen(false);
      } catch {
        toast.error("Failed to create liquor import");
      }
    });
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Liquor Imports"
        subtitle="Manage liquor price import batches"
        actions={
          <Button
            className="bg-gray-900 text-white rounded-xl"
            onClick={handleAdd}
            disabled={isPending}
          >
            <Plus className="mr-1.5 h-4 w-4" />
            New Import
          </Button>
        }
      />

      <LiquorImportsTable data={initialData} onDelete={handleDelete} />

      <LiquorImportFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSubmit={handleSubmit}
      />
    </div>
  );
}
