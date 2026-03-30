import { createClient } from "@/lib/supabase/server";
import type { Region } from "@/types/database";

export async function getRegions(): Promise<Region[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("regions")
    .select("*")
    .order("name");
  if (error) throw error;

  const { data: links } = await supabase
    .from("region_stations")
    .select("region_id");

  const countMap = new Map<string, number>();
  for (const row of links ?? []) {
    countMap.set(row.region_id, (countMap.get(row.region_id) ?? 0) + 1);
  }

  return (data ?? []).map((r) => ({ ...r, site_count: countMap.get(r.id) ?? 0 }));
}

export async function createRegion(data: Partial<Region>): Promise<Region> {
  const supabase = await createClient();
  const { data: result, error } = await supabase
    .from("regions")
    .insert(data)
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function updateRegion(id: string, data: Partial<Region>): Promise<Region> {
  const supabase = await createClient();
  const { data: result, error } = await supabase
    .from("regions")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function deleteRegion(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("regions").delete().eq("id", id);
  if (error) throw error;
}
