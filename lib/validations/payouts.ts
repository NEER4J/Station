import { z } from "zod";

export const payoutSchema = z.object({
  description: z.string().min(1, "Description is required").max(200),
  french_description: z.string().max(200).optional().nullable(),
  sort_order: z.coerce.number().int().default(0),
});

export type PayoutFormData = z.infer<typeof payoutSchema>;
