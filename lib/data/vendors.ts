import { createClient } from "@/lib/supabase/server";
import type { Vendor } from "@/types/database";

export async function getVendors(stationId: string): Promise<Vendor[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("vendors")
    .select("*")
    .eq("station_id", stationId)
    .order("vendor_code");
  if (error) throw error;
  return data ?? [];
}

export async function createVendor(stationId: string, data: Partial<Vendor>): Promise<Vendor> {
  const supabase = await createClient();
  const { data: result, error } = await supabase
    .from("vendors")
    .insert({ ...data, station_id: stationId })
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function updateVendor(id: string, data: Partial<Vendor>): Promise<Vendor> {
  const supabase = await createClient();
  const { data: result, error } = await supabase
    .from("vendors")
    .update(data)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return result;
}

export async function deleteVendor(id: string): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("vendors").delete().eq("id", id);
  if (error) throw error;
}
