import { z } from "zod";

export const regionSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  category: z.string().max(100).optional().nullable(),
});

export type RegionFormData = z.infer<typeof regionSchema>;
