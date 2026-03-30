"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import type { SiteWithDetails } from "@/lib/data/site-details";
import { SitesTable } from "./sites-table";
import { SiteDetailFormDialog } from "./site-detail-form-dialog";

interface Props {
  initialData: SiteWithDetails[];
  updateAction: (
    stationId: string,
    data: Record<string, unknown>,
  ) => Promise<void>;
}

export function SitesClient({ initialData, updateAction }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<SiteWithDetails | undefined>(
    undefined,
  );
  const [isPending, startTransition] = useTransition();

  function handleEdit(site: SiteWithDetails) {
    setEditingSite(site);
    setDialogOpen(true);
  }

  function handleSubmit(data: Record<string, unknown>) {
    if (!editingSite) return;
    startTransition(async () => {
      try {
        await updateAction(editingSite.id, data);
        toast.success("Site details updated");
        setDialogOpen(false);
        setEditingSite(undefined);
      } catch {
        toast.error("Failed to update site details");
      }
    });
  }

  return (
    <>
      <SitesTable data={initialData} onEdit={handleEdit} />
      <SiteDetailFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        site={editingSite}
        onSubmit={handleSubmit}
        isPending={isPending}
      />
    </>
  );
}
