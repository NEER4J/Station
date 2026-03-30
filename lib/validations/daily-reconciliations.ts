import { z } from "zod";

export const dailyReconciliationSchema = z.object({
  report_date: z.string().min(1, "Date is required"),
  shift_count: z.coerce.number().int().min(0).default(0),
  status: z.enum(["pending", "reconciled", "approved"]).default("pending"),
  fuel_volume: z.coerce.number().min(0).default(0),
  fuel_sales: z.coerce.number().min(0).default(0),
  store_sales: z.coerce.number().min(0).default(0),
  other_sales: z.coerce.number().min(0).default(0),
  taxes: z.coerce.number().min(0).default(0),
  non_cash_tender: z.coerce.number().min(0).default(0),
  deposits: z.coerce.number().min(0).default(0),
  payouts: z.coerce.number().min(0).default(0),
  over_short_volume: z.coerce.number().default(0),
  over_short_dollars: z.coerce.number().default(0),
});

export type DailyReconciliationFormData = z.infer<typeof dailyReconciliationSchema>;
