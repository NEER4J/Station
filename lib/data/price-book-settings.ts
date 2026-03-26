import { createClient } from "@/lib/supabase/server";
import type { PriceBookSetting } from "@/types/database";

export async function getPriceBookSettings(
  stationId: string,
): Promise<PriceBookSetting[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("price_book_settings")
    .select("*")
    .eq("station_id", stationId)
    .order("category")
    .order("sort_order");
  if (error) throw error;
  return data ?? [];
}

export async function upsertPriceBookSetting(
  stationId: string,
  data: Partial<PriceBookSetting>,
): Promise<PriceBookSetting> {
  const supabase = await createClient();
  const { data: result, error } = await supabase
    .from("price_book_settings")
    .upsert(
      { ...data, station_id: stationId },
      { onConflict: "station_id,category,key" },
    )
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function deletePriceBookSetting(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("price_book_settings")
    .delete()
    .eq("id", id);
  if (error) throw error;
}
