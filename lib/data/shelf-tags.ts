import { createClient } from "@/lib/supabase/server";
import type { ShelfTag } from "@/types/database";

export async function getShelfTags(stationId: string): Promise<ShelfTag[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shelf_tags")
    .select("*, item:items(id, plu, upc, description, retail_price, unit_cost, case_size, case_cost)")
    .eq("station_id", stationId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createShelfTag(
  stationId: string,
  itemId: string,
  unitOrOrder: string = "EA",
): Promise<ShelfTag> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("shelf_tags")
    .insert({ station_id: stationId, item_id: itemId, unit_or_order: unitOrOrder })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateShelfTag(
  id: string,
  unitOrOrder: string,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("shelf_tags")
    .update({ unit_or_order: unitOrOrder })
    .eq("id", id);
  if (error) throw error;
}

export async function deleteShelfTag(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("shelf_tags").delete().eq("id", id);
  if (error) throw error;
}

export async function clearAllShelfTags(stationId: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("shelf_tags")
    .delete()
    .eq("station_id", stationId);
  if (error) throw error;
}
