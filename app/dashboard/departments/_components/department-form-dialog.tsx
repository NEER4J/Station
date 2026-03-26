"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  departmentSchema,
  type DepartmentFormData,
} from "@/lib/validations/departments";
import type { Department } from "@/types/database";
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

interface DepartmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department?: Department;
  onSubmit: (data: DepartmentFormData) => void;
}

export function DepartmentFormDialog({
  open,
  onOpenChange,
  department,
  onSubmit,
}: DepartmentFormDialogProps) {
  const form = useForm<DepartmentFormData>({
    resolver: zodResolver(departmentSchema),
    defaultValues: {
      name: "",
      short_name: "",
      pcats_code: "",
      host_product_code: "",
      sales_restriction: "",
      taxes: [],
      include_in_sales_report: true,
      include_in_shift_report: true,
      status: "active",
      sort_order: 0,
    },
  });

  useEffect(() => {
    if (open && department) {
      form.reset({
        name: department.name,
        short_name: department.short_name ?? "",
        pcats_code: department.pcats_code ?? "",
        host_product_code: department.host_product_code ?? "",
        sales_restriction: department.sales_restriction ?? "",
        taxes: department.taxes ?? [],
        include_in_sales_report: department.include_in_sales_report,
        include_in_shift_report: department.include_in_shift_report,
        status: department.status,
        sort_order: department.sort_order,
      });
    } else if (open) {
      form.reset({
        name: "",
        short_name: "",
        pcats_code: "",
        host_product_code: "",
        sales_restriction: "",
        taxes: [],
        include_in_sales_report: true,
        include_in_shift_report: true,
        status: "active",
        sort_order: 0,
      });
    }
  }, [open, department, form]);

  function handleSubmit(data: DepartmentFormData) {
    onSubmit(data);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>
            {department ? "Edit Department" : "Add Department"}
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
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Department name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="short_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Short Name</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Short name"
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
                name="pcats_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>PCATS Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="PCATS / Conexxus"
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
                name="host_product_code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Host Product Code</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Host product code"
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
                name="sales_restriction"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sales Restriction</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. age-21"
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
                name="taxes"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Taxes (comma separated)</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="TAX1, TAX2"
                        value={(field.value ?? []).join(", ")}
                        onChange={(e) => {
                          const val = e.target.value;
                          field.onChange(
                            val
                              ? val.split(",").map((s) => s.trim()).filter(Boolean)
                              : [],
                          );
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="include_in_sales_report"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">
                      Include in sales report
                    </FormLabel>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="include_in_shift_report"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">
                      Include in shift report
                    </FormLabel>
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
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
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
                      <Input type="number" placeholder="0" {...field} />
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
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gray-900 text-white rounded-xl"
              >
                {department ? "Save Changes" : "Add Department"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
