import { z } from "zod";

export const itemTransferOrderSchema = z.object({
  source_site: z.string().max(200).optional().nullable(),
  destination_site: z.string().max(200).optional().nullable(),
  status: z.enum(["draft", "submitted", "received", "cancelled"]).default("draft"),
});

export type ItemTransferOrderFormData = z.infer<typeof itemTransferOrderSchema>;
