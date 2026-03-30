import { z } from "zod";

export const adminOptionSchema = z.object({
  key: z.string().min(1, "Key is required").max(100),
  value: z.string().max(500).default(""),
});

export type AdminOptionFormData = z.infer<typeof adminOptionSchema>;
