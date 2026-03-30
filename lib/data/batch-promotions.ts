import { createClient } from "@/lib/supabase/server";
import type { BatchPromotion, Item } from "@/types/database";

export async function getBatchPromotions(stationId: string): Promise<BatchPromotion[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("batch_promotions")
    .select("*")
    .eq("station_id", stationId)
    .order("created_at", { ascending: false });
  if (error) throw error;

  const { data: links } = await supabase
    .from("batch_promotion_items")
    .select("batch_promotion_id");

  const countMap = new Map<string, number>();
  for (const row of links ?? []) {
    countMap.set(row.batch_promotion_id, (countMap.get(row.batch_promotion_id) ?? 0) + 1);
  }

  return (data ?? []).map((bp) => ({ ...bp, item_count: countMap.get(bp.id) ?? 0 }));
}

export async function getBatchPromotionItems(batchPromotionId: string): Promise<Item[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("batch_promotion_items")
    .select("item:items(*)")
    .eq("batch_promotion_id", batchPromotionId);
  if (error) throw error;
  return (data ?? []).map((row) => row.item as unknown as Item);
}

export async function createBatchPromotion(
  stationId: string,
  data: Partial<BatchPromotion>,
): Promise<BatchPromotion> {
  const supabase = await createClient();
  const { data: result, error } = await supabase
    .from("batch_promotions")
    .insert({ ...data, station_id: stationId })
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function updateBatchPromotion(
  id: string,
  data: Partial<BatchPromotion>,
): Promise<BatchPromotion> {
  const supabase = await createClient();
  const { data: result, error } = await supabase
    .from("batch_promotions")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function deleteBatchPromotion(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("batch_promotions").delete().eq("id", id);
  if (error) throw error;
}

export async function addBatchPromotionItem(
  batchPromotionId: string,
  itemId: string,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("batch_promotion_items")
    .insert({ batch_promotion_id: batchPromotionId, item_id: itemId });
  if (error) throw error;
}

export async function removeBatchPromotionItem(
  batchPromotionId: string,
  itemId: string,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("batch_promotion_items")
    .delete()
    .eq("batch_promotion_id", batchPromotionId)
    .eq("item_id", itemId);
  if (error) throw error;
}
