import { z } from "zod";

export const tenderCouponSchema = z.object({
  description: z.string().min(1, "Description is required").max(200),
  type_of_discount: z.enum(["fixed", "percentage", "amount_off"]).default("fixed"),
  amount: z.coerce.number().min(0, "Amount must be 0 or greater").default(0),
  prompt_for_amount: z.boolean().default(false),
  max_per_customer: z.coerce.number().int().min(0).default(1),
  available_always: z.boolean().default(false),
  start_date: z.string().optional().nullable(),
  end_date: z.string().optional().nullable(),
  is_disabled: z.boolean().default(false),
  upc: z.string().max(50).optional().nullable(),
});

export type TenderCouponFormData = z.infer<typeof tenderCouponSchema>;
