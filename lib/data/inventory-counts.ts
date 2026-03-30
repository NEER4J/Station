import { createClient } from "@/lib/supabase/server";
import type { InventoryCount } from "@/types/database";

export async function getInventoryCounts(stationId: string): Promise<InventoryCount[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inventory_counts")
    .select("*")
    .eq("station_id", stationId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createInventoryCount(
  stationId: string,
  data: Partial<InventoryCount>,
): Promise<InventoryCount> {
  const supabase = await createClient();
  const { data: result, error } = await supabase
    .from("inventory_counts")
    .insert({ ...data, station_id: stationId })
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function updateInventoryCount(
  id: string,
  data: Partial<InventoryCount>,
): Promise<InventoryCount> {
  const supabase = await createClient();
  const { data: result, error } = await supabase
    .from("inventory_counts")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function deleteInventoryCount(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("inventory_counts").delete().eq("id", id);
  if (error) throw error;
}
