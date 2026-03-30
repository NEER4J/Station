import { z } from "zod";

export const itemListSchema = z.object({
  description: z.string().min(1, "Description is required").max(200),
  status: z.enum(["active", "inactive"]).default("active"),
  sort_order: z.coerce.number().int().default(0),
});

export type ItemListFormData = z.infer<typeof itemListSchema>;
