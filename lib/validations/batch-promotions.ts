import { z } from "zod";

export const batchPromotionSchema = z.object({
  promotion_price: z.coerce.number().min(0, "Price must be 0 or greater"),
  comments: z.string().max(500).optional().nullable(),
  start_date: z.string().min(1, "Start date is required"),
  end_date: z.string().min(1, "End date is required"),
  status: z.enum(["draft", "active", "expired"]).default("draft"),
});

export type BatchPromotionFormData = z.infer<typeof batchPromotionSchema>;
