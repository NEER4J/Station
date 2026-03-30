import { z } from "zod";

export const taxSchema = z.object({
  name: z.string().min(1, "Name is required").max(50),
  percentage: z.coerce.number().min(0).max(100).default(0),
  use_in_po: z.boolean().default(false),
  sort_order: z.coerce.number().int().default(0),
});

export type TaxFormData = z.infer<typeof taxSchema>;
