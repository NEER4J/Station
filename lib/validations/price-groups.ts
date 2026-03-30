import { z } from "zod";

export const priceGroupSchema = z.object({
  description: z.string().min(1, "Description is required").max(200),
  availability: z.string().max(100).optional().nullable(),
  unit_price: z.coerce.number().min(0, "Price must be 0 or greater").default(0),
  status: z.enum(["active", "inactive"]).default("active"),
});

export type PriceGroupFormData = z.infer<typeof priceGroupSchema>;
