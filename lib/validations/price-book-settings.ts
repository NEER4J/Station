import { z } from "zod";

export const priceBookSettingSchema = z.object({
  category: z.enum(["payments", "host_product_codes", "item_locations"]),
  key: z.string().min(1, "Key is required").max(100),
  value: z.string().min(1, "Value is required").max(200),
  sort_order: z.coerce.number().int().default(0),
});

export type PriceBookSettingFormData = z.infer<typeof priceBookSettingSchema>;
