import { createClient } from "@/lib/supabase/server";
import type { ItemTransferOrder } from "@/types/database";

export async function getItemTransferOrders(stationId: string): Promise<ItemTransferOrder[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("item_transfer_orders")
    .select("*")
    .eq("station_id", stationId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function createItemTransferOrder(
  stationId: string,
  data: Partial<ItemTransferOrder>,
): Promise<ItemTransferOrder> {
  const supabase = await createClient();
  const { data: result, error } = await supabase
    .from("item_transfer_orders")
    .insert({ ...data, station_id: stationId })
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function updateItemTransferOrder(
  id: string,
  data: Partial<ItemTransferOrder>,
): Promise<ItemTransferOrder> {
  const supabase = await createClient();
  const { data: result, error } = await supabase
    .from("item_transfer_orders")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function deleteItemTransferOrder(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("item_transfer_orders").delete().eq("id", id);
  if (error) throw error;
}
