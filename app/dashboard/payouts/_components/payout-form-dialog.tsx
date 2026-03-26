"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  payoutSchema,
  type PayoutFormData,
} from "@/lib/validations/payouts";
import type { Payout } from "@/types/database";
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

interface PayoutFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payout?: Payout;
  onSubmit: (data: PayoutFormData) => void;
}

export function PayoutFormDialog({
  open,
  onOpenChange,
  payout,
  onSubmit,
}: PayoutFormDialogProps) {
  const isEditing = !!payout;

  const form = useForm<PayoutFormData>({
    resolver: zodResolver(payoutSchema),
    defaultValues: {
      description: "",
      french_description: "",
      sort_order: 0,
    },
  });

  useEffect(() => {
    if (open) {
      if (payout) {
        form.reset({
          description: payout.description,
          french_description: payout.french_description ?? "",
          sort_order: payout.sort_order,
        });
      } else {
        form.reset({
          description: "",
          french_description: "",
          sort_order: 0,
        });
      }
    }
  }, [open, payout, form]);

  function handleSubmit(data: PayoutFormData) {
    onSubmit(data);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit Payout" : "Add Payout"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Input placeholder="Payout description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="french_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>French Description</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Description en fran\u00e7ais"
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
              name="sort_order"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sort Order</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="0"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                {isEditing ? "Save Changes" : "Add Payout"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
