import { z } from "zod";

export const vendorSchema = z.object({
  vendor_code: z.string().min(1, "Vendor ID is required").max(50),
  name: z.string().min(1, "Name is required").max(200),
});

export type VendorFormData = z.infer<typeof vendorSchema>;
