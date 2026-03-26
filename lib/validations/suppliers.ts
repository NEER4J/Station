import { z } from "zod";

export const supplierSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  account_number: z.string().max(50).optional().nullable(),
  primary_contact: z.string().max(100).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  address_line1: z.string().max(200).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  country: z.string().max(2).default("CA"),
  province: z.string().max(50).optional().nullable(),
  postal_code: z.string().max(10).optional().nullable(),
  status: z.enum(["active", "inactive"]).default("active"),
});

export type SupplierFormData = z.infer<typeof supplierSchema>;
