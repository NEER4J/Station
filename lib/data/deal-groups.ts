import { createClient } from "@/lib/supabase/server";
import type { DealGroup, DealGroupComponent } from "@/types/database";

export async function getDealGroups(stationId: string): Promise<DealGroup[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("deal_groups")
    .select("*")
    .eq("station_id", stationId)
    .order("name");
  if (error) throw error;

  const { data: components } = await supabase
    .from("deal_group_components")
    .select("deal_group_id");

  const countMap = new Map<string, number>();
  for (const row of components ?? []) {
    countMap.set(row.deal_group_id, (countMap.get(row.deal_group_id) ?? 0) + 1);
  }

  return (data ?? []).map((dg) => ({ ...dg, component_count: countMap.get(dg.id) ?? 0 }));
}

export async function getDealGroupComponents(dealGroupId: string): Promise<DealGroupComponent[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("deal_group_components")
    .select("*")
    .eq("deal_group_id", dealGroupId)
    .order("created_at");
  if (error) throw error;
  return data ?? [];
}

export async function createDealGroup(
  stationId: string,
  data: Partial<DealGroup>,
): Promise<DealGroup> {
  const supabase = await createClient();
  const { data: result, error } = await supabase
    .from("deal_groups")
    .insert({ ...data, station_id: stationId })
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function updateDealGroup(
  id: string,
  data: Partial<DealGroup>,
): Promise<DealGroup> {
  const supabase = await createClient();
  const { data: result, error } = await supabase
    .from("deal_groups")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function deleteDealGroup(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("deal_groups").delete().eq("id", id);
  if (error) throw error;
}

export async function addDealGroupComponent(
  dealGroupId: string,
  data: Partial<DealGroupComponent>,
): Promise<DealGroupComponent> {
  const supabase = await createClient();
  const { data: result, error } = await supabase
    .from("deal_group_components")
    .insert({ ...data, deal_group_id: dealGroupId })
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function deleteDealGroupComponent(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("deal_group_components").delete().eq("id", id);
  if (error) throw error;
}
