import { z } from "zod";

export const dealGroupSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  availability: z.string().max(100).optional().nullable(),
  status: z.enum(["active", "inactive"]).default("active"),
});

export type DealGroupFormData = z.infer<typeof dealGroupSchema>;

export const dealGroupComponentSchema = z.object({
  description: z.string().min(1, "Description is required").max(200),
  component_type: z.string().max(50).optional().nullable(),
  amount: z.coerce.number().optional().nullable(),
});

export type DealGroupComponentFormData = z.infer<typeof dealGroupComponentSchema>;
