"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  itemTransferOrderSchema,
  type ItemTransferOrderFormData,
} from "@/lib/validations/item-transfer-orders";
import type { ItemTransferOrder } from "@/types/database";
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
import { Button } from "@/components/ui/button";

interface ItemTransferOrderFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  order?: ItemTransferOrder;
  onSubmit: (data: ItemTransferOrderFormData) => void;
}

export function ItemTransferOrderFormDialog({
  open,
  onOpenChange,
  order,
  onSubmit,
}: ItemTransferOrderFormDialogProps) {
  const form = useForm<ItemTransferOrderFormData>({
    resolver: zodResolver(itemTransferOrderSchema),
    defaultValues: {
      source_site: "",
      destination_site: "",
      status: "draft",
    },
  });

  useEffect(() => {
    if (open && order) {
      form.reset({
        source_site: order.source_site ?? "",
        destination_site: order.destination_site ?? "",
        status: order.status,
      });
    } else if (open) {
      form.reset({
        source_site: "",
        destination_site: "",
        status: "draft",
      });
    }
  }, [open, order, form]);

  function handleSubmit(data: ItemTransferOrderFormData) {
    onSubmit(data);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {order ? "Edit Transfer Order" : "New Transfer Order"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="source_site"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Source Site</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Source site name or ID"
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
              name="destination_site"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Destination Site</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Destination site name or ID"
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
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="received">Received</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
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
                {order ? "Save Changes" : "Create Order"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
