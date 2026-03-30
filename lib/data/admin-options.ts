import { createClient } from "@/lib/supabase/server";
import type { AdminOption } from "@/types/database";

export async function getAdminOptions(stationId: string): Promise<AdminOption[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("admin_options")
    .select("*")
    .eq("station_id", stationId)
    .order("key");
  if (error) throw error;
  return data ?? [];
}

export async function upsertAdminOption(
  stationId: string,
  key: string,
  value: string,
): Promise<AdminOption> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("admin_options")
    .upsert({ station_id: stationId, key, value }, { onConflict: "station_id,key" })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteAdminOption(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("admin_options").delete().eq("id", id);
  if (error) throw error;
}
