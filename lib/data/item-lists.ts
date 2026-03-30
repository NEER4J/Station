import { createClient } from "@/lib/supabase/server";
import type { ItemList } from "@/types/database";

export async function getItemLists(stationId: string): Promise<ItemList[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("item_lists")
    .select("*")
    .eq("station_id", stationId)
    .order("sort_order")
    .order("description");
  if (error) throw error;

  const { data: links } = await supabase
    .from("item_list_deal_groups")
    .select("item_list_id");

  const countMap = new Map<string, number>();
  for (const row of links ?? []) {
    countMap.set(row.item_list_id, (countMap.get(row.item_list_id) ?? 0) + 1);
  }

  return (data ?? []).map((il) => ({ ...il, deal_group_count: countMap.get(il.id) ?? 0 }));
}

export async function createItemList(
  stationId: string,
  data: Partial<ItemList>,
): Promise<ItemList> {
  const supabase = await createClient();
  const { data: result, error } = await supabase
    .from("item_lists")
    .insert({ ...data, station_id: stationId })
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function updateItemList(
  id: string,
  data: Partial<ItemList>,
): Promise<ItemList> {
  const supabase = await createClient();
  const { data: result, error } = await supabase
    .from("item_lists")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function deleteItemList(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("item_lists").delete().eq("id", id);
  if (error) throw error;
}
