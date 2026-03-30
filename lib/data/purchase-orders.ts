import { createClient } from "@/lib/supabase/server";
import type { PurchaseOrder } from "@/types/database";

export async function getPurchaseOrders(stationId: string): Promise<PurchaseOrder[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("purchase_orders")
    .select("*, supplier:suppliers(id, name)")
    .eq("station_id", stationId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as PurchaseOrder[];
}

export async function createPurchaseOrder(
  stationId: string,
  data: Partial<PurchaseOrder>,
): Promise<PurchaseOrder> {
  const supabase = await createClient();
  const { supplier: _s, ...insertData } = data as PurchaseOrder;
  const { data: result, error } = await supabase
    .from("purchase_orders")
    .insert({ ...insertData, station_id: stationId })
    .select("*, supplier:suppliers(id, name)")
    .single();
  if (error) throw error;
  return result as PurchaseOrder;
}

export async function updatePurchaseOrder(
  id: string,
  data: Partial<PurchaseOrder>,
): Promise<PurchaseOrder> {
  const supabase = await createClient();
  const { supplier: _s, ...updateData } = data as PurchaseOrder;
  const { data: result, error } = await supabase
    .from("purchase_orders")
    .update(updateData)
    .eq("id", id)
    .select("*, supplier:suppliers(id, name)")
    .single();
  if (error) throw error;
  return result as PurchaseOrder;
}

export async function deletePurchaseOrder(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("purchase_orders").delete().eq("id", id);
  if (error) throw error;
}
