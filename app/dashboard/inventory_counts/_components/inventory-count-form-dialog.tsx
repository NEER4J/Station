"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  inventoryCountSchema,
  type InventoryCountFormData,
} from "@/lib/validations/inventory-counts";
import type { InventoryCount } from "@/types/database";
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

interface InventoryCountFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  count?: InventoryCount;
  onSubmit: (data: InventoryCountFormData) => void;
}

function toDatetimeLocal(value: string | null | undefined): string {
  if (!value) return "";
  try {
    const d = new Date(value);
    // Format: YYYY-MM-DDTHH:mm
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  } catch {
    return "";
  }
}

export function InventoryCountFormDialog({
  open,
  onOpenChange,
  count,
  onSubmit,
}: InventoryCountFormDialogProps) {
  const form = useForm<InventoryCountFormData>({
    resolver: zodResolver(inventoryCountSchema),
    defaultValues: {
      status: "draft",
      counted_at: "",
      posted_at: "",
    },
  });

  useEffect(() => {
    if (open && count) {
      form.reset({
        status: count.status,
        counted_at: toDatetimeLocal(count.counted_at),
        posted_at: toDatetimeLocal(count.posted_at),
      });
    } else if (open) {
      form.reset({
        status: "draft",
        counted_at: "",
        posted_at: "",
      });
    }
  }, [open, count, form]);

  function handleSubmit(data: InventoryCountFormData) {
    onSubmit(data);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>
            {count ? "Edit Inventory Count" : "New Inventory Count"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
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
                      <SelectItem value="counting">Counting</SelectItem>
                      <SelectItem value="posted">Posted</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="counted_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Counted At</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
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
              name="posted_at"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Posted At</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      value={field.value ?? ""}
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
                {count ? "Save Changes" : "Create Count"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
