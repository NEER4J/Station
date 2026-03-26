import { createClient } from "@/lib/supabase/server";
import type { Supplier } from "@/types/database";

export async function getSuppliers(stationId: string): Promise<Supplier[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("suppliers")
    .select("*")
    .eq("station_id", stationId)
    .order("name");

  if (error) throw error;

  const { data: counts } = await supabase
    .from("items")
    .select("supplier_id")
    .eq("station_id", stationId);

  const countMap = new Map<string, number>();
  for (const row of counts ?? []) {
    if (row.supplier_id) {
      countMap.set(row.supplier_id, (countMap.get(row.supplier_id) ?? 0) + 1);
    }
  }

  return (data ?? []).map((s) => ({
    ...s,
    item_count: countMap.get(s.id) ?? 0,
  }));
}

export async function createSupplier(
  stationId: string,
  data: Partial<Supplier>,
): Promise<Supplier> {
  const supabase = await createClient();
  const { data: result, error } = await supabase
    .from("suppliers")
    .insert({ ...data, station_id: stationId })
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function updateSupplier(
  id: string,
  data: Partial<Supplier>,
): Promise<Supplier> {
  const supabase = await createClient();
  const { data: result, error } = await supabase
    .from("suppliers")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function deleteSupplier(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("suppliers").delete().eq("id", id);
  if (error) throw error;
}
