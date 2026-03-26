import { z } from "zod";

export const departmentSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  short_name: z.string().max(20).optional().nullable(),
  pcats_code: z.string().max(20).optional().nullable(),
  host_product_code: z.string().max(20).optional().nullable(),
  sales_restriction: z.string().optional().nullable(),
  taxes: z.array(z.string()).default([]),
  include_in_sales_report: z.boolean().default(true),
  include_in_shift_report: z.boolean().default(true),
  status: z.enum(["active", "inactive"]).default("active"),
  sort_order: z.coerce.number().int().default(0),
});

export type DepartmentFormData = z.infer<typeof departmentSchema>;
