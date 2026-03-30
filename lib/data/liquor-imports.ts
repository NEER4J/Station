import { createClient } from "@/lib/supabase/server";
import type { LiquorImport } from "@/types/database";

export async function getLiquorImports(stationId: string): Promise<LiquorImport[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("liquor_imports")
    .select("*")
    .eq("station_id", stationId)
    .order("imported_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createLiquorImport(
  stationId: string,
  data: Partial<LiquorImport>,
): Promise<LiquorImport> {
  const supabase = await createClient();
  const { data: result, error } = await supabase
    .from("liquor_imports")
    .insert({ ...data, station_id: stationId })
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function deleteLiquorImport(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("liquor_imports").delete().eq("id", id);
  if (error) throw error;
}
