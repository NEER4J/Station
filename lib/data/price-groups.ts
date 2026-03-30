import { createClient } from "@/lib/supabase/server";
import type { PriceGroup } from "@/types/database";

export async function getPriceGroups(stationId: string): Promise<PriceGroup[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("price_groups")
    .select("*")
    .eq("station_id", stationId)
    .order("description");
  if (error) throw error;

  const { data: links } = await supabase
    .from("price_group_items")
    .select("price_group_id");

  const countMap = new Map<string, number>();
  for (const row of links ?? []) {
    countMap.set(row.price_group_id, (countMap.get(row.price_group_id) ?? 0) + 1);
  }

  return (data ?? []).map((pg) => ({ ...pg, item_count: countMap.get(pg.id) ?? 0 }));
}

export async function createPriceGroup(
  stationId: string,
  data: Partial<PriceGroup>,
): Promise<PriceGroup> {
  const supabase = await createClient();
  const { data: result, error } = await supabase
    .from("price_groups")
    .insert({ ...data, station_id: stationId })
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function updatePriceGroup(
  id: string,
  data: Partial<PriceGroup>,
): Promise<PriceGroup> {
  const supabase = await createClient();
  const { data: result, error } = await supabase
    .from("price_groups")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function deletePriceGroup(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("price_groups").delete().eq("id", id);
  if (error) throw error;
}
