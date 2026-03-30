import { createClient } from "@/lib/supabase/server";
import type { ItemWriteOff } from "@/types/database";

export async function getItemWriteOffs(stationId: string): Promise<ItemWriteOff[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("item_write_offs")
    .select("*")
    .eq("station_id", stationId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createItemWriteOff(
  stationId: string,
  data: Partial<ItemWriteOff>,
): Promise<ItemWriteOff> {
  const supabase = await createClient();
  const { data: result, error } = await supabase
    .from("item_write_offs")
    .insert({ ...data, station_id: stationId })
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function updateItemWriteOff(
  id: string,
  data: Partial<ItemWriteOff>,
): Promise<ItemWriteOff> {
  const supabase = await createClient();
  const { data: result, error } = await supabase
    .from("item_write_offs")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function deleteItemWriteOff(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("item_write_offs").delete().eq("id", id);
  if (error) throw error;
}
