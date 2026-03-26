import { createClient } from "@/lib/supabase/server";
import type { Payout } from "@/types/database";

export async function getPayouts(stationId: string): Promise<Payout[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("payouts")
    .select("*")
    .eq("station_id", stationId)
    .order("sort_order")
    .order("description");
  if (error) throw error;
  return data ?? [];
}

export async function createPayout(
  stationId: string,
  data: Partial<Payout>,
): Promise<Payout> {
  const supabase = await createClient();
  const { data: result, error } = await supabase
    .from("payouts")
    .insert({ ...data, station_id: stationId })
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function updatePayout(
  id: string,
  data: Partial<Payout>,
): Promise<Payout> {
  const supabase = await createClient();
  const { data: result, error } = await supabase
    .from("payouts")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function deletePayout(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("payouts").delete().eq("id", id);
  if (error) throw error;
}
