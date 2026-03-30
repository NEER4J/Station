"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { Vendor } from "@/types/database";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { VendorsTable } from "./vendors-table";
import { VendorFormDialog } from "./vendor-form-dialog";

interface Props {
  initialData: Vendor[];
  createAction: (data: Record<string, unknown>) => Promise<void>;
  updateAction: (id: string, data: Record<string, unknown>) => Promise<void>;
  deleteAction: (id: string) => Promise<void>;
}

export function VendorsClient({
  initialData,
  createAction,
  updateAction,
  deleteAction,
}: Props) {
  const [newCode, setNewCode] = useState("");
  const [newName, setNewName] = useState("");
  const [isPending, startTransition] = useTransition();
  const [editTarget, setEditTarget] = useState<Vendor | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  function handleQuickAdd() {
    if (!newCode.trim() || !newName.trim()) return;
    startTransition(async () => {
      try {
        await createAction({
          vendor_code: newCode.trim(),
          name: newName.trim(),
        });
        setNewCode("");
        setNewName("");
        toast.success("Vendor added");
      } catch {
        toast.error("Failed to add vendor");
      }
    });
  }

  function handleEdit(vendor: Vendor) {
    setEditTarget(vendor);
    setDialogOpen(true);
  }

  function handleDialogSave(data: { vendor_code: string; name: string }) {
    if (!editTarget) return;
    startTransition(async () => {
      try {
        await updateAction(editTarget.id, {
          vendor_code: data.vendor_code,
          name: data.name,
        });
        setDialogOpen(false);
        setEditTarget(null);
        toast.success("Vendor updated");
      } catch {
        toast.error("Failed to update vendor");
      }
    });
  }

  function handleDelete(id: string) {
    if (!confirm("Delete this vendor?")) return;
    startTransition(async () => {
      try {
        await deleteAction(id);
        toast.success("Vendor deleted");
      } catch {
        toast.error("Failed to delete vendor");
      }
    });
  }

  return (
    <div className="space-y-4">
      <PageHeader
        title="Vendors"
        subtitle="Manage vendor registry"
        backHref="/dashboard/administration"
      />

      {/* Quick-add row */}
      <div className="bg-white rounded-xl shadow-sm p-4 flex items-end gap-3">
        <div className="w-40">
          <Label className="text-xs text-gray-500 mb-1 block">Vendor ID</Label>
          <Input
            placeholder="e.g. VND-001"
            value={newCode}
            onChange={(e) => setNewCode(e.target.value)}
            className="bg-gray-100 border-0"
            onKeyDown={(e) => e.key === "Enter" && handleQuickAdd()}
          />
        </div>
        <div className="flex-1">
          <Label className="text-xs text-gray-500 mb-1 block">Name</Label>
          <Input
            placeholder="Vendor name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="bg-gray-100 border-0"
            onKeyDown={(e) => e.key === "Enter" && handleQuickAdd()}
          />
        </div>
        <Button
          onClick={handleQuickAdd}
          disabled={!newCode.trim() || !newName.trim() || isPending}
          className="bg-gray-900 text-white rounded-xl"
        >
          Add Vendor
        </Button>
      </div>

      <VendorsTable
        data={initialData}
        onEdit={handleEdit}
        onDelete={handleDelete}
        isPending={isPending}
      />

      <VendorFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        vendor={editTarget ?? undefined}
        onSave={handleDialogSave}
        isPending={isPending}
      />
    </div>
  );
}
