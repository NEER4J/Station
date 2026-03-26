"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  subdepartmentSchema,
  type SubdepartmentFormData,
} from "@/lib/validations/subdepartments";
import type { Department, Subdepartment } from "@/types/database";
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

interface SubdepartmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subdepartment?: Subdepartment;
  departments: Department[];
  onSubmit: (data: SubdepartmentFormData) => void;
}

export function SubdepartmentFormDialog({
  open,
  onOpenChange,
  subdepartment,
  departments,
  onSubmit,
}: SubdepartmentFormDialogProps) {
  const form = useForm<SubdepartmentFormData>({
    resolver: zodResolver(subdepartmentSchema),
    defaultValues: {
      name: "",
      department_id: "",
      gl_code: "",
      status: "active",
    },
  });

  useEffect(() => {
    if (open && subdepartment) {
      form.reset({
        name: subdepartment.name,
        department_id: subdepartment.department_id,
        gl_code: subdepartment.gl_code ?? "",
        status: subdepartment.status,
      });
    } else if (open) {
      form.reset({
        name: "",
        department_id: "",
        gl_code: "",
        status: "active",
      });
    }
  }, [open, subdepartment, form]);

  function handleSubmit(data: SubdepartmentFormData) {
    onSubmit(data);
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>
            {subdepartment ? "Edit Subdepartment" : "Add Subdepartment"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Subdepartment name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="department_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a department" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gl_code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>GL Code</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="GL code"
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
                {subdepartment ? "Save Changes" : "Add Subdepartment"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
