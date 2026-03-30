"use client";

import { useState, useMemo, useTransition } from "react";
import { Plus } from "lucide-react";
import type { DailyReconciliation } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ReconciliationsTable } from "./reconciliations-table";
import { ReconciliationFormDialog } from "./reconciliation-form-dialog";
import { ReconciliationSummary } from "./reconciliation-summary";
import type { DailyReconciliationFormData } from "@/lib/validations/daily-reconciliations";

interface ReconciliationsClientProps {
  initialData: DailyReconciliation[];
  createAction: (data: Record<string, unknown>) => Promise<void>;
  updateAction: (id: string, data: Record<string, unknown>) => Promise<void>;
  deleteAction: (id: string) => Promise<void>;
}

export function ReconciliationsClient({
  initialData,
  createAction,
  updateAction,
  deleteAction,
}: ReconciliationsClientProps) {
  const [searchDate, setSearchDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingRecon, setEditingRecon] = useState<
    DailyReconciliation | undefined
  >(undefined);
  const [isPending, startTransition] = useTransition();

  const filteredData = useMemo(() => {
    return initialData.filter((r) => {
      if (searchDate && r.report_date < searchDate) return false;
      if (toDate && r.report_date > toDate) return false;
      if (statusFilter !== "all" && r.status !== statusFilter) return false;
      return true;
    });
  }, [initialData, searchDate, toDate, statusFilter]);

  function handleAdd() {
    setEditingRecon(undefined);
    setDialogOpen(true);
  }

  function handleEdit(recon: DailyReconciliation) {
    setEditingRecon(recon);
    setDialogOpen(true);
  }

  function handleDelete(recon: DailyReconciliation) {
    startTransition(async () => {
      try {
        await deleteAction(recon.id);
        toast.success("Reconciliation deleted");
      } catch {
        toast.error("Failed to delete reconciliation");
      }
    });
  }

  function handleSubmit(data: DailyReconciliationFormData) {
    startTransition(async () => {
      try {
        if (editingRecon) {
          await updateAction(editingRecon.id, data as Record<string, unknown>);
          toast.success("Reconciliation updated");
        } else {
          await createAction(data as Record<string, unknown>);
          toast.success("Reconciliation created");
        }
        setDialogOpen(false);
      } catch {
        toast.error(
          editingRecon
            ? "Failed to update reconciliation"
            : "Failed to create reconciliation",
        );
      }
    });
  }

  return (
    <div className="flex gap-6 items-start">
      {/* Left: filter bar + table */}
      <div className="flex-1 min-w-0 space-y-4">
        {/* Filter bar */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Label className="text-xs text-gray-500 shrink-0">From</Label>
            <Input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="h-9 bg-white rounded-xl border-gray-200 text-sm w-36"
            />
          </div>
          <div className="flex items-center gap-2">
            <Label className="text-xs text-gray-500 shrink-0">To</Label>
            <Input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="h-9 bg-white rounded-xl border-gray-200 text-sm w-36"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-9 bg-white rounded-xl border-gray-200 text-sm w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="reconciled">Reconciled</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
            </SelectContent>
          </Select>
          <div className="ml-auto">
            <Button
              onClick={handleAdd}
              className="bg-gray-900 text-white rounded-xl gap-2"
              disabled={isPending}
            >
              <Plus className="h-4 w-4" />
              Create Report
            </Button>
          </div>
        </div>

        {/* Table */}
        <ReconciliationsTable
          data={filteredData}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Right: summary sidebar */}
      <div className="w-72 shrink-0">
        <ReconciliationSummary data={filteredData} />
      </div>

      {/* Dialog */}
      <ReconciliationFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        reconciliation={editingRecon}
        onSubmit={handleSubmit}
        isPending={isPending}
      />
    </div>
  );
}
