import { z } from "zod";

export const itemWriteOffSchema = z.object({
  status: z.enum(["draft", "posted"]).default("draft"),
  total_amount: z.coerce.number().min(0, "Amount must be 0 or greater").default(0),
  posted_at: z.string().optional().nullable(),
});

export type ItemWriteOffFormData = z.infer<typeof itemWriteOffSchema>;
