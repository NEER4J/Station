"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  tenderCouponSchema,
  type TenderCouponFormData,
} from "@/lib/validations/tender-coupons";
import type { TenderCoupon } from "@/types/database";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

interface TenderCouponFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tenderCoupon?: TenderCoupon;
  onSubmit: (data: TenderCouponFormData) => void;
}

export function TenderCouponFormDialog({
  open,
  onOpenChange,
  tenderCoupon,
  onSubmit,
}: TenderCouponFormDialogProps) {
  const form = useForm<TenderCouponFormData>({
    resolver: zodResolver(tenderCouponSchema),
    defaultValues: {
      description: "",
      type_of_discount: "fixed",
      amount: 0,
      max_per_customer: 1,
      upc: "",
      start_date: "",
      end_date: "",
      prompt_for_amount: false,
      available_always: false,
      is_disabled: false,
    },
  });

  useEffect(() => {
    if (open && tenderCoupon) {
      form.reset({
        description: tenderCoupon.description,
        type_of_discount: tenderCoupon.type_of_discount,
        amount: tenderCoupon.amount,
        max_per_customer: tenderCoupon.max_per_customer,
        upc: tenderCoupon.upc ?? "",
        start_date: tenderCoupon.start_date ?? "",
        end_date: tenderCoupon.end_date ?? "",
        prompt_for_amount: tenderCoupon.prompt_for_amount,
        available_always: tenderCoupon.available_always,
        is_disabled: tenderCoupon.is_disabled,
      });
    } else if (open) {
      form.reset({
        description: "",
        type_of_discount: "fixed",
        amount: 0,
        max_per_customer: 1,
        upc: "",
        start_date: "",
        end_date: "",
        prompt_for_amount: false,
        available_always: false,
        is_disabled: false,
      });
    }
  }, [open, tenderCoupon, form]);

  function handleSubmit(data: TenderCouponFormData) {
    onSubmit(data);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle>
            {tenderCoupon ? "Edit Tender Coupon" : "Add Tender Coupon"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Input placeholder="Coupon description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="type_of_discount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Discount Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="fixed">Fixed</SelectItem>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="amount_off">Amount Off</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_per_customer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Max Per Customer</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        placeholder="1"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="upc"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>UPC</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="UPC code"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="end_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="prompt_for_amount"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value as boolean}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">
                      Prompt for Amount
                    </FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="available_always"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value as boolean}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">
                      Available Always
                    </FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_disabled"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value as boolean}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">
                      Disabled
                    </FormLabel>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gray-900 text-white rounded-xl"
              >
                {tenderCoupon ? "Save Changes" : "Add Tender Coupon"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
