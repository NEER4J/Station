import { z } from "zod";

export const inventoryCountSchema = z.object({
  status: z.enum(["draft", "counting", "posted"]).default("draft"),
  counted_at: z.string().optional().nullable(),
  posted_at: z.string().optional().nullable(),
});

export type InventoryCountFormData = z.infer<typeof inventoryCountSchema>;
