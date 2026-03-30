"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  dailyReconciliationSchema,
  type DailyReconciliationFormData,
} from "@/lib/validations/daily-reconciliations";
import type { DailyReconciliation } from "@/types/database";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReconciliationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reconciliation?: DailyReconciliation;
  onSubmit: (data: DailyReconciliationFormData) => void;
  isPending?: boolean;
}

const DEFAULT_VALUES: DailyReconciliationFormData = {
  report_date: "",
  shift_count: 0,
  status: "pending",
  fuel_volume: 0,
  fuel_sales: 0,
  store_sales: 0,
  other_sales: 0,
  taxes: 0,
  non_cash_tender: 0,
  deposits: 0,
  payouts: 0,
  over_short_volume: 0,
  over_short_dollars: 0,
};

export function ReconciliationFormDialog({
  open,
  onOpenChange,
  reconciliation,
  onSubmit,
  isPending,
}: ReconciliationFormDialogProps) {
  const isEditing = !!reconciliation;

  const form = useForm<DailyReconciliationFormData>({
    resolver: zodResolver(dailyReconciliationSchema),
    defaultValues: DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) {
      if (reconciliation) {
        form.reset({
          report_date: reconciliation.report_date,
          shift_count: reconciliation.shift_count,
          status: reconciliation.status,
          fuel_volume: reconciliation.fuel_volume,
          fuel_sales: reconciliation.fuel_sales,
          store_sales: reconciliation.store_sales,
          other_sales: reconciliation.other_sales,
          taxes: reconciliation.taxes,
          non_cash_tender: reconciliation.non_cash_tender,
          deposits: reconciliation.deposits,
          payouts: reconciliation.payouts,
          over_short_volume: reconciliation.over_short_volume,
          over_short_dollars: reconciliation.over_short_dollars,
        });
      } else {
        form.reset(DEFAULT_VALUES);
      }
    }
  }, [open, reconciliation, form]);

  function handleSubmit(data: DailyReconciliationFormData) {
    onSubmit(data);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Reconciliation" : "Create Reconciliation"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              {/* report_date — col-span-1 */}
              <FormField
                control={form.control}
                name="report_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Report Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* shift_count — col-span-1 */}
              <FormField
                control={form.control}
                name="shift_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shifts</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="0" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* status — col-span-2 */}
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Status</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="reconciled">Reconciled</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* fuel_volume */}
              <FormField
                control={form.control}
                name="fuel_volume"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fuel Volume (L)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* fuel_sales */}
              <FormField
                control={form.control}
                name="fuel_sales"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fuel Sales ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* store_sales */}
              <FormField
                control={form.control}
                name="store_sales"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store Sales ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* other_sales */}
              <FormField
                control={form.control}
                name="other_sales"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Other Sales ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* taxes */}
              <FormField
                control={form.control}
                name="taxes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Taxes ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* non_cash_tender */}
              <FormField
                control={form.control}
                name="non_cash_tender"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Non-Cash Tender ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* deposits */}
              <FormField
                control={form.control}
                name="deposits"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deposits ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* payouts */}
              <FormField
                control={form.control}
                name="payouts"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payouts ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* over_short_volume */}
              <FormField
                control={form.control}
                name="over_short_volume"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Over/Short Volume (L)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* over_short_dollars */}
              <FormField
                control={form.control}
                name="over_short_dollars"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Over/Short ($)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gray-900 text-white rounded-xl"
                disabled={isPending}
              >
                {isPending
                  ? "Saving..."
                  : isEditing
                    ? "Save Changes"
                    : "Create Report"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
