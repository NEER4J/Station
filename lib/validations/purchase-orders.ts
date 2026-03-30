import { z } from "zod";

export const purchaseOrderSchema = z.object({
  supplier_id: z.string().uuid().optional().nullable(),
  invoice_number: z.string().max(100).optional().nullable(),
  invoice_date: z.string().optional().nullable(),
  expected_date: z.string().optional().nullable(),
  received_date: z.string().optional().nullable(),
  status: z.enum(["draft", "submitted", "received", "cancelled"]).default("draft"),
  subtotal: z.coerce.number().min(0).default(0),
  discount_amount: z.coerce.number().min(0).default(0),
  tax_amount: z.coerce.number().min(0).default(0),
  total: z.coerce.number().min(0).default(0),
});

export type PurchaseOrderFormData = z.infer<typeof purchaseOrderSchema>;
