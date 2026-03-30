import { createClient } from "@/lib/supabase/server";
import type { DailyReconciliation } from "@/types/database";

export async function getDailyReconciliations(
  stationId: string,
  filters?: { from?: string; to?: string; status?: string },
): Promise<DailyReconciliation[]> {
  const supabase = await createClient();
  let query = supabase
    .from("daily_reconciliations")
    .select("*")
    .eq("station_id", stationId)
    .order("report_date", { ascending: false });

  if (filters?.from) query = query.gte("report_date", filters.from);
  if (filters?.to) query = query.lte("report_date", filters.to);
  if (filters?.status && filters.status !== "all") query = query.eq("status", filters.status);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

export async function createDailyReconciliation(
  stationId: string,
  data: Partial<DailyReconciliation>,
): Promise<DailyReconciliation> {
  const supabase = await createClient();
  const { data: result, error } = await supabase
    .from("daily_reconciliations")
    .insert({ ...data, station_id: stationId })
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function updateDailyReconciliation(
  id: string,
  data: Partial<DailyReconciliation>,
): Promise<DailyReconciliation> {
  const supabase = await createClient();
  const { data: result, error } = await supabase
    .from("daily_reconciliations")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function deleteDailyReconciliation(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("daily_reconciliations").delete().eq("id", id);
  if (error) throw error;
}
