"use client";

import { useState, useTransition } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { TenderCoupon } from "@/types/database";
import type { TenderCouponFormData } from "@/lib/validations/tender-coupons";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/shared/page-header";
import { TenderCouponsTable } from "./tender-coupons-table";
import { TenderCouponFormDialog } from "./tender-coupon-form-dialog";

interface TenderCouponsClientProps {
  initialData: TenderCoupon[];
  createAction: (data: Record<string, unknown>) => Promise<void>;
  updateAction: (id: string, data: Record<string, unknown>) => Promise<void>;
  deleteAction: (id: string) => Promise<void>;
}

export function TenderCouponsClient({
  initialData,
  createAction,
  updateAction,
  deleteAction,
}: TenderCouponsClientProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<
    TenderCoupon | undefined
  >();
  const [isPending, startTransition] = useTransition();

  function handleEdit(coupon: TenderCoupon) {
    setEditingCoupon(coupon);
    setDialogOpen(true);
  }

  function handleAdd() {
    setEditingCoupon(undefined);
    setDialogOpen(true);
  }

  function handleSubmit(data: TenderCouponFormData) {
    startTransition(async () => {
      try {
        if (editingCoupon) {
          await updateAction(editingCoupon.id, data);
          toast.success("Tender coupon updated");
        } else {
          await createAction(data);
          toast.success("Tender coupon created");
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
        toast.success("Tender coupon deleted");
      } catch {
        toast.error("Failed to delete tender coupon");
      }
    });
  }

  return (
    <>
      <PageHeader
        title="Tender Coupons"
        subtitle="Manage coupon programs and discount rules"
        actions={
          <Button
            onClick={handleAdd}
            className="bg-gray-900 text-white rounded-xl gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Tender Coupon
          </Button>
        }
      />

      <TenderCouponsTable
        data={initialData}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      <TenderCouponFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        tenderCoupon={editingCoupon}
        onSubmit={handleSubmit}
      />
    </>
  );
}
