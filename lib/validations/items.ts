import { z } from "zod";

export const itemSchema = z.object({
  plu: z.string().max(20).optional().nullable(),
  upc: z.string().max(20).optional().nullable(),
  part_number: z.string().max(50).optional().nullable(),
  description: z.string().min(1, "Description is required").max(200),
  department_id: z.string().uuid().optional().nullable(),
  subdepartment_id: z.string().uuid().optional().nullable(),
  supplier_id: z.string().uuid().optional().nullable(),
  retail_price: z.coerce.number().min(0).default(0),
  bottle_deposit: z.coerce.number().min(0).default(0),
  tax_codes: z.array(z.string()).default([]),
  case_size: z.coerce.number().int().positive().optional().nullable(),
  case_cost: z.coerce.number().min(0).optional().nullable(),
  unit_cost: z.coerce.number().min(0).optional().nullable(),
  weighted_avg_cost: z.coerce.number().min(0).optional().nullable(),
  margin: z.coerce.number().optional().nullable(),
  status: z.enum(["active", "inactive"]).default("active"),
});

export type ItemFormData = z.infer<typeof itemSchema>;
