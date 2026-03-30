import { createClient } from "@/lib/supabase/server";
import type { InventoryConfig } from "@/types/database";

export async function getInventoryConfig(stationId: string): Promise<InventoryConfig | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inventory_config")
    .select("*")
    .eq("station_id", stationId)
    .single();
  if (error && error.code !== "PGRST116") throw error;
  return data ?? null;
}

export async function upsertInventoryConfig(
  stationId: string,
  settings: Record<string, unknown>,
): Promise<InventoryConfig> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("inventory_config")
    .upsert({ station_id: stationId, settings }, { onConflict: "station_id" })
    .select()
    .single();
  if (error) throw error;
  return data;
}
