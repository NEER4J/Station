import { createClient } from "@/lib/supabase/server";
import type { Tax } from "@/types/database";

export async function getTaxes(stationId: string): Promise<Tax[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("taxes")
    .select("*")
    .eq("station_id", stationId)
    .order("sort_order")
    .order("name");
  if (error) throw error;
  return data ?? [];
}

export async function createTax(stationId: string, data: Partial<Tax>): Promise<Tax> {
  const supabase = await createClient();
  const { data: result, error } = await supabase
    .from("taxes")
    .insert({ ...data, station_id: stationId })
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function updateTax(id: string, data: Partial<Tax>): Promise<Tax> {
  const supabase = await createClient();
  const { data: result, error } = await supabase
    .from("taxes")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function deleteTax(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("taxes").delete().eq("id", id);
  if (error) throw error;
}
